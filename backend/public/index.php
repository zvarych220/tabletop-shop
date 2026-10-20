<?php
/**
 * API Entry Point and Router
 * Dice & Deck Tabletop Shop
 */

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Set timezone
date_default_timezone_set('Europe/Kiev');

// Load configurations
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

// Load utilities
require_once __DIR__ . '/../src/Utils/Response.php';
require_once __DIR__ . '/../src/Utils/Validator.php';

// Load middleware
require_once __DIR__ . '/../src/Middleware/AuthMiddleware.php';

// Load models
require_once __DIR__ . '/../src/Models/User.php';
require_once __DIR__ . '/../src/Models/Product.php';
require_once __DIR__ . '/../src/Models/Order.php';
require_once __DIR__ . '/../src/Models/Favorite.php';
require_once __DIR__ . '/../src/Models/Review.php';

// Load controllers
require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/../src/Controllers/ProductController.php';
require_once __DIR__ . '/../src/Controllers/OrderController.php';
require_once __DIR__ . '/../src/Controllers/FavoriteController.php';
require_once __DIR__ . '/../src/Controllers/ReviewController.php';
require_once __DIR__ . '/../src/Controllers/AdminController.php';
require_once __DIR__ . '/../src/Controllers/TelegramController.php';

// Get request method and URI
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

// Parse URI
$uri = parse_url($requestUri, PHP_URL_PATH);
$uri = str_replace('/tabletop-shop/backend/public', '', $uri);
$uri = rtrim($uri, '/');

// Remove /api prefix if present
if (strpos($uri, '/api') === 0) {
    $uri = substr($uri, 4);
}

// Split URI into segments
$uriSegments = array_values(array_filter(explode('/', $uri)));

// Get request body for POST/PUT/PATCH
$requestBody = [];
if (in_array($requestMethod, ['POST', 'PUT', 'PATCH'])) {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    // Handle multipart/form-data (file uploads)
    if (strpos($contentType, 'multipart/form-data') !== false) {
        $requestBody = $_POST;
    } else {
        // Handle JSON data
        $input = file_get_contents('php://input');
        $requestBody = json_decode($input, true) ?? [];
    }
}

// Get query parameters
$queryParams = $_GET;

/**
 * Route the request to appropriate controller
 */
