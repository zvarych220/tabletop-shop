<?php
/**
 * Favorite Controller
 * Dice & Deck Tabletop Shop
 */

require_once __DIR__ . '/../Models/Favorite.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Utils/Response.php';

class FavoriteController
{
    private Favorite $favoriteModel;

    public function __construct()
    {
        $this->favoriteModel = new Favorite();
    }

    /**
     * Get user's favorites
     * GET /api/favorites
     *
     * @return void
     */
    public function getAll(): void
    {
        $user = AuthMiddleware::requireAuth();

        try {
            $favorites = $this->favoriteModel->getUserFavorites($user['id']);

            Response::success($favorites);

        } catch (Exception $e) {
            error_log('Get favorites error: ' . $e->getMessage());
            Response::serverError('Failed to fetch favorites');
        }
    }

    /**
     * Toggle favorite (add or remove)
     * POST /api/favorites/toggle
     *
     * @param array $data
     * @return void
     */
    public function toggle(array $data): void
    {
        $user = AuthMiddleware::requireAuth();

        // Validate input
        if (empty($data['gameId'])) {
            Response::validationError(['gameId' => 'Game ID is required']);
        }

        try {
            $result = $this->favoriteModel->toggle($user['id'], $data['gameId']);

            Response::success($result, $result['isFavorite'] ? 'Added to favorites' : 'Removed from favorites');

        } catch (Exception $e) {
            error_log('Toggle favorite error: ' . $e->getMessage());
            Response::serverError('Failed to toggle favorite');
        }
    }

    /**
     * Clear all favorites
     * DELETE /api/favorites
     *
     * @return void
     */
    public function clearAll(): void
    {
        $user = AuthMiddleware::requireAuth();

        try {
            $this->favoriteModel->clearAll($user['id']);

            Response::success(null, 'All favorites cleared successfully');

        } catch (Exception $e) {
            error_log('Clear favorites error: ' . $e->getMessage());
            Response::serverError('Failed to clear favorites');
        }
    }
}
