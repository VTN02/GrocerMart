ALTER TABLE credit_customers ADD COLUMN available_credit DOUBLE DEFAULT 0.0;

-- Initialize values for existing customers
UPDATE credit_customers SET available_credit = credit_limit - outstanding_balance;