try {
    // Health check endpoint
    if (empty($uriSegments) || $uri === '/') {
        Response::success([
            'message' => 'Dice & Deck API is running',
            'version' => '1.0.0',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }

    $resource = $uriSegments[0] ?? '';
    $id = $uriSegments[1] ?? null;
    $subResource = $uriSegments[2] ?? null;

    // ============================================
    // AUTH ROUTES
    // ============================================
    if ($resource === 'auth') {
        $authController = new AuthController();

        switch ($id) {
            case 'register':
                if ($requestMethod === 'POST') {
                    $authController->register($requestBody);
                }
                break;

            case 'login':
                if ($requestMethod === 'POST') {
                    $authController->login($requestBody);
                }
                break;

            case 'me':
                if ($requestMethod === 'GET') {
                    $authController->me();
                }
                break;

            case 'profile':
                if ($requestMethod === 'PUT') {
                    $authController->updateProfile($requestBody);
                }
                break;

            case 'logout':
                if ($requestMethod === 'POST') {
                    $authController->logout();
                }
                break;

            default:
                Response::notFound('Auth endpoint not found');
        }
    }

    // ============================================
    // PRODUCT ROUTES
    // ============================================
    elseif ($resource === 'products') {
        $productController = new ProductController();

        if ($id === null) {
            // GET /api/products
            if ($requestMethod === 'GET') {
                $productController->getAll($queryParams);
            }
            // POST /api/products
            elseif ($requestMethod === 'POST') {
                $productController->create($requestBody);
            }
        } else {
            // Product Reviews: /api/products/{id}/reviews
            if ($subResource === 'reviews') {
                $reviewController = new ReviewController();
                if ($requestMethod === 'GET') {
                    $reviewController->getByProduct($id);
                } elseif ($requestMethod === 'POST') {
                    $reviewController->create($id, $requestBody);
                }
            }
            // GET /api/products/{id}
            elseif ($requestMethod === 'GET') {
                $productController->getById($id);
            }
            // PUT /api/products/{id}
            elseif ($requestMethod === 'PUT') {
                $productController->update($id, $requestBody);
            }
            // DELETE /api/products/{id}
            elseif ($requestMethod === 'DELETE') {
                $productController->delete($id);
            }
        }
    }

    // ============================================
    // ORDER ROUTES
    // ============================================
    elseif ($resource === 'orders') {
        $orderController = new OrderController();

        if ($id === null) {
            // GET /api/orders
            if ($requestMethod === 'GET') {
                $orderController->getAll($queryParams);
            }
            // POST /api/orders
            elseif ($requestMethod === 'POST') {
                $orderController->create($requestBody);
            }
        } else {
            // Check for sub-resource (e.g., /orders/{id}/status)
            $subResource = $uriSegments[2] ?? null;

            if ($subResource === 'status' && $requestMethod === 'PUT') {
                // PUT /api/orders/{id}/status
                $orderController->updateStatus($id, $requestBody);
            }
            // GET /api/orders/{id}
            elseif ($requestMethod === 'GET') {
                $orderController->getById($id);
            }
            // PUT /api/orders/{id}
            elseif ($requestMethod === 'PUT') {
                $orderController->update($id, $requestBody);
            }
            // DELETE /api/orders/{id}
            elseif ($requestMethod === 'DELETE') {
                $orderController->delete($id);
            }
        }
    }

    // ============================================
    // FAVORITE ROUTES
    // ============================================
    elseif ($resource === 'favorites') {
        $favoriteController = new FavoriteController();

        if ($id === 'toggle') {
            // POST /api/favorites/toggle
            if ($requestMethod === 'POST') {
                $favoriteController->toggle($requestBody);
            }
        } elseif ($id === null) {
            // GET /api/favorites
            if ($requestMethod === 'GET') {
                $favoriteController->getAll();
            }
            // DELETE /api/favorites
            elseif ($requestMethod === 'DELETE') {
                $favoriteController->clearAll();
            }
        }
    }

    // ============================================
    // REVIEWS MODERATION ROUTES
    // ============================================
    elseif ($resource === 'reviews') {
        $reviewController = new ReviewController();

        if ($id === null) {
            // GET /api/reviews
            if ($requestMethod === 'GET') {
                $reviewController->getAll($queryParams);
            }
        } else {
            // PUT /api/reviews/{id}/status
            if ($subResource === 'status' && $requestMethod === 'PUT') {
                $reviewController->updateStatus($id, $requestBody);
            }
            // DELETE /api/reviews/{id}
            elseif ($requestMethod === 'DELETE') {
                $reviewController->delete($id);
            }
        }
    }

    // ============================================
    // ADMIN ROUTES
    // ============================================
    elseif ($resource === 'admin') {
        $adminController = new AdminController();

        if ($id === 'users') {
            if ($subResource === null) {
                // GET /api/admin/users
                if ($requestMethod === 'GET') {
                    $adminController->getUsers($queryParams);
                }
            } else {
                $userId = $subResource;
                $action = $uriSegments[3] ?? null;

                if ($action === 'role') {
                    // PUT /api/admin/users/{id}/role
                    if ($requestMethod === 'PUT') {
                        $adminController->updateUserRole($userId, $requestBody);
                    }
                }
            }
        } elseif ($id === 'analytics') {
            // GET /api/admin/analytics
            if ($requestMethod === 'GET') {
                $adminController->getAnalytics();
            }
        } elseif ($id === 'telegram') {
            $telegramController = new TelegramController();
            if ($subResource === 'test') {
                // POST /api/admin/telegram/test
                if ($requestMethod === 'POST') {
                    $telegramController->test($requestBody);
                }
            } else {
                // GET /api/admin/telegram
                if ($requestMethod === 'GET') {
                    $telegramController->getSettings();
                }
                // POST /api/admin/telegram
                elseif ($requestMethod === 'POST') {
                    $telegramController->saveSettings($requestBody);
                }
            }
        }
    }

    // ============================================
    // UPLOAD ENDPOINT
    // ============================================
    elseif ($resource === 'upload') {
        require_once __DIR__ . '/../src/Utils/FileUpload.php';

        if ($requestMethod === 'POST') {
            $user = AuthMiddleware::requireAuth();

            if (empty($_FILES['file'])) {
                Response::error('No file uploaded', 400);
            }

            $category = $_POST['category'] ?? 'products';
            $allowedCategories = ['products', 'avatars'];

            if (!in_array($category, $allowedCategories)) {
                Response::error('Invalid category', 400);
            }

            try {
                $filePath = FileUpload::uploadImage($_FILES['file'], $category);

                Response::success([
                    'url' => 'http://localhost' . $filePath,
                    'path' => $filePath
                ], 'File uploaded successfully');

            } catch (Exception $e) {
                Response::error($e->getMessage(), 400);
            }
        }
    }

    // ============================================
    // NOT FOUND
    // ============================================
    else {
        Response::notFound('API endpoint not found');
    }

    // If we reach here without a response, method not allowed
    Response::error('Method not allowed', 405);

} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    Response::serverError('Database error occurred');

} catch (Exception $e) {
    error_log('Server error: ' . $e->getMessage());
    Response::serverError('An unexpected error occurred');
}
