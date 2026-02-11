-- =====================================================
-- Trash / Recycle Bin System - Deleted Tables
-- =====================================================

-- Deleted Users Table
CREATE TABLE deleted_users (
    deleted_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id BIGINT NOT NULL,
    deleted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_by_user_id BIGINT,
    reason VARCHAR(255),
    snapshot_json LONGTEXT NOT NULL,
    restored BOOLEAN DEFAULT FALSE,
    restored_at DATETIME,
    restore_count INT DEFAULT 0,
    INDEX idx_original_id (original_id),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_restored (restored)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deleted Products Table
CREATE TABLE deleted_products (
    deleted_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id BIGINT NOT NULL,
    deleted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_by_user_id BIGINT,
    reason VARCHAR(255),
    snapshot_json LONGTEXT NOT NULL,
    restored BOOLEAN DEFAULT FALSE,
    restored_at DATETIME,
    restore_count INT DEFAULT 0,
    INDEX idx_original_id (original_id),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_restored (restored)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deleted Suppliers Table
CREATE TABLE deleted_suppliers (
    deleted_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id BIGINT NOT NULL,
    deleted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_by_user_id BIGINT,
    reason VARCHAR(255),
    snapshot_json LONGTEXT NOT NULL,
    restored BOOLEAN DEFAULT FALSE,
    restored_at DATETIME,
    restore_count INT DEFAULT 0,
    INDEX idx_original_id (original_id),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_restored (restored)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deleted Credit Customers Table
CREATE TABLE deleted_credit_customers (
    deleted_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id BIGINT NOT NULL,
    deleted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_by_user_id BIGINT,
    reason VARCHAR(255),
    snapshot_json LONGTEXT NOT NULL,
    restored BOOLEAN DEFAULT FALSE,
    restored_at DATETIME,
    restore_count INT DEFAULT 0,
    INDEX idx_original_id (original_id),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_restored (restored)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
