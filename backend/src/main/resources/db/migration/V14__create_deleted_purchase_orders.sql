CREATE TABLE deleted_purchase_orders (
    deleted_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_id BIGINT NOT NULL,
    public_id VARCHAR(20),
    deleted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_by_user_id BIGINT,
    reason VARCHAR(255),
    snapshot_json LONGTEXT NOT NULL,
    restored BOOLEAN DEFAULT FALSE,
    restored_at DATETIME,
    restore_count INT DEFAULT 0,
    INDEX idx_original_id (original_id),
    INDEX idx_public_id (public_id),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_restored (restored)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
