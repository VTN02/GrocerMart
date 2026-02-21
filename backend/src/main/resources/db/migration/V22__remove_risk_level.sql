-- Remove AI Risk Level feature from credit_customers
DROP INDEX idx_credit_cust_risk ON credit_customers;
ALTER TABLE credit_customers DROP COLUMN risk_level;
