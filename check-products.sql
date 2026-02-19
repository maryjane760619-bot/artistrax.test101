-- Check if products exist and their status
SELECT 
  p.id,
  p.title,
  p.is_active,
  a.username as artist_username,
  a.display_name as artist_name
FROM products p
LEFT JOIN artists a ON p.artist_id = a.id
ORDER BY p.created_at DESC;
