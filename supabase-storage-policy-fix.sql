-- Fix storage policies for covers bucket
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Artists can upload their own covers" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view covers" ON storage.objects;
DROP POLICY IF EXISTS "Artists can update their own covers" ON storage.objects;
DROP POLICY IF EXISTS "Artists can delete their own covers" ON storage.objects;

-- Recreate policies with better logic
CREATE POLICY "Authenticated users can upload covers" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'covers' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view covers" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY "Users can update their own covers" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'covers' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own covers" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'covers' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
