-- Create sequence table for safe invoice generation
CREATE TABLE invoice_sequences (
    sequence_name VARCHAR(50) PRIMARY KEY,
    next_val BIGINT NOT NULL
);

INSERT INTO invoice_sequences (sequence_name, next_val) VALUES ('sales_invoice', 1);

-- Alter sales_records table
ALTER TABLE sales_records
ADD COLUMN invoice_id VARCHAR(20) UNIQUE,
ADD COLUMN payment_method VARCHAR(20) DEFAULT 'CASH';

-- Initialize existing records with dummy invoice IDs to satisfy unique constraint if data exists
-- (In a real scenario, we might need a cursor, but for this update we assume low volume or empty)
UPDATE sales_records SET invoice_id = CONCAT('#', LPAD(id, 4, '0')) WHERE invoice_id IS NULL;

-- Make invoice_id non-nullable after population
ALTER TABLE sales_records MODIFY invoice_id VARCHAR(20) NOT NULL;

-- Index for filtering
CREATE INDEX idx_invoice_id ON sales_records(invoice_id);
CREATE INDEX idx_payment_method ON sales_records(payment_method);
CREATE INDEX idx_total_revenue ON sales_records(total_revenue);
