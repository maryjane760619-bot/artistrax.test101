-- Check videos table
SELECT id, title, artist_id, label_id, is_public, video_url, created_at 
FROM videos 
ORDER BY created_at DESC 
LIMIT 10;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE name = 'videos';

-- Check storage files
SELECT * FROM storage.objects WHERE bucket_id = 'videos' ORDER BY created_at DESC LIMIT 10;
