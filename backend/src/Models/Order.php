<?php
/**
 * Order Model
 * Dice & Deck Tabletop Shop
 */

require_once __DIR__ . '/../../config/database.php';

class Order
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDbConnection();
    }

    /**
     * Get all orders with filters
     *
     * @param array $filters
     * @return array
     */
    public function getAll(array $filters = []): array
    {
        $sql = 'SELECT * FROM orders WHERE 1=1';
        $params = [];

        // Filter by user ID
        if (!empty($filters['userId'])) {
            $sql .= ' AND user_id = ?';
            $params[] = $filters['userId'];
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $sql .= ' AND status = ?';
            $params[] = $filters['status'];
        }

        // Search by full name or phone
        if (!empty($filters['search'])) {
            $sql .= ' AND (full_name LIKE ? OR phone LIKE ?)';
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Sorting
        $sortField = $filters['sortBy'] ?? 'created_at';
        $sortOrder = strtoupper($filters['sortOrder'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
        $allowedSortFields = ['created_at', 'total_price', 'status', 'full_name'];

        if (in_array($sortField, $allowedSortFields)) {
            $sql .= " ORDER BY $sortField $sortOrder";
        } else {
            $sql .= " ORDER BY created_at DESC";
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $orders = $stmt->fetchAll();

        // Attach order items to each order
        foreach ($orders as &$order) {
            $order['orderedItems'] = $this->getOrderItems($order['id']);
            $order = $this->formatOrder($order);
        }

        return $orders;
    }

    /**
     * Find order by ID
     *
     * @param string $id
     * @return array|null
     */
    public function findById(string $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM orders WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $order = $stmt->fetch();

        if (!$order) {
            return null;
        }

        $order['orderedItems'] = $this->getOrderItems($order['id']);
        return $this->formatOrder($order);
    }

    /**
     * Get order items
     *
     * @param string $orderId
     * @return array
     */
    public function getOrderItems(string $orderId): array
    {
        $stmt = $this->db->prepare('
            SELECT id, game_id as gameId, title, price, quantity
            FROM order_items
            WHERE order_id = ?
            ORDER BY id ASC
        ');
        $stmt->execute([$orderId]);
        $items = $stmt->fetchAll();

        foreach ($items as &$item) {
            $item['price'] = (float) $item['price'];
            $item['quantity'] = (int) $item['quantity'];
        }

        return $items;
    }

    /**
     * Create new order
     *
     * @param array $data
     * @return array
     */
    public function create(array $data): array
    {
        $this->db->beginTransaction();

        try {
            $orderId = $this->generateOrderId();

            // Insert order
            $stmt = $this->db->prepare('
                INSERT INTO orders (
                    id, user_id, game_id, full_name, phone, delivery_service,
                    city, branch, payment_method, comment, total_price,
                    duration_hours, needs_consultation, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');

            $stmt->execute([
                $orderId,
                $data['userId'] ?? null,
                $data['gameId'] ?? null,
                $data['fullName'],
                $data['phone'],
                $data['deliveryService'],
                $data['city'],
                $data['branch'],
                $data['paymentMethod'],
                $data['comment'] ?? null,
                $data['totalPrice'],
                $data['durationHours'] ?? 1,
                $data['needsConsultation'] ?? 0,
                'pending'
            ]);

            // Insert order items
            if (!empty($data['orderedItems']) && is_array($data['orderedItems'])) {
                $this->saveOrderItems($orderId, $data['orderedItems']);
            }

            $this->db->commit();
            return $this->findById($orderId);

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Update order
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
            'full_name' => 'fullName',
            'phone' => 'phone',
            'delivery_service' => 'deliveryService',
            'city' => 'city',
            'branch' => 'branch',
            'payment_method' => 'paymentMethod',
            'comment' => 'comment',
            'duration_hours' => 'durationHours',
            'needs_consultation' => 'needsConsultation',
            'status' => 'status'
        ];

        foreach ($allowedFields as $dbField => $dataField) {
            if (isset($data[$dataField])) {
                $updateFields[] = "$dbField = ?";
                $params[] = $data[$dataField];
            }
        }

        if (!empty($updateFields)) {
            $params[] = $id;
            $sql = 'UPDATE orders SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
        }

        return $this->findById($id);
    }

    /**
     * Delete order
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM orders WHERE id = ?');
        return $stmt->execute([$id]);
    }

    /**
     * Save order items
     *
     * @param string $orderId
     * @param array $items
     * @return void
     */
    private function saveOrderItems(string $orderId, array $items): void
    {
        $stmt = $this->db->prepare('
            INSERT INTO order_items (order_id, game_id, title, price, quantity)
            VALUES (?, ?, ?, ?, ?)
        ');

        foreach ($items as $item) {
            $stmt->execute([
                $orderId,
                $item['gameId'] ?? null,
                $item['title'],
                $item['price'],
                $item['quantity'] ?? 1
            ]);
        }
    }

    /**
     * Generate unique order ID
     *
     * @return string
     */
    private function generateOrderId(): string
    {
        do {
            $id = 'ord-' . bin2hex(random_bytes(6));
            $stmt = $this->db->prepare('SELECT COUNT(*) FROM orders WHERE id = ?');
            $stmt->execute([$id]);
        } while ($stmt->fetchColumn() > 0);

        return $id;
    }

    /**
     * Format order for output (convert DB field names to camelCase)
     *
     * @param array $order
     * @return array
     */
    private function formatOrder(array $order): array
    {
        return [
            'id' => $order['id'],
            'userId' => $order['user_id'],
            'gameId' => $order['game_id'],
            'fullName' => $order['full_name'],
            'phone' => $order['phone'],
            'deliveryService' => $order['delivery_service'],
            'city' => $order['city'],
            'branch' => $order['branch'],
            'paymentMethod' => $order['payment_method'],
            'comment' => $order['comment'],
            'totalPrice' => (float) $order['total_price'],
            'durationHours' => (int) $order['duration_hours'],
            'needsConsultation' => (bool) $order['needs_consultation'],
            'status' => $order['status'],
            'orderedItems' => $order['orderedItems'] ?? [],
            'createdAt' => $order['created_at'],
            'updatedAt' => $order['updated_at']
        ];
    }

    /**
     * Get total revenue
     *
     * @return float
     */
    public function getTotalRevenue(): float
    {
        $stmt = $this->db->query('SELECT COALESCE(SUM(total_price), 0) FROM orders');
        return (float) $stmt->fetchColumn();
    }

    /**
     * Get completed orders revenue
     *
     * @return float
     */
    public function getCompletedRevenue(): float
    {
        $stmt = $this->db->query("SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE status = 'completed'");
        return (float) $stmt->fetchColumn();
    }

    /**
     * Get order status distribution
     *
     * @return array
     */
    public function getStatusDistribution(): array
    {
        $stmt = $this->db->query('
            SELECT status, COUNT(*) as count
            FROM orders
            GROUP BY status
        ');
        $results = $stmt->fetchAll();

        $distribution = [
            'pending' => 0,
            'processing' => 0,
            'completed' => 0,
            'cancelled' => 0
        ];

        foreach ($results as $row) {
            $distribution[$row['status']] = (int) $row['count'];
        }

        return $distribution;
    }

    /**
     * Get top selling products
     *
     * @param int $limit
     * @return array
     */
    public function getTopSellingProducts(int $limit = 5): array
    {
        $stmt = $this->db->prepare('
            SELECT
                oi.game_id as gameId,
                oi.title,
                SUM(oi.quantity) as totalQuantity,
                SUM(oi.price * oi.quantity) as totalRevenue
            FROM order_items oi
            INNER JOIN orders o ON oi.order_id = o.id
            WHERE o.status = "completed"
            GROUP BY oi.game_id, oi.title
            ORDER BY totalQuantity DESC
            LIMIT ?
        ');
        $stmt->execute([$limit]);
        $products = $stmt->fetchAll();

        foreach ($products as &$product) {
            $product['totalQuantity'] = (int) $product['totalQuantity'];
            $product['totalRevenue'] = (float) $product['totalRevenue'];
        }

        return $products;
    }

    /**
     * Get average order value
     *
     * @return float
     */
    public function getAverageOrderValue(): float
    {
        $stmt = $this->db->query('SELECT AVG(total_price) FROM orders WHERE status != "cancelled"');
        return (float) $stmt->fetchColumn();
    }

    /**
     * Get monthly revenue (last 6 months)
     *
     * @param int $months
     * @return array  keys = "YYYY-MM", values = float revenue
     */
    public function getMonthlyRevenue(int $months = 6): array
    {
        $stmt = $this->db->prepare('
            SELECT
                DATE_FORMAT(created_at, "%Y-%m") as month,
                COALESCE(SUM(total_price), 0) as revenue
            FROM orders
            WHERE status != "cancelled"
              AND created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
            GROUP BY DATE_FORMAT(created_at, "%Y-%m")
            ORDER BY month ASC
        ');
        $stmt->execute([$months]);
        $rows = $stmt->fetchAll();

        $result = [];
        foreach ($rows as $row) {
            $result[$row['month']] = (float) $row['revenue'];
        }
        return $result;
    }
}
