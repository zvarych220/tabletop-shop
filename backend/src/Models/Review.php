<?php
/**
 * Review Model
 * Dice & Deck Tabletop Shop
 */

require_once __DIR__ . '/../../config/database.php';

class Review
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDbConnection();
    }

    /**
     * Get approved reviews for a specific product
     *
     * @param string $productId
     * @return array
     */
    public function getByProduct(string $productId): array
    {
        $stmt = $this->db->prepare('
            SELECT r.*, u.avatar as author_avatar
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ? AND r.status = "approved"
            ORDER BY r.created_at DESC
        ');
        $stmt->execute([$productId]);
        $rows = $stmt->fetchAll();

        return array_map([$this, 'formatReview'], $rows);
    }

    /**
     * Get all reviews with optional filters (Admin)
     *
     * @param array $filters
     * @return array
     */
    public function getAll(array $filters = []): array
    {
        $sql = '
            SELECT r.*, p.title as product_title, p.image as product_image, u.avatar as author_avatar
            FROM reviews r
            LEFT JOIN products p ON r.product_id = p.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE 1=1
        ';
        $params = [];

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $sql .= ' AND r.status = ?';
            $params[] = $filters['status'];
        }

        if (!empty($filters['productId'])) {
            $sql .= ' AND r.product_id = ?';
            $params[] = $filters['productId'];
        }

        if (!empty($filters['search'])) {
            $sql .= ' AND (r.author_name LIKE ? OR r.comment LIKE ? OR p.title LIKE ?)';
            $search = '%' . trim($filters['search']) . '%';
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
        }

        $sql .= ' ORDER BY r.created_at DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        // Get status counts for admin tabs
        $countsStmt = $this->db->query('
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected
            FROM reviews
        ');
        $counts = $countsStmt->fetch() ?: ['total' => 0, 'pending' => 0, 'approved' => 0, 'rejected' => 0];

        return [
            'reviews' => array_map([$this, 'formatReview'], $rows),
            'counts' => [
                'total' => (int) $counts['total'],
                'pending' => (int) $counts['pending'],
                'approved' => (int) $counts['approved'],
                'rejected' => (int) $counts['rejected']
            ]
        ];
    }

    /**
     * Find single review by ID
     *
     * @param string $id
     * @return array|null
     */
    public function findById(string $id): ?array
    {
        $stmt = $this->db->prepare('
            SELECT r.*, p.title as product_title, p.image as product_image
            FROM reviews r
            LEFT JOIN products p ON r.product_id = p.id
            WHERE r.id = ?
            LIMIT 1
        ');
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        return $row ? $this->formatReview($row) : null;
    }

    /**
     * Create new review (status = pending)
     *
     * @param array $data
     * @return array
     */
    public function create(array $data): array
    {
        $id = 'rev-' . bin2hex(random_bytes(6));
        $productId = $data['productId'] ?? $data['product_id'];
        $userId = $data['userId'] ?? $data['user_id'] ?? null;
        $authorName = trim($data['authorName'] ?? $data['author_name'] ?? 'Анонімний гравець');
        $rating = max(1, min(5, (int)($data['rating'] ?? 5)));
        $comment = trim($data['comment'] ?? '');
        $status = 'pending'; // Always pending on user submission

        $stmt = $this->db->prepare('
            INSERT INTO reviews (id, product_id, user_id, author_name, rating, comment, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([$id, $productId, $userId, $authorName, $rating, $comment, $status]);

        return $this->findById($id);
    }

    /**
     * Update review status (approve/reject)
     *
     * @param string $id
     * @param string $status ('approved' | 'rejected' | 'pending')
     * @return array|null
     */
    public function updateStatus(string $id, string $status): ?array
    {
        $validStatuses = ['pending', 'approved', 'rejected'];
        if (!in_array($status, $validStatuses, true)) {
            throw new InvalidArgumentException('Invalid review status');
        }

        $review = $this->findById($id);
        if (!$review) {
            return null;
        }

        $stmt = $this->db->prepare('UPDATE reviews SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);

        // Recalculate rating for the product
        $this->recalculateProductRating($review['productId']);

        return $this->findById($id);
    }

    /**
     * Delete review
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool
    {
        $review = $this->findById($id);
        if (!$review) {
            return false;
        }

        $stmt = $this->db->prepare('DELETE FROM reviews WHERE id = ?');
        $result = $stmt->execute([$id]);

        if ($result) {
            $this->recalculateProductRating($review['productId']);
        }

        return $result;
    }

    /**
     * Recalculate product rating and rating_count based on approved reviews
     *
     * @param string $productId
     * @return void
     */
    public function recalculateProductRating(string $productId): void
    {
        $stmt = $this->db->prepare('
            SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
            FROM reviews
            WHERE product_id = ? AND status = "approved"
        ');
        $stmt->execute([$productId]);
        $stats = $stmt->fetch();

        $count = (int) ($stats['review_count'] ?? 0);
        if ($count > 0) {
            $avgRating = round((float) $stats['avg_rating'], 1);
        } else {
            // Default when no approved reviews exist
            $avgRating = 5.0;
        }

        $updateStmt = $this->db->prepare('
            UPDATE products
            SET rating = ?, rating_count = ?
            WHERE id = ?
        ');
        $updateStmt->execute([$avgRating, $count, $productId]);
    }

    /**
     * Format review data for API response
     *
     * @param array $row
     * @return array
     */
    private function formatReview(array $row): array
    {
        return [
            'id' => $row['id'],
            'productId' => $row['product_id'],
            'userId' => $row['user_id'] ?? null,
            'authorName' => $row['author_name'],
            'authorAvatar' => $row['author_avatar'] ?? null,
            'rating' => (int) $row['rating'],
            'comment' => $row['comment'],
            'status' => $row['status'],
            'productTitle' => $row['product_title'] ?? null,
            'productImage' => $row['product_image'] ?? null,
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at']
        ];
    }
}
