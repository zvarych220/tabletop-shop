<?php
/**
 * Authentication Middleware
 * Dice & Deck Tabletop Shop
 */

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Utils/Response.php';

class AuthMiddleware
{
    /**
     * Verify authentication token and return user data
     *
     * @return array|null User data if authenticated, null otherwise
     */
    public static function authenticate(): ?array
    {
        $token = self::getBearerToken();

        if (!$token) {
            return null;
        }

        // Decode token (simple implementation - in production use JWT)
        $userId = self::decodeToken($token);

        if (!$userId) {
            return null;
        }

        // Get user from database
        $userModel = new User();
        $user = $userModel->findById($userId);

        return $user ? User::sanitize($user) : null;
    }

    /**
     * Require authentication - exits with 401 if not authenticated
     *
     * @return array Authenticated user data
     */
    public static function requireAuth(): array
    {
        $user = self::authenticate();

        if (!$user) {
            Response::unauthorized('Authentication required');
        }

        return $user;
    }

    /**
     * Require admin or manager role
     *
     * @param array $user Current user
     * @return void
     */
    public static function requireAdminOrManager(array $user): void
    {
        if (!in_array($user['role'], ['admin', 'manager'])) {
            Response::forbidden('Admin or manager access required');
        }
    }

    /**
     * Require admin role
     *
     * @param array $user Current user
     * @return void
     */
    public static function requireAdmin(array $user): void
    {
        if ($user['role'] !== 'admin') {
            Response::forbidden('Admin access required');
        }
    }

    /**
     * Get bearer token from Authorization header
     *
     * @return string|null
     */
    private static function getBearerToken(): ?string
    {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $authHeader = $headers['Authorization'] 
            ?? $headers['authorization'] 
            ?? $_SERVER['HTTP_AUTHORIZATION'] 
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] 
            ?? '';

        if (!$authHeader && function_exists('apache_request_headers')) {
            $apacheHeaders = apache_request_headers();
            $authHeader = $apacheHeaders['Authorization'] ?? $apacheHeaders['authorization'] ?? '';
        }

        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return trim($matches[1]);
        }

        return null;
    }

    /**
     * Generate authentication token
     *
     * @param string $userId
     * @return string
     */
    public static function generateToken(string $userId): string
    {
        // Simple token implementation - in production use JWT with secret key
        // Format: base64(userId:timestamp:signature)
        $timestamp = time();
        $signature = hash_hmac('sha256', $userId . $timestamp, self::getSecretKey());
        $tokenData = json_encode([
            'userId' => $userId,
            'timestamp' => $timestamp,
            'signature' => $signature
        ]);

        return base64_encode($tokenData);
    }

    /**
     * Decode authentication token
     *
     * @param string $token
     * @return string|null User ID if valid, null otherwise
     */
    private static function decodeToken(string $token): ?string
    {
        try {
            $tokenData = json_decode(base64_decode($token), true);

            if (!$tokenData || !isset($tokenData['userId'], $tokenData['timestamp'], $tokenData['signature'])) {
                return null;
            }

            // Verify signature
            $expectedSignature = hash_hmac('sha256', $tokenData['userId'] . $tokenData['timestamp'], self::getSecretKey());

            if (!hash_equals($expectedSignature, $tokenData['signature'])) {
                return null;
            }

            // Check token expiration (30 days)
            $expirationTime = 30 * 24 * 60 * 60;
            if (time() - $tokenData['timestamp'] > $expirationTime) {
                return null;
            }

            return $tokenData['userId'];

        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Get secret key for token signing
     *
     * @return string
     */
    private static function getSecretKey(): string
    {
        // In production, store this in environment variable or config file
        return getenv('JWT_SECRET') ?: 'dice-and-deck-secret-key-change-in-production';
    }

    /**
     * Start session-based authentication
     *
     * @return void
     */
    public static function startSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            ini_set('session.cookie_httponly', 1);
            ini_set('session.use_only_cookies', 1);
            ini_set('session.cookie_samesite', 'Lax');
            session_start();
        }
    }

    /**
     * Get authenticated user from session
     *
     * @return array|null
     */
    public static function getSessionUser(): ?array
    {
        self::startSession();
        return $_SESSION['user'] ?? null;
    }

    /**
     * Set authenticated user in session
     *
     * @param array $user
     * @return void
     */
    public static function setSessionUser(array $user): void
    {
        self::startSession();
        $_SESSION['user'] = User::sanitize($user);
    }

    /**
     * Destroy session
     *
     * @return void
     */
    public static function destroySession(): void
    {
        self::startSession();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params['path'], $params['domain'],
                $params['secure'], $params['httponly']
            );
        }
        session_destroy();
    }
}
