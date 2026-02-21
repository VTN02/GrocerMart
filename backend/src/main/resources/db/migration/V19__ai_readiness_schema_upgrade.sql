-- AI Readiness Schema Upgrade

-- 1. Global Audit Columns (ensure consistency)
-- Users
ALTER TABLE users ADD COLUMN deleted_at DATETIME NULL;
ALTER TABLE users ADD COLUMN deleted_by VARCHAR(50) NULL;
ALTER TABLE users ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- Products
ALTER TABLE products ADD COLUMN deleted_at DATETIME NULL;
ALTER TABLE products ADD COLUMN deleted_by VARCHAR(50) NULL;
ALTER TABLE products ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- Suppliers
ALTER TABLE suppliers ADD COLUMN deleted_at DATETIME NULL;
ALTER TABLE suppliers ADD COLUMN deleted_by VARCHAR(50) NULL;
ALTER TABLE suppliers ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- 2. Credit Customers Enhancements (Risk AI)
ALTER TABLE credit_customers
    ADD COLUMN customer_type ENUM('CASH','CREDIT') DEFAULT 'CREDIT',
    ADD COLUMN total_purchases DECIMAL(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN total_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN last_payment_date DATE NULL,
    ADD COLUMN risk_level ENUM('LOW','MEDIUM','HIGH') NULL,
    ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE,
    ADD COLUMN deleted_at DATETIME NULL,
    ADD COLUMN deleted_by VARCHAR(50) NULL;

-- Backfill total_purchases/paid for existing customers (simple estimation)
UPDATE credit_customers SET total_purchases = outstanding_balance WHERE total_purchases = 0;

-- 3. Sales / Invoices Enhancements (Payment Status & Demand AI)
ALTER TABLE sales_records
    ADD COLUMN due_date DATE NULL,
    ADD COLUMN paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN payment_status ENUM('PAID','PARTIAL','UNPAID') NOT NULL DEFAULT 'UNPAID',
    ADD COLUMN days_overdue INT NOT NULL DEFAULT 0,
    ADD COLUMN cashier_id BIGINT NULL,
    ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE,
    ADD COLUMN deleted_at DATETIME NULL,
    ADD COLUMN deleted_by VARCHAR(50) NULL;

-- Backfill Sales: If payment_method is CASH, assume PAID
UPDATE sales_records SET
    payment_status = 'PAID',
    paid_amount = total_revenue
WHERE payment_method = 'CASH';

-- 4. Sales Items Snapshots (Forecasting)
ALTER TABLE sales_items
    ADD COLUMN product_name_snapshot VARCHAR(120),
    ADD COLUMN category_snapshot VARCHAR(80),
    ADD COLUMN unit_or_bulk ENUM('UNIT','BULK') DEFAULT 'UNIT',
    ADD COLUMN promotion_applied BOOLEAN DEFAULT FALSE,
    ADD COLUMN discount_amount DECIMAL(12,2) DEFAULT 0;

-- Backfill Item Snapshots from Products
UPDATE sales_items si
JOIN products p ON si.product_id = p.id
SET si.product_name_snapshot = p.name,
    si.category_snapshot = p.category
WHERE si.product_name_snapshot IS NULL;

-- 5. Credit Payments Enhancements
ALTER TABLE credit_payments
    ADD COLUMN public_id VARCHAR(20) NULL,
    ADD COLUMN invoice_id BIGINT NULL,
    ADD COLUMN payment_method ENUM('CASH','CHEQUE','BANK') DEFAULT 'CASH',
    ADD COLUMN status ENUM('SUCCESS','PENDING','BOUNCED') DEFAULT 'SUCCESS',
    ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE,
    ADD COLUMN deleted_at DATETIME NULL,
    ADD COLUMN deleted_by VARCHAR(50) NULL;

-- 6. Cheques Enhancements (Risk AI)
ALTER TABLE cheques
    ADD COLUMN invoice_id BIGINT NULL,
    ADD COLUMN deposit_date DATE NULL,
    ADD COLUMN bounce_reason VARCHAR(120) NULL,
    ADD COLUMN migrated_to_debt BOOLEAN DEFAULT FALSE,
    ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE,
    ADD COLUMN deleted_at DATETIME NULL,
    ADD COLUMN deleted_by VARCHAR(50) NULL;

-- 7. New Table: Stock Movements
CREATE TABLE IF NOT EXISTS stock_movements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    public_id VARCHAR(20),
    product_id BIGINT NOT NULL,
    movement_type ENUM('IN','OUT','ADJUSTMENT') NOT NULL,
    quantity INT NOT NULL,
    movement_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(120),
    reference_type VARCHAR(30),
    reference_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_movement_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Indexes
-- Using standard CREATE INDEX
CREATE INDEX idx_credit_cust_risk ON credit_customers(risk_level);
CREATE INDEX idx_sales_pstatus ON sales_records(payment_status);
CREATE INDEX idx_sales_duedate ON sales_records(due_date);
CREATE INDEX idx_sales_customer ON sales_records(credit_customer_id);
