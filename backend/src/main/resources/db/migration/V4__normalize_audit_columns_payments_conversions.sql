-- Normalize audit columns for credit_payments + stock_conversions in existing databases

SET @db := DATABASE();

-- CREDIT_PAYMENTS
SET @has_created_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='credit_payments' AND COLUMN_NAME='created_at'
);
SET @has_createdAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='credit_payments' AND COLUMN_NAME='createdAt'
);
SET @sql := IF(@has_created_at=0 AND @has_createdAt=1,
  'ALTER TABLE credit_payments RENAME COLUMN createdAt TO created_at',
  IF(@has_created_at=0 AND @has_createdAt=0,
    'ALTER TABLE credit_payments ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- STOCK_CONVERSIONS
SET @has_created_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_conversions' AND COLUMN_NAME='created_at'
);
SET @has_createdAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='stock_conversions' AND COLUMN_NAME='createdAt'
);
SET @sql := IF(@has_created_at=0 AND @has_createdAt=1,
  'ALTER TABLE stock_conversions RENAME COLUMN createdAt TO created_at',
  IF(@has_created_at=0 AND @has_createdAt=0,
    'ALTER TABLE stock_conversions ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
