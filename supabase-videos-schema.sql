-- Videos table for artists and labels
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL, -- URL to video file in storage
  thumbnail_url TEXT, -- URL to thumbnail image
  duration INTEGER, -- Duration in seconds
  view_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  category TEXT, -- 'music_video', 'behind_the_scenes', 'tutorial', 'live', 'other'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure video belongs to either artist OR label, not both
  CONSTRAINT video_owner_check CHECK (
    (artist_id IS NOT NULL AND label_id IS NULL) OR
    (artist_id IS NULL AND label_id IS NOT NULL)
  )
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_artist_id ON videos(artist_id);
CREATE INDEX IF NOT EXISTS idx_videos_label_id ON videos(label_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_public ON videos(is_public);

-- Video views tracking (optional - for analytics)
CREATE TABLE IF NOT EXISTS video_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON video_views(video_id);
CREATE INDEX IF NOT EXISTS idx_video_views_created_at ON video_views(created_at DESC);

-- RLS Policies (temporarily disabled for development)
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_views DISABLE ROW LEVEL SECURITY;

-- Storage bucket for videos (run this in Supabase dashboard if bucket doesn't exist)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('videos', 'videos', true);

-- Storage policies for videos bucket
-- CREATE POLICY "Public video access" ON storage.objects
--   FOR SELECT USING (bucket_id = 'videos');

-- CREATE POLICY "Authenticated users can upload videos" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

-- CREATE POLICY "Users can update own videos" ON storage.objects
--   FOR UPDATE USING (bucket_id = 'videos' AND auth.uid()::text = owner);

-- CREATE POLICY "Users can delete own videos" ON storage.objects
--   FOR DELETE USING (bucket_id = 'videos' AND auth.uid()::text = owner);
