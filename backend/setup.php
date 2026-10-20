<?php
/**
 * Database Setup and Migration Script
 * Dice & Deck Tabletop Shop
 *
 * This script automatically creates database, tables and seeds initial data
 * Run once: http://localhost/tabletop-shop/backend/setup.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'tabletop_shop');

echo "<!DOCTYPE html>
<html lang='uk'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Database Setup - Dice & Deck</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            width: 100%;
        }
        h1 {
            color: #667eea;
            margin-bottom: 30px;
            font-size: 32px;
            text-align: center;
        }
        .step {
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #ddd;
            background: #f8f9fa;
        }
        .success {
            border-left-color: #28a745;
            background: #d4edda;
            color: #155724;
        }
        .error {
            border-left-color: #dc3545;
            background: #f8d7da;
            color: #721c24;
        }
        .info {
            border-left-color: #17a2b8;
            background: #d1ecf1;
            color: #0c5460;
        }
        .warning {
            border-left-color: #ffc107;
            background: #fff3cd;
            color: #856404;
        }
        pre {
            background: #272822;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 15px 0;
            font-size: 13px;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 20px;
            font-weight: 600;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #5568d3;
        }
        .summary {
            background: #e7f3ff;
            border: 2px solid #2196F3;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .summary h3 {
            color: #1976D2;
            margin-bottom: 15px;
        }
        .summary ul {
            list-style: none;
            padding-left: 0;
        }
        .summary li {
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }
        .summary li:last-child {
            border-bottom: none;
        }
        .icon { margin-right: 8px; }
    </style>
</head>
<body>
<div class='container'>
    <h1>🎲 Dice & Deck - Database Setup</h1>";

try {
    // Step 1: Connect to MySQL server (without database)
    echo "<div class='step info'><span class='icon'>🔌</span> Connecting to MySQL server...</div>";

    $pdo = new PDO(
        "mysql:host=" . DB_HOST,
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    echo "<div class='step success'><span class='icon'>✅</span> Connected to MySQL server successfully!</div>";

    // Step 2: Create database if not exists
    echo "<div class='step info'><span class='icon'>🗄️</span> Creating database '" . DB_NAME . "'...</div>";

    $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `" . DB_NAME . "`");

    echo "<div class='step success'><span class='icon'>✅</span> Database created/selected successfully!</div>";

    // Step 3: Read and execute schema.sql
    echo "<div class='step info'><span class='icon'>📋</span> Creating tables from schema.sql...</div>";

    $schemaPath = __DIR__ . '/database/schema.sql';
    if (!file_exists($schemaPath)) {
        throw new Exception("Schema file not found: {$schemaPath}");
    }

    $schema = file_get_contents($schemaPath);
    $pdo->exec($schema);

    echo "<div class='step success'><span class='icon'>✅</span> Tables created successfully!</div>";

    // Step 4: Read and execute seed.sql
    echo "<div class='step info'><span class='icon'>🌱</span> Seeding initial data from seed.sql...</div>";

    $seedPath = __DIR__ . '/database/seed.sql';
    if (!file_exists($seedPath)) {
        throw new Exception("Seed file not found: {$seedPath}");
    }

    $seed = file_get_contents($seedPath);
    $pdo->exec($seed);

    echo "<div class='step success'><span class='icon'>✅</span> Initial data seeded successfully!</div>";

    // Step 5: Verify installation
    echo "<div class='step info'><span class='icon'>🔍</span> Verifying installation...</div>";

    $tables = ['users', 'products', 'product_images', 'orders', 'order_items', 'favorites'];
    $counts = [];

    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM `{$table}`");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        $counts[$table] = $count;
    }

    echo "<div class='step success'><span class='icon'>✅</span> Verification completed!</div>";

    // Summary
    echo "<div class='summary'>
        <h3>📊 Installation Summary</h3>
        <ul>
            <li><strong>Database:</strong> " . DB_NAME . "</li>
            <li><strong>Users:</strong> {$counts['users']} (including 1 admin)</li>
            <li><strong>Products:</strong> {$counts['products']} board games</li>
            <li><strong>Product Images:</strong> {$counts['product_images']}</li>
            <li><strong>Orders:</strong> {$counts['orders']}</li>
            <li><strong>Order Items:</strong> {$counts['order_items']}</li>
            <li><strong>Favorites:</strong> {$counts['favorites']}</li>
        </ul>
    </div>";

    echo "<div class='step success' style='margin-top: 30px; font-size: 18px; text-align: center;'>
        <span class='icon'>🎉</span> <strong>Setup completed successfully!</strong>
    </div>";

    echo "<div style='text-align: center; margin-top: 30px;'>
        <h3 style='color: #667eea; margin-bottom: 15px;'>🔑 Test Credentials</h3>
        <div style='background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: left;'>
            <p><strong>Admin Account:</strong></p>
            <pre>Email: admin@tabletop.com
Password: admin123</pre>

            <p style='margin-top: 15px;'><strong>User Account:</strong></p>
            <pre>Email: taras.shevchenko@example.com
Password: password123</pre>
        </div>
    </div>";

    echo "<div style='text-align: center;'>
        <a href='/tabletop-shop/backend/public/api' class='btn'>Test API →</a>
        <a href='/tabletop-shop' class='btn' style='background: #28a745;'>Open Frontend →</a>
    </div>";

    echo "<div class='step warning' style='margin-top: 30px;'>
        <span class='icon'>⚠️</span> <strong>Security Note:</strong> Delete this setup.php file after installation for security reasons!
    </div>";

} catch (PDOException $e) {
    echo "<div class='step error'><span class='icon'>❌</span> <strong>Database Error:</strong> " . htmlspecialchars($e->getMessage()) . "</div>";
    echo "<div class='step warning'>
        <p><strong>Common Solutions:</strong></p>
        <ul style='margin-left: 20px; margin-top: 10px;'>
            <li>Make sure MySQL is running in XAMPP Control Panel</li>
            <li>Check database credentials in this file</li>
            <li>Verify MySQL port is 3306 (default)</li>
        </ul>
    </div>";
} catch (Exception $e) {
    echo "<div class='step error'><span class='icon'>❌</span> <strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "</div>";
}

echo "</div></body></html>";
