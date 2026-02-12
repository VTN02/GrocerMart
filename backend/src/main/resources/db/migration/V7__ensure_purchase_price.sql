SET @db := DATABASE();

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'purchase_price'
);
SET @sql := IF(@col_exists = 0, 'ALTER TABLE products ADD COLUMN purchase_price DOUBLE DEFAULT 0.0', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
