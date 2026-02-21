-- Update Public ID format to remove the '#' symbol across all tables
-- This aligns the existing data with the updated PublicIdGeneratorService implementation

-- 1. Main Tables
UPDATE users SET public_id = REPLACE(public_id, '-#', '-');
UPDATE products SET public_id = REPLACE(public_id, '-#', '-');
UPDATE sales_records SET public_id = REPLACE(public_id, '-#', '-');
UPDATE orders SET public_id = REPLACE(public_id, '-#', '-');
UPDATE credit_customers SET public_id = REPLACE(public_id, '-#', '-');
UPDATE cheques SET public_id = REPLACE(public_id, '-#', '-');
UPDATE purchase_orders SET public_id = REPLACE(public_id, '-#', '-');
UPDATE suppliers SET public_id = REPLACE(public_id, '-#', '-');

-- 2. Trash Tables
UPDATE deleted_users SET public_id = REPLACE(public_id, '-#', '-') WHERE public_id IS NOT NULL;
UPDATE deleted_products SET public_id = REPLACE(public_id, '-#', '-') WHERE public_id IS NOT NULL;
UPDATE deleted_suppliers SET public_id = REPLACE(public_id, '-#', '-') WHERE public_id IS NOT NULL;
UPDATE deleted_credit_customers SET public_id = REPLACE(public_id, '-#', '-') WHERE public_id IS NOT NULL;
UPDATE deleted_orders SET public_id = REPLACE(public_id, '-#', '-') WHERE public_id IS NOT NULL;
UPDATE deleted_sales SET public_id = REPLACE(public_id, '-#', '-') WHERE public_id IS NOT NULL;
UPDATE deleted_cheques SET public_id = REPLACE(public_id, '-#', '-') WHERE public_id IS NOT NULL;
UPDATE deleted_purchase_orders SET public_id = REPLACE(public_id, '-#', '-') WHERE public_id IS NOT NULL;
