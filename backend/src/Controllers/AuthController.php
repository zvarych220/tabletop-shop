<?php
/**
 * Authentication Controller
 * Dice & Deck Tabletop Shop
 */

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Validator.php';

class AuthController
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    /**
     * Register new user
     * POST /api/auth/register
     *
     * @param array $data
     * @return void
     */
    public function register(array $data): void
    {
        // Validate input
        $errors = Validator::validateRegistration($data);
        if ($errors) {
            Response::validationError($errors);
        }

        // Check if email already exists
        if ($this->userModel->emailExists($data['email'])) {
            Response::error('Email already registered', 422, ['email' => 'This email is already in use']);
        }

        // Create user
        try {
            $user = $this->userModel->create($data);
            $token = AuthMiddleware::generateToken($user['id']);

            Response::created([
                'user' => User::sanitize($user),
                'token' => $token
            ], 'Registration successful');

        } catch (Exception $e) {
            error_log('Registration error: ' . $e->getMessage());
            Response::serverError('Registration failed. Please try again.');
        }
    }

    /**
     * Login user
     * POST /api/auth/login
     *
     * @param array $data
     * @return void
     */
    public function login(array $data): void
    {
        // Validate input
        $errors = Validator::validateLogin($data);
        if ($errors) {
            Response::validationError($errors);
        }

        // Find user by email
        $user = $this->userModel->findByEmail($data['email']);

        if (!$user) {
            Response::unauthorized('Invalid email or password');
        }

        // Verify password
        if (!$this->userModel->verifyPassword($data['password'], $user['password_hash'])) {
            Response::unauthorized('Invalid email or password');
        }

        // Generate token
        $token = AuthMiddleware::generateToken($user['id']);

        Response::success([
            'user' => User::sanitize($user),
            'token' => $token
        ], 'Login successful');
    }

    /**
     * Get current authenticated user
     * GET /api/auth/me
     *
     * @return void
     */
    public function me(): void
    {
        $user = AuthMiddleware::requireAuth();

        // Fetch fresh user data
        $userData = $this->userModel->findById($user['id']);

        if (!$userData) {
            Response::notFound('User not found');
        }

        Response::success([
            'user' => User::sanitize($userData)
        ]);
    }

    /**
     * Update user profile
     * PUT /api/auth/profile
     *
     * @param array $data
     * @return void
     */
    public function updateProfile(array $data): void
    {
        $user = AuthMiddleware::requireAuth();

        // Validate fields if provided
        $validator = Validator::make();

        if (!empty($data['name'])) {
            $validator->minLength($data['name'], 2, 'name');
        }

        if (!empty($data['phone'])) {
            $validator->phone($data['phone'], 'phone');
        }

        if ($validator->fails()) {
            Response::validationError($validator->getErrors());
        }

        // Update user
        try {
            $updatedUser = $this->userModel->update($user['id'], $data);

            if (!$updatedUser) {
                Response::serverError('Failed to update profile');
            }

            Response::success([
                'user' => User::sanitize($updatedUser)
            ], 'Profile updated successfully');

        } catch (Exception $e) {
            error_log('Profile update error: ' . $e->getMessage());
            Response::serverError('Failed to update profile. Please try again.');
        }
    }

    /**
     * Logout user
     * POST /api/auth/logout
     *
     * @return void
     */
    public function logout(): void
    {
        // For token-based auth, logout is handled on client side
        // For session-based auth:
        AuthMiddleware::destroySession();

        Response::success(null, 'Logout successful');
    }
}
