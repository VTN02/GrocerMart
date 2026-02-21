-- Fix Negative Balances (User reported issue where Debt was stored as negative)
-- We assume that large negative balances in a Credit system with Limits are intended to be Debt.

-- 1. Flip negative outstanding balances to positive
UPDATE credit_customers 
SET outstanding_balance = ABS(outstanding_balance) 
WHERE outstanding_balance < 0;

-- 2. Ensure total_purchases is positive (if affected by V19 backfill)
UPDATE credit_customers 
SET total_purchases = ABS(total_purchases) 
WHERE total_purchases < 0;

-- 3. Recalculate Available Credit (Not stored in DB, but good to verify logic holds)
-- No table update needed for available_credit as it's computed on the fly/DTO.
