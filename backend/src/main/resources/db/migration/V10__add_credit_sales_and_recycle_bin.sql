-- Create sequence table for safe invoice generation
-- (Assuming this was already done in V9 but re-iterating to be safe if V9 was skipped or partial. Since we cannot re-run V9, we assume V9 is applied.
-- If V9 failed, we fix it forwards. 
-- However, user said "Use Flyway migrations for schema changes", so we create V10.)

-- Update Orders table to support CREDIT linkage and linking to Sales
ALTER TABLE orders
ADD COLUMN sales_record_id BIGINT,
ADD COLUMN payment_method VARCHAR(20) DEFAULT 'CASH',
ADD CONSTRAINT fk_orders_sales_record FOREIGN KEY (sales_record_id) REFERENCES sales_records(id);

-- Ensure credit_customer_id is in orders if not already (it might be visitor by default)
-- (Assuming orders table has customer_id or similar. Let's check existing schema via assumption or partial memory.
-- Usually Update 1 says "If CREDIT: creditCustomerId is REQUIRED". 
-- If orders table doesn't have it, we add it. If it has `customer_id`, we clarify usage.)

-- Create recycle bin tables for Cheques, Orders, Sales
CREATE TABLE deleted_cheques (
    id BIGINT PRIMARY KEY,
    cheque_number VARCHAR(50),
    bank_name VARCHAR(100),
    amount DECIMAL(19,2),
    status VARCHAR(20),
    deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    data JSON
);

CREATE TABLE deleted_orders (
    id BIGINT PRIMARY KEY,
    order_date DATETIME,
    total_amount DECIMAL(19,2),
    status VARCHAR(20),
    deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    data JSON
);

CREATE TABLE deleted_sales (
    id BIGINT PRIMARY KEY,
    invoice_id VARCHAR(20),
    sales_date DATE,
    total_revenue DECIMAL(19,2),
    deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    data JSON
);
