<?php
/**
 * Review Controller
 * Dice & Deck Tabletop Shop
 */

require_once __DIR__ . '/../Models/Review.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Validator.php';

class ReviewController
{
    private Review $reviewModel;

    public function __construct()
    {
        $this->reviewModel = new Review();
    }

    /**
     * Get approved reviews for a product
     * GET /api/products/{id}/reviews
     *
     * @param string $productId
     * @return void
     */
    public function getByProduct(string $productId): void
    {
        try {
            $reviews = $this->reviewModel->getByProduct($productId);
            Response::success($reviews);
        } catch (Exception $e) {
            error_log('Get product reviews error: ' . $e->getMessage());
            Response::serverError('Failed to fetch reviews');
        }
    }

    /**
     * Submit new review for product (status = pending)
     * POST /api/products/{id}/reviews
     *
     * @param string $productId
     * @param array $data
     * @return void
     */
    public function create(string $productId, array $data): void
    {
        $user = AuthMiddleware::authenticate();

        $data['productId'] = $productId;
        if ($user) {
            $data['userId'] = $user['id'];
            if (empty($data['authorName'])) {
                $data['authorName'] = $user['name'] ?? $user['email'];
            }
        }

        $validator = Validator::make();
        $validator->required($data['authorName'] ?? '', 'authorName')
                  ->minLength($data['authorName'] ?? '', 2, 'authorName');
        $validator->required($data['comment'] ?? '', 'comment')
                  ->minLength($data['comment'] ?? '', 5, 'comment');
        $validator->required($data['rating'] ?? '', 'rating')
                  ->range((int)($data['rating'] ?? 0), 1, 5, 'rating');

        if ($validator->fails()) {
            Response::validationError($validator->getErrors());
        }

        try {
            $review = $this->reviewModel->create($data);

            // Notify Admin via Telegram
            try {
                require_once __DIR__ . '/../Services/TelegramService.php';
                require_once __DIR__ . '/../Models/Product.php';
                $productModel = new Product();
                $product = $productModel->findById($productId);
                $telegramService = new TelegramService();
                $telegramService->notifyAdminNewReview($review, $product['title'] ?? '');
            } catch (Exception $tgEx) {
                error_log('Telegram review notification error: ' . $tgEx->getMessage());
            }

            Response::created($review, 'Відгук надіслано на перевірку адміністратором');
        } catch (Exception $e) {
            error_log('Create review error: ' . $e->getMessage());
            Response::serverError('Failed to submit review');
        }
    }

    /**
     * Get all reviews for admin moderation
     * GET /api/reviews
     *
     * @param array $query
     * @return void
     */
    public function getAll(array $query = []): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireAdminOrManager($user);

        try {
            $filters = [
                'status' => $query['status'] ?? null,
                'search' => $query['search'] ?? null,
                'productId' => $query['productId'] ?? null,
            ];

            $result = $this->reviewModel->getAll($filters);
            Response::success($result['reviews'], null, 200, ['counts' => $result['counts']]);
        } catch (Exception $e) {
            error_log('Get all reviews error: ' . $e->getMessage());
            Response::serverError('Failed to fetch reviews');
        }
    }

    /**
     * Update review status (approve or reject)
     * PUT /api/reviews/{id}/status
     *
     * @param string $id
     * @param array $data
     * @return void
     */
    public function updateStatus(string $id, array $data): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireAdminOrManager($user);

        $status = $data['status'] ?? '';
        if (!in_array($status, ['approved', 'rejected', 'pending'], true)) {
            Response::error('Invalid status. Allowed: approved, rejected, pending', 422);
        }

        try {
            $updated = $this->reviewModel->updateStatus($id, $status);
            if (!$updated) {
                Response::notFound('Review not found');
            }

            $message = $status === 'approved' 
                ? 'Відгук схвалено та опубліковано' 
                : 'Статус відгуку змінено';

            Response::success($updated, $message);
        } catch (Exception $e) {
            error_log('Update review status error: ' . $e->getMessage());
            Response::serverError('Failed to update review status');
        }
    }

    /**
     * Delete review
     * DELETE /api/reviews/{id}
     *
     * @param string $id
     * @return void
     */
    public function delete(string $id): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireAdminOrManager($user);

        try {
            $deleted = $this->reviewModel->delete($id);
            if (!$deleted) {
                Response::notFound('Review not found');
            }

            Response::success(null, 'Відгук успішно видалено');
        } catch (Exception $e) {
            error_log('Delete review error: ' . $e->getMessage());
            Response::serverError('Failed to delete review');
        }
    }
}
