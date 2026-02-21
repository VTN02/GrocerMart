-- Remove default value for credit_limit on credit_customers table
ALTER TABLE credit_customers ALTER COLUMN credit_limit DROP DEFAULT;
