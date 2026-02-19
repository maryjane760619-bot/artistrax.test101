-- Check what the orders_status_check constraint allows
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'orders_status_check';

-- Also show current distinct status values in orders table
SELECT DISTINCT status FROM orders;
