-- Create storage buckets for artistrax
-- Run this in Supabase SQL Editor

-- Audio files bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Cover art bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio bucket
CREATE POLICY "Artists can upload their own audio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio');

CREATE POLICY "Artists can update their own audio"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Artists can delete their own audio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for covers bucket
CREATE POLICY "Artists can upload their own covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'covers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "Artists can update their own covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'covers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Artists can delete their own covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'covers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
