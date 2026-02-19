-- Check what's in the order_items table for the test orders
SELECT 
  oi.id,
  oi.order_id,
  oi.product_title,
  oi.variant_name,
  oi.quantity,
  oi.unit_price,
  oi.subtotal,
  oi.artist_id,
  oi.label_id
FROM order_items oi
WHERE oi.order_id IN (
  'c421278a-0c7f-4c81-8dc6-76271e3b862c',
  '047e9432-e4af-4c5c-a6d4-8a667ff0fff9',
  'ba45e8e7-0da7-4fc1-95d3-ae906c268726'
)
ORDER BY oi.order_id;
