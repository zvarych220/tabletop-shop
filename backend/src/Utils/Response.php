<?php
/**
 * Response Utility Class
 * Dice & Deck Tabletop Shop
 */

class Response
{
    /**
     * Send JSON response
     *
     * @param mixed $data
     * @param int $statusCode
     * @param array $headers
     * @return void
     */
    public static function json($data, int $statusCode = 200, array $headers = []): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=UTF-8');

        foreach ($headers as $key => $value) {
            header("$key: $value");
        }

        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit();
    }

    /**
     * Send success response
     *
     * @param mixed $data
     * @param string|null $message
     * @param int $statusCode
     * @return void
     */
    public static function success($data = null, ?string $message = null, int $statusCode = 200, array $extra = []): void
    {
        $response = ['success' => true];

        if ($message !== null) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        foreach ($extra as $key => $val) {
            $response[$key] = $val;
        }

        self::json($response, $statusCode);
    }

    /**
     * Send error response
     *
     * @param string $message
     * @param int $statusCode
     * @param array|null $errors
     * @return void
     */
    public static function error(string $message, int $statusCode = 400, ?array $errors = null): void
    {
        $response = [
            'success' => false,
            'error' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        self::json($response, $statusCode);
    }

    /**
     * Send validation error response (422)
     *
     * @param array $errors
     * @param string $message
     * @return void
     */
    public static function validationError(array $errors, string $message = 'Validation failed'): void
    {
        self::error($message, 422, $errors);
    }

    /**
     * Send unauthorized response (401)
     *
     * @param string $message
     * @return void
     */
    public static function unauthorized(string $message = 'Unauthorized'): void
    {
        self::error($message, 401);
    }

    /**
     * Send forbidden response (403)
     *
     * @param string $message
     * @return void
     */
    public static function forbidden(string $message = 'Forbidden'): void
    {
        self::error($message, 403);
    }

    /**
     * Send not found response (404)
     *
     * @param string $message
     * @return void
     */
    public static function notFound(string $message = 'Resource not found'): void
    {
        self::error($message, 404);
    }

    /**
     * Send internal server error response (500)
     *
     * @param string $message
     * @return void
     */
    public static function serverError(string $message = 'Internal server error'): void
    {
        self::error($message, 500);
    }

    /**
     * Send created response (201)
     *
     * @param mixed $data
     * @param string|null $message
     * @return void
     */
    public static function created($data = null, ?string $message = 'Resource created successfully'): void
    {
        self::success($data, $message, 201);
    }

    /**
     * Send no content response (204)
     *
     * @return void
     */
    /**
     * Send paginated response
     *
     * @param array $items
     * @param array $pagination
     * @param string|null $message
     * @param int $statusCode
     * @return void
     */
    public static function paginated(array $items, array $pagination, ?string $message = null, int $statusCode = 200): void
    {
        $response = [
            'success' => true,
            'data' => $items,
            'pagination' => $pagination
        ];

        if ($message !== null) {
            $response['message'] = $message;
        }

        self::json($response, $statusCode);
    }
}
