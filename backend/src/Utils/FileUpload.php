<?php
/**
 * File Upload Utility
 * Dice & Deck Tabletop Shop
 */

class FileUpload
{
    private const UPLOAD_DIR = __DIR__ . '/../../public/uploads/';
    private const MAX_FILE_SIZE = 5242880; // 5MB
    private const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    private const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    /**
     * Upload product image
     *
     * @param array $file $_FILES array element
     * @param string $category 'products' or 'avatars'
     * @return string|null Returns file path or null on error
     */
    public static function uploadImage(array $file, string $category = 'products'): ?string
    {
        // Validate file exists
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            throw new Exception('No file uploaded');
        }

        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception(self::getUploadErrorMessage($file['error']));
        }

        // Validate file size
        if ($file['size'] > self::MAX_FILE_SIZE) {
            throw new Exception('File size exceeds 5MB limit');
        }

        // Validate file type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, self::ALLOWED_TYPES)) {
            throw new Exception('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed');
        }

        // Validate file extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, self::ALLOWED_EXTENSIONS)) {
            throw new Exception('Invalid file extension');
        }

        // Generate unique filename
        $filename = uniqid() . '_' . time() . '.' . $extension;
        $uploadPath = self::UPLOAD_DIR . $category . '/' . $filename;

        // Ensure upload directory exists
        $uploadDir = self::UPLOAD_DIR . $category;
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
            throw new Exception('Failed to move uploaded file');
        }

        // Return relative URL path
        return '/tabletop-shop/backend/public/uploads/' . $category . '/' . $filename;
    }

    /**
     * Upload multiple images
     *
     * @param array $files Array of $_FILES elements
     * @param string $category
     * @return array Array of file paths
     */
    public static function uploadMultiple(array $files, string $category = 'products'): array
    {
        $uploadedFiles = [];

        foreach ($files as $file) {
            if (isset($file['tmp_name']) && is_uploaded_file($file['tmp_name'])) {
                try {
                    $uploadedFiles[] = self::uploadImage($file, $category);
                } catch (Exception $e) {
                    error_log('Upload error: ' . $e->getMessage());
                }
            }
        }

        return $uploadedFiles;
    }

    /**
     * Delete uploaded image
     *
     * @param string $filePath Relative URL path
     * @return bool
     */
    public static function deleteImage(string $filePath): bool
    {
        // Convert URL path to file system path
        $filePath = str_replace('/tabletop-shop/backend/public', self::UPLOAD_DIR . '../', $filePath);
        $filePath = realpath($filePath);

        if ($filePath && file_exists($filePath) && is_file($filePath)) {
            return unlink($filePath);
        }

        return false;
    }

    /**
     * Get upload error message
     *
     * @param int $errorCode
     * @return string
     */
    private static function getUploadErrorMessage(int $errorCode): string
    {
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                return 'File size exceeds maximum allowed size';
            case UPLOAD_ERR_PARTIAL:
                return 'File was only partially uploaded';
            case UPLOAD_ERR_NO_FILE:
                return 'No file was uploaded';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Missing temporary upload folder';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Failed to write file to disk';
            case UPLOAD_ERR_EXTENSION:
                return 'File upload stopped by PHP extension';
            default:
                return 'Unknown upload error';
        }
    }

    /**
     * Validate and process base64 image
     *
     * @param string $base64Data
     * @param string $category
     * @return string File path
     */
    public static function uploadBase64Image(string $base64Data, string $category = 'products'): string
    {
        // Extract mime type and data
        if (preg_match('/^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/i', $base64Data, $matches)) {
            $extension = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
            $data = base64_decode($matches[2]);

            if ($data === false) {
                throw new Exception('Invalid base64 data');
            }

            // Check file size
            if (strlen($data) > self::MAX_FILE_SIZE) {
                throw new Exception('File size exceeds 5MB limit');
            }

            // Generate unique filename
            $filename = uniqid() . '_' . time() . '.' . $extension;
            $uploadPath = self::UPLOAD_DIR . $category . '/' . $filename;

            // Ensure upload directory exists
            $uploadDir = self::UPLOAD_DIR . $category;
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            // Save file
            if (file_put_contents($uploadPath, $data) === false) {
                throw new Exception('Failed to save file');
            }

            return '/tabletop-shop/backend/public/uploads/' . $category . '/' . $filename;
        }

        throw new Exception('Invalid base64 image data');
    }
}
