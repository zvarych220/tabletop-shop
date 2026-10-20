<?php
/**
 * Favorite Model
 * Dice & Deck Tabletop Shop
 */

require_once __DIR__ . '/../../config/database.php';

class Favorite
{
    private PDO $db;

    public function __construct()
    {
        $this->db = getDbConnection();
    }

    /**
     * Get user's favorite game IDs
     *
     * @param string $userId
     * @return array Array of game IDs
     */
    public function getUserFavorites(string $userId): array
    {
        $stmt = $this->db->prepare('
            SELECT game_id
            FROM favorites
            WHERE user_id = ?
            ORDER BY created_at DESC
        ');
        $stmt->execute([$userId]);

        return array_column($stmt->fetchAll(), 'game_id');
    }

    /**
     * Check if game is favorited by user
     *
     * @param string $userId
     * @param string $gameId
     * @return bool
     */
    public function isFavorited(string $userId, string $gameId): bool
    {
        $stmt = $this->db->prepare('
            SELECT COUNT(*) FROM favorites
            WHERE user_id = ? AND game_id = ?
        ');
        $stmt->execute([$userId, $gameId]);

        return $stmt->fetchColumn() > 0;
    }

    /**
     * Add game to favorites
     *
     * @param string $userId
     * @param string $gameId
     * @return bool
     */
    public function add(string $userId, string $gameId): bool
    {
        try {
            $stmt = $this->db->prepare('
                INSERT INTO favorites (user_id, game_id)
                VALUES (?, ?)
            ');
            return $stmt->execute([$userId, $gameId]);
        } catch (PDOException $e) {
            // Duplicate entry (already favorited)
            if ($e->getCode() == 23000) {
                return true;
            }
            throw $e;
        }
    }

    /**
     * Remove game from favorites
     *
     * @param string $userId
     * @param string $gameId
     * @return bool
     */
    public function remove(string $userId, string $gameId): bool
    {
        $stmt = $this->db->prepare('
            DELETE FROM favorites
            WHERE user_id = ? AND game_id = ?
        ');
        return $stmt->execute([$userId, $gameId]);
    }

    /**
     * Toggle favorite (add if not exists, remove if exists)
     *
     * @param string $userId
     * @param string $gameId
     * @return array Returns gameId and isFavorite status
     */
    public function toggle(string $userId, string $gameId): array
    {
        if ($this->isFavorited($userId, $gameId)) {
            $this->remove($userId, $gameId);
            return ['gameId' => $gameId, 'isFavorite' => false];
        } else {
            $this->add($userId, $gameId);
            return ['gameId' => $gameId, 'isFavorite' => true];
        }
    }

    /**
     * Clear all favorites for user
     *
     * @param string $userId
     * @return bool
     */
    public function clearAll(string $userId): bool
    {
        $stmt = $this->db->prepare('DELETE FROM favorites WHERE user_id = ?');
        return $stmt->execute([$userId]);
    }

    /**
     * Get favorites count for user
     *
     * @param string $userId
     * @return int
     */
    public function getCount(string $userId): int
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM favorites WHERE user_id = ?');
        $stmt->execute([$userId]);
        return (int) $stmt->fetchColumn();
    }
}
