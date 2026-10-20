-- =====================================================
-- Dice & Deck Tabletop Shop - Database Schema
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if exist
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `product_images`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `users`;

-- =====================================================
-- Table: users
-- =====================================================
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `address` TEXT NULL,
  `role` ENUM('user', 'manager', 'admin') NOT NULL DEFAULT 'user',
  `avatar` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: products
-- =====================================================
CREATE TABLE `products` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `players` VARCHAR(50) NOT NULL,
  `play_time` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `old_price` DECIMAL(10,2) NULL,
  `discount` VARCHAR(20) NULL,
  `in_stock` TINYINT(1) NOT NULL DEFAULT 1,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `rating` DECIMAL(2,1) NOT NULL DEFAULT 5.0,
  `rating_count` INT NOT NULL DEFAULT 0,
  `image` TEXT NOT NULL,
  `description` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_in_stock` (`in_stock`),
  INDEX `idx_stock_quantity` (`stock_quantity`),
  INDEX `idx_price` (`price`),
  FULLTEXT INDEX `idx_fulltext_search` (`title`, `category`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: product_images
-- =====================================================
CREATE TABLE `product_images` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `product_id` VARCHAR(50) NOT NULL,
  `url` TEXT NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_is_primary` (`is_primary`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: orders
-- =====================================================
CREATE TABLE `orders` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(50) NULL,
  `game_id` VARCHAR(50) NULL,
  `full_name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `delivery_service` ENUM('nova_poshta', 'ukr_poshta') NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `branch` VARCHAR(255) NOT NULL,
  `payment_method` ENUM('cash_on_delivery', 'online') NOT NULL,
  `comment` TEXT NULL,
  `total_price` DECIMAL(10,2) NOT NULL,
  `duration_hours` INT NOT NULL DEFAULT 1,
  `needs_consultation` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('pending', 'processing', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: order_items
-- =====================================================
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `game_id` VARCHAR(50) NULL,
  `title` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_game_id` (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: favorites
-- =====================================================
CREATE TABLE `favorites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `game_id` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`game_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_game` (`user_id`, `game_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_game_id` (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
