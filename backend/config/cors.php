<?php
/**
 * CORS Configuration
 * Dice & Deck Tabletop Shop
 */

// Allowed origins for CORS
$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

// Get the request origin
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Check if origin is allowed
if (in_array($requestOrigin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
} else {
    // Default fallback for development
    header('Access-Control-Allow-Origin: http://localhost:5173');
}

// CORS headers
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400'); // 24 hours

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}
