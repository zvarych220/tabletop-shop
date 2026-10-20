<?php
/**
 * Product Model
 * Dice & Deck Tabletop Shop
 */

require_once __DIR__ . '/../../config/database.php';

class Product
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDbConnection();
    }

    /**
     * Get all products with filters
     *
     * @param array $filters
     * @return array
     */
    public function getAll(array $filters = []): array
    {
        $whereSql = ' WHERE 1=1';
        $params = [];

        // Search filter (title, category, description)
        $search = $filters['search'] ?? $filters['q'] ?? null;
        if (!empty($search)) {
            $whereSql .= ' AND (title LIKE ? OR category LIKE ? OR description LIKE ?)';
            $searchTerm = '%' . trim($search) . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Category filter
        $category = $filters['category'] ?? $filters['cat'] ?? null;
        if (!empty($category) && $category !== 'all') {
            $whereSql .= ' AND category = ?';
            $params[] = $category;
        }

        // Price range filters
        $minPrice = $filters['minPrice'] ?? $filters['minP'] ?? null;
        if ($minPrice !== null && $minPrice !== '' && is_numeric($minPrice) && (float)$minPrice > 0) {
            $whereSql .= ' AND price >= ?';
            $params[] = (float) $minPrice;
        }

        $maxPrice = $filters['maxPrice'] ?? $filters['maxP'] ?? null;
        if ($maxPrice !== null && $maxPrice !== '' && is_numeric($maxPrice) && (float)$maxPrice > 0) {
            $whereSql .= ' AND price <= ?';
            $params[] = (float) $maxPrice;
        }

        // Minimum rating filter
        $minRating = $filters['minRating'] ?? $filters['rating'] ?? null;
        if ($minRating !== null && $minRating !== '' && is_numeric($minRating) && (float)$minRating > 0) {
            $whereSql .= ' AND rating >= ?';
            $params[] = (float) $minRating;
        }

        // Availability filter
        $available = $filters['available'] ?? $filters['inStock'] ?? null;
        if (!empty($available) && ($available === '1' || $available === 1 || $available === true || $available === 'true')) {
            $whereSql .= ' AND in_stock = 1 AND stock_quantity > 0';
        }

        // Stock status filter (for admin dashboard / products list)
        if (!empty($filters['stock'])) {
            switch ($filters['stock']) {
                case 'inStock':
                    $whereSql .= ' AND stock_quantity > 5';
                    break;
                case 'lowStock':
                    $whereSql .= ' AND stock_quantity BETWEEN 1 AND 5';
                    break;
                case 'outOfStock':
                    $whereSql .= ' AND stock_quantity = 0';
                    break;
            }
        }

        // Total count matching filters
        $countSql = "SELECT COUNT(*) FROM products $whereSql";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        // Sorting
        $sort = $filters['sort'] ?? 'created_at-desc';
        $orderSql = '';
        switch ($sort) {
            case 'price-asc':
                $orderSql = ' ORDER BY price ASC';
                break;
            case 'price-desc':
                $orderSql = ' ORDER BY price DESC';
                break;
            case 'rating':
            case 'rating-desc':
                $orderSql = ' ORDER BY rating DESC, rating_count DESC';
                break;
            case 'rating-asc':
                $orderSql = ' ORDER BY rating ASC, rating_count ASC';
                break;
            case 'title':
            case 'name-asc':
                $orderSql = ' ORDER BY title ASC';
                break;
            case 'stock-desc':
                $orderSql = ' ORDER BY stock_quantity DESC';
                break;
            default:
                $orderSql = ' ORDER BY created_at DESC';
        }

        // Pagination calculation
        $isAll = !empty($filters['all']) || (isset($filters['limit']) && ($filters['limit'] === 'all' || (int)$filters['limit'] === 0));

        $page = max(1, (int)($filters['page'] ?? 1));
        $limit = $isAll ? max(1, $total) : max(1, min(100, (int)($filters['limit'] ?? 8)));
        $totalPages = $total > 0 && $limit > 0 ? (int)ceil($total / $limit) : 1;
        $offset = ($page - 1) * $limit;

        $sql = "SELECT * FROM products $whereSql $orderSql";
        if (!$isAll && $limit > 0) {
            $sql .= " LIMIT $limit OFFSET $offset";
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll();

        // Attach images to each product
        foreach ($products as &$product) {
            $product['images'] = $this->getProductImages($product['id']);
            $product = $this->formatProduct($product);
        }

        return [
            'products' => $products,
            'pagination' => [
                'page' => $page,
                'limit' => $isAll ? $total : $limit,
                'total' => $total,
                'totalPages' => $totalPages,
                'hasNextPage' => $page < $totalPages,
                'hasPrevPage' => $page > 1,
            ]
        ];
    }

    /**
     * Find product by ID
     *
     * @param string $id
     * @return array|null
     */
    public function findById(string $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM products WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $product = $stmt->fetch();

        if (!$product) {
            return null;
        }

        $product['images'] = $this->getProductImages($product['id']);
        return $this->formatProduct($product);
    }

    /**
     * Get product images
     *
     * @param string $productId
     * @return array
     */
    public function getProductImages(string $productId): array
    {
        $stmt = $this->db->prepare('
            SELECT id, url, is_primary as isPrimary
            FROM product_images
            WHERE product_id = ?
            ORDER BY is_primary DESC, created_at ASC
        ');
        $stmt->execute([$productId]);
        $images = $stmt->fetchAll();

        foreach ($images as &$image) {
            $image['isPrimary'] = (bool) $image['isPrimary'];
        }

        return $images;
    }

    /**
     * Create new product
     *
     * @param array $data
     * @return array
     */
    public function create(array $data): array
    {
        $id = $this->generateProductId();

        // Calculate stock status
        $inStock = ($data['stockQuantity'] ?? 0) > 0 ? 1 : 0;

        // Calculate discount if oldPrice provided
        $discount = null;
        if (!empty($data['oldPrice']) && $data['oldPrice'] > $data['price']) {
            $discountPercent = round((($data['oldPrice'] - $data['price']) / $data['oldPrice']) * 100);
            $discount = "-{$discountPercent}%";
        }

        $stmt = $this->db->prepare('
            INSERT INTO products (
                id, title, category, players, play_time, price, old_price, discount,
                in_stock, stock_quantity, rating, rating_count, image, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');

        $stmt->execute([
            $id,
            $data['title'],
            $data['category'],
            $data['players'],
            $data['playTime'],
            $data['price'],
            $data['oldPrice'] ?? null,
            $discount,
            $inStock,
            $data['stockQuantity'] ?? 0,
            $data['rating'] ?? 5.0,
            $data['ratingCount'] ?? 0,
            $data['image'],
            $data['description'] ?? null
        ]);

        // Add product images
        if (!empty($data['images']) && is_array($data['images'])) {
            $this->saveProductImages($id, $data['images']);
        }

        return $this->findById($id);
    }

    /**
     * Update product
     *
     * @param string $id
     * @param array $data
     * @return array|null
     */
    public function update(string $id, array $data): ?array
    {
        $updateFields = [];
        $params = [];

        $allowedFields = [
            'title', 'category', 'players', 'play_time' => 'playTime', 'price',
            'old_price' => 'oldPrice', 'stock_quantity' => 'stockQuantity',
            'rating', 'rating_count' => 'ratingCount', 'image', 'description'
        ];

        foreach ($allowedFields as $dbField => $dataField) {
            if (is_numeric($dbField)) {
                $dbField = $dataField;
            }

            if (array_key_exists($dataField, $data)) {
                $updateFields[] = "$dbField = ?";
                $params[] = $data[$dataField];
            }
        }

        // Recalculate discount
        if (array_key_exists('price', $data) || array_key_exists('oldPrice', $data)) {
            $product = $this->findById($id);
            $price = array_key_exists('price', $data) ? $data['price'] : ($product['price'] ?? 0);
            $oldPrice = array_key_exists('oldPrice', $data) ? $data['oldPrice'] : ($product['oldPrice'] ?? null);

            if (!empty($oldPrice) && $oldPrice > $price) {
                $discountPercent = round((($oldPrice - $price) / $oldPrice) * 100);
                $updateFields[] = 'discount = ?';
                $params[] = "-{$discountPercent}%";
            } else {
                $updateFields[] = 'discount = NULL';
            }
        }

        // Update in_stock based on stock_quantity
        if (array_key_exists('stockQuantity', $data)) {
            $updateFields[] = 'in_stock = ?';
            $params[] = ($data['stockQuantity'] ?? 0) > 0 ? 1 : 0;
        }

        if (!empty($updateFields)) {
            $params[] = $id;
            $sql = 'UPDATE products SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
        }

        // Update images if provided
        if (isset($data['images']) && is_array($data['images'])) {
            $this->deleteProductImages($id);
            $this->saveProductImages($id, $data['images']);
        }

        return $this->findById($id);
    }

    /**
     * Delete product
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM products WHERE id = ?');
        return $stmt->execute([$id]);
    }

    /**
     * Decrease stock quantity
     *
     * @param string $id
     * @param int $quantity
     * @return bool
     */
    public function decreaseStock(string $id, int $quantity): bool
    {
        $stmt = $this->db->prepare('
            UPDATE products
            SET stock_quantity = GREATEST(0, stock_quantity - ?),
                in_stock = CASE WHEN stock_quantity - ? > 0 THEN 1 ELSE 0 END
            WHERE id = ?
        ');
        return $stmt->execute([$quantity, $quantity, $id]);
    }

    /**
     * Save product images
     *
     * @param string $productId
     * @param array $images
     * @return void
     */
    private function saveProductImages(string $productId, array $images): void
    {
        $stmt = $this->db->prepare('
            INSERT INTO product_images (id, product_id, url, is_primary)
            VALUES (?, ?, ?, ?)
        ');

        $hasPrimary = false;
        foreach ($images as $img) {
            if (is_array($img) && !empty($img['isPrimary'])) {
                $hasPrimary = true;
                break;
            }
        }

        foreach ($images as $index => $image) {
            $imageId = 'img-' . bin2hex(random_bytes(8));
            $isPrimary = 0;
            if ($hasPrimary) {
                $isPrimary = (is_array($image) && !empty($image['isPrimary'])) ? 1 : 0;
            } else {
                $isPrimary = ($index === 0) ? 1 : 0;
            }
            $url = is_array($image) ? $image['url'] : $image;

            $stmt->execute([$imageId, $productId, $url, $isPrimary]);
        }
    }

    /**
     * Delete product images
     *
     * @param string $productId
     * @return void
     */
    private function deleteProductImages(string $productId): void
    {
        $stmt = $this->db->prepare('DELETE FROM product_images WHERE product_id = ?');
        $stmt->execute([$productId]);
    }

    /**
     * Generate unique product ID
     *
     * @return string
     */
    private function generateProductId(): string
    {
        do {
            $id = 'game-' . bin2hex(random_bytes(6));
            $stmt = $this->db->prepare('SELECT COUNT(*) FROM products WHERE id = ?');
            $stmt->execute([$id]);
        } while ($stmt->fetchColumn() > 0);

        return $id;
    }

    /**
     * Format product for output (convert DB field names to camelCase)
     *
     * @param array $product
     * @return array
     */
    private function formatProduct(array $product): array
    {
        return [
            'id' => $product['id'],
            'title' => $product['title'],
            'category' => $product['category'],
            'players' => $product['players'],
            'playTime' => $product['play_time'],
            'price' => (float) $product['price'],
            'oldPrice' => $product['old_price'] ? (float) $product['old_price'] : null,
            'discount' => $product['discount'],
            'inStock' => (bool) $product['in_stock'],
            'stockQuantity' => (int) $product['stock_quantity'],
            'rating' => (float) $product['rating'],
            'ratingCount' => (int) $product['rating_count'],
            'image' => $product['image'],
            'images' => $product['images'] ?? [],
            'description' => $product['description'],
            'createdAt' => $product['created_at'],
            'updatedAt' => $product['updated_at']
        ];
    }

    /**
     * Get low stock products count
     *
     * @return int
     */
    public function getLowStockCount(): int
    {
        $stmt = $this->db->query('SELECT COUNT(*) FROM products WHERE stock_quantity BETWEEN 1 AND 5');
        return (int) $stmt->fetchColumn();
    }

    /**
     * Get out of stock products count
     *
     * @return int
     */
    public function getOutOfStockCount(): int
    {
        $stmt = $this->db->query('SELECT COUNT(*) FROM products WHERE stock_quantity = 0');
        return (int) $stmt->fetchColumn();
    }

    /**
     * Get low stock products list (1-5 units)
     *
     * @return array
     */
    public function getLowStockProducts(): array
    {
        $stmt = $this->db->query(
            'SELECT id, title, stock_quantity as stockQuantity FROM products WHERE stock_quantity BETWEEN 1 AND 5 ORDER BY stock_quantity ASC'
        );
        return $stmt->fetchAll();
    }

    /**
     * Get out of stock products list
     *
     * @return array
     */
    public function getOutOfStockProducts(): array
    {
        $stmt = $this->db->query(
            'SELECT id, title, stock_quantity as stockQuantity FROM products WHERE stock_quantity = 0 ORDER BY title ASC'
        );
        return $stmt->fetchAll();
    }
}
