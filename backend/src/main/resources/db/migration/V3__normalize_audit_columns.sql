-- Normalize audit columns (created_at/updated_at) for existing databases.
-- Uses additive / rename-first approach to avoid destructive changes.

SET @db := DATABASE();

-- Helper pattern: if camelCase exists and snake_case doesn't, rename.
-- If neither exists, add snake_case and backfill with CURRENT_TIMESTAMP.

-- CHEQUES
SET @has_created_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='cheques' AND COLUMN_NAME='created_at'
);
SET @has_createdAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='cheques' AND COLUMN_NAME='createdAt'
);
SET @sql := IF(@has_created_at=0 AND @has_createdAt=1,
  'ALTER TABLE cheques RENAME COLUMN createdAt TO created_at',
  IF(@has_created_at=0 AND @has_createdAt=0,
    'ALTER TABLE cheques ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_updated_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='cheques' AND COLUMN_NAME='updated_at'
);
SET @has_updatedAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='cheques' AND COLUMN_NAME='updatedAt'
);
SET @sql := IF(@has_updated_at=0 AND @has_updatedAt=1,
  'ALTER TABLE cheques RENAME COLUMN updatedAt TO updated_at',
  IF(@has_updated_at=0 AND @has_updatedAt=0,
    'ALTER TABLE cheques ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- USERS
SET @has_created_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='users' AND COLUMN_NAME='created_at'
);
SET @has_createdAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='users' AND COLUMN_NAME='createdAt'
);
SET @sql := IF(@has_created_at=0 AND @has_createdAt=1,
  'ALTER TABLE users RENAME COLUMN createdAt TO created_at',
  IF(@has_created_at=0 AND @has_createdAt=0,
    'ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_updated_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='users' AND COLUMN_NAME='updated_at'
);
SET @has_updatedAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='users' AND COLUMN_NAME='updatedAt'
);
SET @sql := IF(@has_updated_at=0 AND @has_updatedAt=1,
  'ALTER TABLE users RENAME COLUMN updatedAt TO updated_at',
  IF(@has_updated_at=0 AND @has_updatedAt=0,
    'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- PRODUCTS
SET @has_created_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='products' AND COLUMN_NAME='created_at'
);
SET @has_createdAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='products' AND COLUMN_NAME='createdAt'
);
SET @sql := IF(@has_created_at=0 AND @has_createdAt=1,
  'ALTER TABLE products RENAME COLUMN createdAt TO created_at',
  IF(@has_created_at=0 AND @has_createdAt=0,
    'ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_updated_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='products' AND COLUMN_NAME='updated_at'
);
SET @has_updatedAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='products' AND COLUMN_NAME='updatedAt'
);
SET @sql := IF(@has_updated_at=0 AND @has_updatedAt=1,
  'ALTER TABLE products RENAME COLUMN updatedAt TO updated_at',
  IF(@has_updated_at=0 AND @has_updatedAt=0,
    'ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- CREDIT_CUSTOMERS
SET @has_created_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='credit_customers' AND COLUMN_NAME='created_at'
);
SET @has_createdAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='credit_customers' AND COLUMN_NAME='createdAt'
);
SET @sql := IF(@has_created_at=0 AND @has_createdAt=1,
  'ALTER TABLE credit_customers RENAME COLUMN createdAt TO created_at',
  IF(@has_created_at=0 AND @has_createdAt=0,
    'ALTER TABLE credit_customers ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_updated_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='credit_customers' AND COLUMN_NAME='updated_at'
);
SET @has_updatedAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='credit_customers' AND COLUMN_NAME='updatedAt'
);
SET @sql := IF(@has_updated_at=0 AND @has_updatedAt=1,
  'ALTER TABLE credit_customers RENAME COLUMN updatedAt TO updated_at',
  IF(@has_updated_at=0 AND @has_updatedAt=0,
    'ALTER TABLE credit_customers ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ORDERS
SET @has_created_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='orders' AND COLUMN_NAME='created_at'
);
SET @has_createdAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='orders' AND COLUMN_NAME='createdAt'
);
SET @sql := IF(@has_created_at=0 AND @has_createdAt=1,
  'ALTER TABLE orders RENAME COLUMN createdAt TO created_at',
  IF(@has_created_at=0 AND @has_createdAt=0,
    'ALTER TABLE orders ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_updated_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='orders' AND COLUMN_NAME='updated_at'
);
SET @has_updatedAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='orders' AND COLUMN_NAME='updatedAt'
);
SET @sql := IF(@has_updated_at=0 AND @has_updatedAt=1,
  'ALTER TABLE orders RENAME COLUMN updatedAt TO updated_at',
  IF(@has_updated_at=0 AND @has_updatedAt=0,
    'ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- SUPPLIERS
SET @has_created_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='suppliers' AND COLUMN_NAME='created_at'
);
SET @has_createdAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='suppliers' AND COLUMN_NAME='createdAt'
);
SET @sql := IF(@has_created_at=0 AND @has_createdAt=1,
  'ALTER TABLE suppliers RENAME COLUMN createdAt TO created_at',
  IF(@has_created_at=0 AND @has_createdAt=0,
    'ALTER TABLE suppliers ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_updated_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='suppliers' AND COLUMN_NAME='updated_at'
);
SET @has_updatedAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='suppliers' AND COLUMN_NAME='updatedAt'
);
SET @sql := IF(@has_updated_at=0 AND @has_updatedAt=1,
  'ALTER TABLE suppliers RENAME COLUMN updatedAt TO updated_at',
  IF(@has_updated_at=0 AND @has_updatedAt=0,
    'ALTER TABLE suppliers ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- PURCHASE_ORDERS
SET @has_created_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='purchase_orders' AND COLUMN_NAME='created_at'
);
SET @has_createdAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='purchase_orders' AND COLUMN_NAME='createdAt'
);
SET @sql := IF(@has_created_at=0 AND @has_createdAt=1,
  'ALTER TABLE purchase_orders RENAME COLUMN createdAt TO created_at',
  IF(@has_created_at=0 AND @has_createdAt=0,
    'ALTER TABLE purchase_orders ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_updated_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='purchase_orders' AND COLUMN_NAME='updated_at'
);
SET @has_updatedAt := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='purchase_orders' AND COLUMN_NAME='updatedAt'
);
SET @sql := IF(@has_updated_at=0 AND @has_updatedAt=1,
  'ALTER TABLE purchase_orders RENAME COLUMN updatedAt TO updated_at',
  IF(@has_updated_at=0 AND @has_updatedAt=0,
    'ALTER TABLE purchase_orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
