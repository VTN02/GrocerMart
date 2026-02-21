-- =====================================================
-- Professional Trash System - Version 2
-- =====================================================

-- Drop the previous partial implementation from V10 to align with new requested structure
DROP TABLE IF EXISTS deleted_orders;
DROP TABLE IF EXISTS deleted_sales;
DROP TABLE IF EXISTS deleted_cheques;

-- 1) Deleted Orders
CREATE TABLE deleted_orders (
    deleted_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id BIGINT NOT NULL,
    deleted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_by_user_id BIGINT NULL,
    reason VARCHAR(255) NULL,
    snapshot_json LONGTEXT NOT NULL,
    restored BOOLEAN DEFAULT FALSE,
    restored_at DATETIME NULL,
    INDEX idx_orders_original_id (original_id),
    INDEX idx_orders_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) Deleted Sales
CREATE TABLE deleted_sales (
    deleted_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id BIGINT NOT NULL,
    deleted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_by_user_id BIGINT NULL,
    reason VARCHAR(255) NULL,
    snapshot_json LONGTEXT NOT NULL,
    restored BOOLEAN DEFAULT FALSE,
    restored_at DATETIME NULL,
    INDEX idx_sales_original_id (original_id),
    INDEX idx_sales_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Deleted Cheques
CREATE TABLE deleted_cheques (
    deleted_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id BIGINT NOT NULL,
    deleted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_by_user_id BIGINT NULL,
    reason VARCHAR(255) NULL,
    snapshot_json LONGTEXT NOT NULL,
    restored BOOLEAN DEFAULT FALSE,
    restored_at DATETIME NULL,
    INDEX idx_cheques_original_id (original_id),
    INDEX idx_cheques_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure audit columns exist for other trash tables from V5 if needed
-- (V5 already used snapshot_json, restored, etc. but V10 deviated)
