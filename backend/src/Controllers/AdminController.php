<?php
/**
 * Admin Controller
 * Dice & Deck Tabletop Shop
 */

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Models/Order.php';
require_once __DIR__ . '/../Models/Product.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Utils/Response.php';

class AdminController
{
    private User $userModel;
    private Order $orderModel;
    private Product $productModel;

    public function __construct()
    {
        $this->userModel = new User();
        $this->orderModel = new Order();
        $this->productModel = new Product();
    }

    /**
     * Get all users (Admin only)
     * GET /api/admin/users
     *
     * @param array $query Query parameters
     * @return void
     */
    public function getUsers(array $query = []): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireAdmin($user);

        try {
            $filters = [
                'role' => $query['role'] ?? null,
                'search' => $query['search'] ?? null,
                'sortBy' => $query['sortBy'] ?? 'created_at',
                'sortOrder' => $query['sortOrder'] ?? 'DESC'
            ];

            $users = $this->userModel->getAll($filters);

            Response::success($users);

        } catch (Exception $e) {
            error_log('Get users error: ' . $e->getMessage());
            Response::serverError('Failed to fetch users');
        }
    }

    /**
     * Update user role (Admin only)
     * PUT /api/admin/users/{id}/role
     *
     * @param string $id
     * @param array $data
     * @return void
     */
    public function updateUserRole(string $id, array $data): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireAdmin($user);

        // Validate role
        $allowedRoles = ['user', 'manager', 'admin'];
        if (empty($data['role']) || !in_array($data['role'], $allowedRoles)) {
            Response::validationError(['role' => 'Invalid role. Must be one of: user, manager, admin']);
        }

        // Check if user exists
        $targetUser = $this->userModel->findById($id);
        if (!$targetUser) {
            Response::notFound('User not found');
        }

        // Prevent admin from demoting themselves
        if ($id === $user['id']) {
            Response::forbidden('You cannot change your own role');
        }

        // Update role
        try {
            $this->userModel->updateRole($id, $data['role']);
            $updatedUser = $this->userModel->findById($id);

            Response::success(User::sanitize($updatedUser), 'User role updated successfully');

        } catch (Exception $e) {
            error_log('Update user role error: ' . $e->getMessage());
            Response::serverError('Failed to update user role');
        }
    }

    /**
     * Get analytics data (Admin/Manager only)
     * GET /api/admin/analytics
     *
     * @return void
     */
    public function getAnalytics(): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireAdminOrManager($user);

        try {
            $analytics = [
                'totalRevenue' => $this->orderModel->getTotalRevenue(),
                'completedRevenue' => $this->orderModel->getCompletedRevenue(),
                'statusDistribution' => $this->orderModel->getStatusDistribution(),
                'topSellingProducts' => $this->orderModel->getTopSellingProducts(5),
                'averageOrderValue' => $this->orderModel->getAverageOrderValue(),
                'monthlyRevenue' => $this->orderModel->getMonthlyRevenue(6),
                'lowStockCount' => $this->productModel->getLowStockCount(),
                'outOfStockCount' => $this->productModel->getOutOfStockCount(),
                'lowStockProducts' => $this->productModel->getLowStockProducts(),
                'outOfStockProducts' => $this->productModel->getOutOfStockProducts(),
            ];

            Response::success($analytics);

        } catch (Exception $e) {
            error_log('Get analytics error: ' . $e->getMessage());
            Response::serverError('Failed to fetch analytics data');
        }
    }
}
