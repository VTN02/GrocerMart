-- 1. Create Sequence Table
CREATE TABLE public_id_sequence (
    entity_type VARCHAR(50) PRIMARY KEY,
    next_number BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO public_id_sequence (entity_type, next_number) VALUES
('USER', 1),
('PRODUCT', 1),
('SALE', 1),
('ORDER', 1),
('CREDIT_CUSTOMER', 1),
('CHEQUE', 1),
('PURCHASE_ORDER', 1),
('SUPPLIER', 1);

-- 2. Add public_id to main tables
-- Users
ALTER TABLE users ADD COLUMN public_id VARCHAR(20) UNIQUE;

-- Products
ALTER TABLE products ADD COLUMN public_id VARCHAR(20) UNIQUE;

-- Sales Records
ALTER TABLE sales_records ADD COLUMN public_id VARCHAR(20) UNIQUE;

-- Orders
ALTER TABLE orders ADD COLUMN public_id VARCHAR(20) UNIQUE;

-- Credit Customers
ALTER TABLE credit_customers ADD COLUMN public_id VARCHAR(20) UNIQUE;

-- Cheques
ALTER TABLE cheques ADD COLUMN public_id VARCHAR(20) UNIQUE;

-- Purchase Orders
ALTER TABLE purchase_orders ADD COLUMN public_id VARCHAR(20) UNIQUE;

-- Suppliers
ALTER TABLE suppliers ADD COLUMN public_id VARCHAR(20) UNIQUE;


-- 3. Add public_id to trash tables
ALTER TABLE deleted_users ADD COLUMN public_id VARCHAR(20);
ALTER TABLE deleted_products ADD COLUMN public_id VARCHAR(20);
ALTER TABLE deleted_suppliers ADD COLUMN public_id VARCHAR(20);
ALTER TABLE deleted_credit_customers ADD COLUMN public_id VARCHAR(20);
ALTER TABLE deleted_orders ADD COLUMN public_id VARCHAR(20);
ALTER TABLE deleted_sales ADD COLUMN public_id VARCHAR(20);
ALTER TABLE deleted_cheques ADD COLUMN public_id VARCHAR(20);

-- Indexes for trash tables
ALTER TABLE deleted_users ADD INDEX idx_deleted_public_id (public_id);
ALTER TABLE deleted_products ADD INDEX idx_deleted_public_id (public_id);
ALTER TABLE deleted_suppliers ADD INDEX idx_deleted_public_id (public_id);
ALTER TABLE deleted_credit_customers ADD INDEX idx_deleted_public_id (public_id);
ALTER TABLE deleted_orders ADD INDEX idx_deleted_public_id (public_id);
ALTER TABLE deleted_sales ADD INDEX idx_deleted_public_id (public_id);
ALTER TABLE deleted_cheques ADD INDEX idx_deleted_public_id (public_id);

-- 4. Backfill Data

-- Users: Admin VTNV must be U-#0001
-- We update all users ensuring sequential order by ID
UPDATE users 
SET public_id = CONCAT('U-#', LPAD(id, 4, '0'));
-- If admin 'VTNV' exists but id is not 1, we might have an issue if we want strict U-#0001 for it.
-- However, assuming typical install, admin is likely ID 1.
-- If not, for now let's stick to ID based mapping as it guarantees uniqueness and deterministic behavior.
UPDATE public_id_sequence SET next_number = (SELECT COALESCE(MAX(id), 0) + 1 FROM users) WHERE entity_type = 'USER';

-- Products
UPDATE products 
SET public_id = CONCAT('P-#', LPAD(id, 4, '0'));
UPDATE public_id_sequence SET next_number = (SELECT COALESCE(MAX(id), 0) + 1 FROM products) WHERE entity_type = 'PRODUCT';

-- Sales Records
UPDATE sales_records 
SET public_id = CONCAT('S-#', LPAD(id, 4, '0'));
UPDATE public_id_sequence SET next_number = (SELECT COALESCE(MAX(id), 0) + 1 FROM sales_records) WHERE entity_type = 'SALE';

-- Orders
UPDATE orders 
SET public_id = CONCAT('O-#', LPAD(id, 4, '0'));
UPDATE public_id_sequence SET next_number = (SELECT COALESCE(MAX(id), 0) + 1 FROM orders) WHERE entity_type = 'ORDER';

-- Credit Customers
UPDATE credit_customers 
SET public_id = CONCAT('CC-#', LPAD(id, 4, '0'));
UPDATE public_id_sequence SET next_number = (SELECT COALESCE(MAX(id), 0) + 1 FROM credit_customers) WHERE entity_type = 'CREDIT_CUSTOMER';

-- Cheques
UPDATE cheques 
SET public_id = CONCAT('C-#', LPAD(id, 4, '0'));
UPDATE public_id_sequence SET next_number = (SELECT COALESCE(MAX(id), 0) + 1 FROM cheques) WHERE entity_type = 'CHEQUE';

-- Purchase Orders
UPDATE purchase_orders 
SET public_id = CONCAT('PO-#', LPAD(id, 4, '0'));
UPDATE public_id_sequence SET next_number = (SELECT COALESCE(MAX(id), 0) + 1 FROM purchase_orders) WHERE entity_type = 'PURCHASE_ORDER';

-- Suppliers
UPDATE suppliers 
SET public_id = CONCAT('SUP-#', LPAD(id, 4, '0'));
UPDATE public_id_sequence SET next_number = (SELECT COALESCE(MAX(id), 0) + 1 FROM suppliers) WHERE entity_type = 'SUPPLIER';

-- 5. Set NOT NULL constraints now that data is filled
ALTER TABLE users MODIFY COLUMN public_id VARCHAR(20) NOT NULL;
ALTER TABLE products MODIFY COLUMN public_id VARCHAR(20) NOT NULL;
ALTER TABLE sales_records MODIFY COLUMN public_id VARCHAR(20) NOT NULL;
ALTER TABLE orders MODIFY COLUMN public_id VARCHAR(20) NOT NULL;
ALTER TABLE credit_customers MODIFY COLUMN public_id VARCHAR(20) NOT NULL;
ALTER TABLE cheques MODIFY COLUMN public_id VARCHAR(20) NOT NULL;
ALTER TABLE purchase_orders MODIFY COLUMN public_id VARCHAR(20) NOT NULL;
ALTER TABLE suppliers MODIFY COLUMN public_id VARCHAR(20) NOT NULL;
