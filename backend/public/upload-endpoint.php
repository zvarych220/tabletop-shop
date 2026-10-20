/**
 * Upload Image Endpoint
 * POST /api/upload
 */

if ($resource === 'upload' && $requestMethod === 'POST') {
    require_once __DIR__ . '/../src/Utils/FileUpload.php';
    require_once __DIR__ . '/../src/Middleware/AuthMiddleware.php';

    try {
        // Require authentication for uploads
        $user = AuthMiddleware::requireAuth();

        if (empty($_FILES['file'])) {
            Response::error('No file uploaded', 400);
        }

        $category = $_POST['category'] ?? 'products';
        $allowedCategories = ['products', 'avatars'];

        if (!in_array($category, $allowedCategories)) {
            Response::error('Invalid category', 400);
        }

        $filePath = FileUpload::uploadImage($_FILES['file'], $category);

        Response::success([
            'url' => 'http://localhost' . $filePath,
            'path' => $filePath
        ], 'File uploaded successfully');

    } catch (Exception $e) {
        Response::error($e->getMessage(), 400);
    }
}
