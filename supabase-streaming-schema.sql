-- Streaming Feature Schema
-- Adds stream tracking and library management for artistrax

-- Add streaming_url column to tracks (for MP3 streaming version)
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS streaming_url TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS file_size_stream INTEGER;

-- Create stream_plays table for analytics
CREATE TABLE IF NOT EXISTS stream_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES fans(id) ON DELETE CASCADE,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  device_type TEXT, -- 'mobile', 'desktop', 'pwa'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_stream_plays_track_id ON stream_plays(track_id);
CREATE INDEX IF NOT EXISTS idx_stream_plays_user_id ON stream_plays(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_plays_played_at ON stream_plays(played_at);

-- Create view for stream analytics (per track)
CREATE OR REPLACE VIEW track_stream_stats AS
SELECT 
  track_id,
  COUNT(*) as total_streams,
  COUNT(DISTINCT user_id) as unique_listeners,
  AVG(duration_seconds) as avg_listen_duration,
  SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed_streams,
  MAX(played_at) as last_streamed
FROM stream_plays
GROUP BY track_id;

-- Create view for user listening history
CREATE OR REPLACE VIEW user_listening_history AS
SELECT 
  sp.user_id,
  sp.track_id,
  t.title,
  t.artist_name,
  t.cover_art_url,
  COUNT(*) as play_count,
  MAX(sp.played_at) as last_played,
  MIN(sp.played_at) as first_played
FROM stream_plays sp
JOIN tracks t ON sp.track_id = t.id
GROUP BY sp.user_id, sp.track_id, t.title, t.artist_name, t.cover_art_url;

-- Add comment explaining the feature
COMMENT ON TABLE stream_plays IS 'Tracks streaming plays for purchased tracks. Users can stream unlimited after purchase.';
COMMENT ON COLUMN tracks.streaming_url IS 'Path to MP3 streaming version (320kbps) for bandwidth efficiency';

-- Grant permissions
ALTER TABLE stream_plays ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own stream history
CREATE POLICY "Users can view own streams"
  ON stream_plays FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create stream logs
CREATE POLICY "Users can create stream logs"
  ON stream_plays FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Artists can view streams of their tracks
CREATE POLICY "Artists can view streams of their tracks"
  ON stream_plays FOR SELECT
  USING (
    track_id IN (
      SELECT id FROM tracks WHERE artist_id = auth.uid()
    )
  );

-- Update existing tracks to have streaming_url (copy from audio_url initially)
-- In production, you'd want to transcode to MP3 for bandwidth savings
UPDATE tracks 
SET streaming_url = audio_url 
WHERE streaming_url IS NULL AND audio_url IS NOT NULL;

-- Done!
-- Next step: Transcode WAV/FLAC to MP3 on upload for streaming
