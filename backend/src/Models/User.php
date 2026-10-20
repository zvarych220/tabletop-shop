<?php
/**
 * User Model
 * Dice & Deck Tabletop Shop
 */

require_once __DIR__ . '/../../config/database.php';

class User
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDbConnection();
    }

    /**
     * Find user by email
     *
     * @param string $email
     * @return array|null
     */
    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare('
            SELECT id, email, password_hash, name, phone, address, role, avatar, telegram_chat_id, created_at, updated_at
            FROM users
            WHERE email = ?
            LIMIT 1
        ');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        return $user ?: null;
    }

    /**
     * Find user by ID
     *
     * @param string $id
     * @return array|null
     */
    public function findById(string $id): ?array
    {
        $stmt = $this->db->prepare('
            SELECT id, email, name, phone, address, role, avatar, telegram_chat_id, created_at, updated_at
            FROM users
            WHERE id = ?
            LIMIT 1
        ');
        $stmt->execute([$id]);
        $user = $stmt->fetch();

        return $user ?: null;
    }

    /**
     * Create new user
     *
     * @param array $data
     * @return array Created user data
     */
    public function create(array $data): array
    {
        $id = $this->generateUserId();
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);

        $stmt = $this->db->prepare('
            INSERT INTO users (id, email, password_hash, name, phone, address, role, avatar)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ');

        $stmt->execute([
            $id,
            $data['email'],
            $passwordHash,
            $data['name'],
            $data['phone'] ?? null,
            $data['address'] ?? null,
            $data['role'] ?? 'user',
            $data['avatar'] ?? null
        ]);

        return $this->findById($id);
    }

    /**
     * Update user profile
     *
     * @param string $id
     * @param array $data
     * @return array|null Updated user data
     */
    public function update(string $id, array $data): ?array
    {
        if (isset($data['telegramChatId'])) {
            $data['telegram_chat_id'] = $data['telegramChatId'];
        }

        $allowedFields = ['name', 'phone', 'address', 'avatar', 'telegram_chat_id'];
        $updateFields = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateFields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }

        if (empty($updateFields)) {
            return $this->findById($id);
        }

        $params[] = $id;
        $sql = 'UPDATE users SET ' . implode(', ', $updateFields) . ' WHERE id = ?';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $this->findById($id);
    }

    /**
     * Update user role (admin only)
     *
     * @param string $id
     * @param string $role
     * @return bool
     */
    public function updateRole(string $id, string $role): bool
    {
        $stmt = $this->db->prepare('
            UPDATE users
            SET role = ?
            WHERE id = ?
        ');

        return $stmt->execute([$role, $id]);
    }

    /**
     * Get all users with filters
     *
     * @param array $filters
     * @return array
     */
    public function getAll(array $filters = []): array
    {
        $sql = 'SELECT id, email, name, phone, address, role, avatar, created_at, updated_at FROM users WHERE 1=1';
        $params = [];

        // Filter by role
        if (!empty($filters['role'])) {
            $sql .= ' AND role = ?';
            $params[] = $filters['role'];
        }

        // Search by name or email
        if (!empty($filters['search'])) {
            $sql .= ' AND (name LIKE ? OR email LIKE ?)';
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Sorting
        $sortField = $filters['sortBy'] ?? 'created_at';
        $sortOrder = strtoupper($filters['sortOrder'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
        $allowedSortFields = ['name', 'email', 'role', 'created_at'];

        if (in_array($sortField, $allowedSortFields)) {
            $sql .= " ORDER BY $sortField $sortOrder";
        } else {
            $sql .= " ORDER BY created_at DESC";
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    /**
     * Check if email exists
     *
     * @param string $email
     * @return bool
     */
    public function emailExists(string $email): bool
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM users WHERE email = ?');
        $stmt->execute([$email]);
        return $stmt->fetchColumn() > 0;
    }

    /**
     * Verify user password
     *
     * @param string $password
     * @param string $hash
     * @return bool
     */
    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    /**
     * Generate unique user ID
     *
     * @return string
     */
    private function generateUserId(): string
    {
        do {
            $id = 'user-' . bin2hex(random_bytes(8));
            $stmt = $this->db->prepare('SELECT COUNT(*) FROM users WHERE id = ?');
            $stmt->execute([$id]);
        } while ($stmt->fetchColumn() > 0);

        return $id;
    }

    /**
     * Sanitize user data (remove password_hash from output)
     *
     * @param array $user
     * @return array
     */
    public static function sanitize(array $user): array
    {
        unset($user['password_hash']);
        $user['telegramChatId'] = $user['telegram_chat_id'] ?? null;
        unset($user['telegram_chat_id']);
        return $user;
    }
}
