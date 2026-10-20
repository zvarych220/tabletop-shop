<?php
/**
 * Product Controller
 * Dice & Deck Tabletop Shop
 */

require_once __DIR__ . '/../Models/Product.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Validator.php';
require_once __DIR__ . '/../Utils/FileUpload.php';

class ProductController
{
    private Product $productModel;

    public function __construct()
    {
        $this->productModel = new Product();
    }

    /**
     * Get all products with filters
     * GET /api/products
     *
     * @param array $query Query parameters
     * @return void
     */
    public function getAll(array $query = []): void
    {
        try {
            $result = $this->productModel->getAll($query);

            Response::paginated($result['products'], $result['pagination']);

        } catch (Exception $e) {
            error_log('Get products error: ' . $e->getMessage());
            Response::serverError('Failed to fetch products');
        }
    }

    /**
     * Get single product by ID
     * GET /api/products/{id}
     *
     * @param string $id
     * @return void
     */
    public function getById(string $id): void
    {
        try {
            $product = $this->productModel->findById($id);

            if (!$product) {
                Response::notFound('Product not found');
            }

            Response::success($product);

        } catch (Exception $e) {
            error_log('Get product error: ' . $e->getMessage());
            Response::serverError('Failed to fetch product');
        }
    }

    /**
     * Create new product (Admin/Manager only)
     * POST /api/products
     *
     * @param array $data
     * @return void
     */
    public function create(array $data): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireAdminOrManager($user);

        // Handle file uploads
        try {
            // Upload main image if file provided
            if (!empty($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
                $data['image'] = FileUpload::uploadImage($_FILES['image'], 'products');
            } elseif (!empty($data['image']) && strpos($data['image'], 'data:image') === 0) {
                // Handle base64 image
                $data['image'] = FileUpload::uploadBase64Image($data['image'], 'products');
            }

            // Upload additional images if provided
            if (!empty($_FILES['images'])) {
                $uploadedImages = [];

                // Handle multiple files
                if (is_array($_FILES['images']['tmp_name'])) {
                    $fileCount = count($_FILES['images']['tmp_name']);
                    for ($i = 0; $i < $fileCount; $i++) {
                        if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                            $file = [
                                'name' => $_FILES['images']['name'][$i],
                                'type' => $_FILES['images']['type'][$i],
                                'tmp_name' => $_FILES['images']['tmp_name'][$i],
                                'error' => $_FILES['images']['error'][$i],
                                'size' => $_FILES['images']['size'][$i]
                            ];
                            $uploadedImages[] = FileUpload::uploadImage($file, 'products');
                        }
                    }
                }

                if (!empty($uploadedImages)) {
                    $data['images'] = array_map(fn($url) => ['url' => $url, 'isPrimary' => false], $uploadedImages);
                }
            }

        } catch (Exception $e) {
            Response::error('File upload failed: ' . $e->getMessage(), 422);
        }

        // Validate input
        $validator = Validator::make();
        $validator->required($data['title'] ?? '', 'title')
                  ->minLength($data['title'] ?? '', 2, 'title');
        $validator->required($data['category'] ?? '', 'category');
        $validator->required($data['players'] ?? '', 'players');
        $validator->required($data['playTime'] ?? '', 'playTime');
        $validator->required($data['price'] ?? '', 'price')
                  ->numeric($data['price'] ?? '', 'price');
        $validator->required($data['image'] ?? '', 'image');

        if (isset($data['stockQuantity'])) {
            $validator->integer($data['stockQuantity'], 'stockQuantity')
                      ->range($data['stockQuantity'], 0, 999999, 'stockQuantity');
        }

        if ($validator->fails()) {
            Response::validationError($validator->getErrors());
        }

        // Create product
        try {
            $product = $this->productModel->create($data);

            Response::created($product, 'Product created successfully');

        } catch (Exception $e) {
            error_log('Create product error: ' . $e->getMessage());
            Response::serverError('Failed to create product');
        }
    }

    /**
     * Update product (Admin/Manager only)
     * PUT /api/products/{id}
     *
     * @param string $id
     * @param array $data
     * @return void
     */
    public function update(string $id, array $data): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireAdminOrManager($user);

        // Check if product exists
        $existingProduct = $this->productModel->findById($id);
        if (!$existingProduct) {
            Response::notFound('Product not found');
        }

        // Validate input
        $validator = Validator::make();

        if (isset($data['title'])) {
            $validator->minLength($data['title'], 2, 'title');
        }

        if (isset($data['price'])) {
            $validator->numeric($data['price'], 'price');
        }

        if (isset($data['stockQuantity'])) {
            $validator->integer($data['stockQuantity'], 'stockQuantity')
                      ->range($data['stockQuantity'], 0, 999999, 'stockQuantity');
        }

        if ($validator->fails()) {
            Response::validationError($validator->getErrors());
        }

        // Update product
        try {
            $product = $this->productModel->update($id, $data);

            Response::success($product, 'Product updated successfully');

        } catch (Exception $e) {
            error_log('Update product error: ' . $e->getMessage());
            Response::serverError('Failed to update product');
        }
    }

    /**
     * Delete product (Admin/Manager only)
     * DELETE /api/products/{id}
     *
     * @param string $id
     * @return void
     */
    public function delete(string $id): void
    {
        $user = AuthMiddleware::requireAuth();
        AuthMiddleware::requireAdminOrManager($user);

        // Check if product exists
        $product = $this->productModel->findById($id);
        if (!$product) {
            Response::notFound('Product not found');
        }

        // Delete product
        try {
            $this->productModel->delete($id);

            Response::success(null, 'Product deleted successfully');

        } catch (Exception $e) {
            error_log('Delete product error: ' . $e->getMessage());
            Response::serverError('Failed to delete product');
        }
    }
}
