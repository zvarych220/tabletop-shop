<?php
/**
 * Order Controller
 * Dice & Deck Tabletop Shop
 */

require_once __DIR__ . '/../Models/Order.php';
require_once __DIR__ . '/../Models/Product.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Validator.php';

class OrderController
{
    private Order $orderModel;
    private Product $productModel;

    public function __construct()
    {
        $this->orderModel = new Order();
        $this->productModel = new Product();
    }

    /**
     * Get all orders (filtered by user role)
     * GET /api/orders
     *
     * @param array $query Query parameters
     * @return void
     */
    public function getAll(array $query = []): void
    {
        $user = AuthMiddleware::requireAuth();

        try {
            $filters = [
                'status' => $query['status'] ?? null,
                'search' => $query['search'] ?? null,
                'sortBy' => $query['sortBy'] ?? 'created_at',
                'sortOrder' => $query['sortOrder'] ?? 'DESC'
            ];

            // Regular users can only see their own orders
            if (!in_array($user['role'], ['admin', 'manager'])) {
                $filters['userId'] = $user['id'];
            }

            $orders = $this->orderModel->getAll($filters);

            Response::success($orders);

        } catch (Exception $e) {
            error_log('Get orders error: ' . $e->getMessage());
            Response::serverError('Failed to fetch orders');
        }
    }

    /**
     * Get single order by ID
     * GET /api/orders/{id}
     *
     * @param string $id
     * @return void
     */
    public function getById(string $id): void
    {
        $user = AuthMiddleware::requireAuth();

        try {
            $order = $this->orderModel->findById($id);

            if (!$order) {
                Response::notFound('Order not found');
            }

            // Regular users can only view their own orders
            if (!in_array($user['role'], ['admin', 'manager']) && $order['userId'] !== $user['id']) {
                Response::forbidden('You do not have permission to view this order');
            }

            Response::success($order);

        } catch (Exception $e) {
            error_log('Get order error: ' . $e->getMessage());
            Response::serverError('Failed to fetch order');
        }
    }

    /**
     * Create new order
     * POST /api/orders
     *
     * @param array $data
     * @return void
     */
    public function create(array $data): void
    {
        // Optional authentication (guests can order too)
        $user = AuthMiddleware::authenticate();

        // Validate order data
        $errors = Validator::validateOrder($data);
        if ($errors) {
            Response::validationError($errors);
        }

        // Verify products exist and calculate total
        $totalPrice = 0;
        $orderedItems = $data['orderedItems'] ?? [];

        foreach ($orderedItems as $item) {
            $product = $this->productModel->findById($item['gameId']);

            if (!$product) {
                Response::error("Product {$item['gameId']} not found", 404);
            }

            if ($product['stockQuantity'] < $item['quantity']) {
                Response::error("Insufficient stock for {$product['title']}", 422);
            }

            $totalPrice += $item['price'] * $item['quantity'];
        }

        // Create order
        try {
            $orderData = [
                'userId' => $user['id'] ?? null,
                'gameId' => $data['gameId'] ?? ($orderedItems[0]['gameId'] ?? null),
                'fullName' => $data['fullName'],
                'phone' => $data['phone'],
                'deliveryService' => $data['deliveryService'],
                'city' => $data['city'],
                'branch' => $data['branch'],
                'paymentMethod' => $data['paymentMethod'],
                'comment' => $data['comment'] ?? null,
                'totalPrice' => $totalPrice,
                'durationHours' => isset($data['durationHours']) ? (int)$data['durationHours'] : 1,
                'needsConsultation' => !empty($data['needsConsultation']) ? 1 : 0,
                'orderedItems' => $orderedItems
            ];

            $order = $this->orderModel->create($orderData);

            // Decrease stock quantities
            foreach ($orderedItems as $item) {
                $this->productModel->decreaseStock($item['gameId'], $item['quantity']);
            }

            Response::created($order, 'Order created successfully');

        } catch (Exception $e) {
            error_log('Create order error: ' . $e->getMessage());
            Response::serverError('Failed to create order. Please try again.');
        }
    }

    /**
     * Update order
     * PUT /api/orders/{id}
     *
     * @param string $id
     * @param array $data
     * @return void
     */
    public function update(string $id, array $data): void
    {
        $user = AuthMiddleware::requireAuth();

        // Check if order exists
        $order = $this->orderModel->findById($id);
        if (!$order) {
            Response::notFound('Order not found');
        }

        // Only admin/manager can update orders, or owner can update their pending order
        $canUpdate = in_array($user['role'], ['admin', 'manager']) ||
                     ($order['userId'] === $user['id'] && $order['status'] === 'pending');

        if (!$canUpdate) {
            Response::forbidden('You do not have permission to update this order');
        }

        // Only admin/manager can change status
        if (isset($data['status']) && !in_array($user['role'], ['admin', 'manager'])) {
            Response::forbidden('Only administrators can change order status');
        }

        // Validate status if provided
        if (isset($data['status'])) {
            $allowedStatuses = ['pending', 'processing', 'completed', 'cancelled'];
            if (!in_array($data['status'], $allowedStatuses)) {
                Response::validationError(['status' => 'Invalid status value']);
            }
        }

        // Update order
        try {
            $updatedOrder = $this->orderModel->update($id, $data);

            Response::success($updatedOrder, 'Order updated successfully');

        } catch (Exception $e) {
            error_log('Update order error: ' . $e->getMessage());
            Response::serverError('Failed to update order');
        }
    }

    /**
     * Update order status (Admin/Manager only)
     * PATCH /api/orders/{id}/status
     *
     * @param string $id
     * @param array $data
     * @return void
     */
    public function updateStatus(string $id, array $data): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireAdminOrManager($user);

        // Validate status
        $allowedStatuses = ['pending', 'processing', 'completed', 'cancelled'];
        if (empty($data['status']) || !in_array($data['status'], $allowedStatuses)) {
            Response::validationError(['status' => 'Invalid status value']);
        }

        // Check if order exists
        $order = $this->orderModel->findById($id);
        if (!$order) {
            Response::notFound('Order not found');
        }

        // Update only status
        try {
            $updatedOrder = $this->orderModel->update($id, [
                'status' => $data['status']
            ]);

            Response::success($updatedOrder, 'Order status updated successfully');

        } catch (Exception $e) {
            error_log('Update order status error: ' . $e->getMessage());
            Response::serverError('Failed to update order status');
        }
    }

    /**
     * Delete order (Admin only)
     * DELETE /api/orders/{id}
     *
     * @param string $id
     * @return void
     */
    public function delete(string $id): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireAdmin($user);

        // Check if order exists
        $order = $this->orderModel->findById($id);
        if (!$order) {
            Response::notFound('Order not found');
        }

        // Delete order
        try {
            $this->orderModel->delete($id);

            Response::success(null, 'Order deleted successfully');

        } catch (Exception $e) {
            error_log('Delete order error: ' . $e->getMessage());
            Response::serverError('Failed to delete order');
        }
    }
}
