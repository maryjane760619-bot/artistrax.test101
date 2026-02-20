-- Live Streaming Platform Database Schema

-- Live streams table
CREATE TABLE IF NOT EXISTS live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  
  -- Stream info
  title TEXT NOT NULL,
  description TEXT,
  
  -- Status: scheduled, live, ended, error
  status TEXT DEFAULT 'scheduled',
  
  -- Timing
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Mux integration fields
  mux_stream_key TEXT,
  mux_playback_id TEXT,
  mux_asset_id TEXT,
  mux_live_stream_id TEXT,
  
  -- Stream settings
  is_public BOOLEAN DEFAULT TRUE,
  require_subscription BOOLEAN DEFAULT FALSE,
  require_purchase BOOLEAN DEFAULT FALSE,
  allow_chat BOOLEAN DEFAULT TRUE,
  
  -- Stats
  max_viewers INTEGER DEFAULT 0,
  total_viewer_minutes INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stream viewers (for analytics and active viewer count)
CREATE TABLE IF NOT EXISTS stream_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_type TEXT CHECK (user_type IN ('artist', 'label', 'fan', 'anonymous')),
  ip_address INET,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  last_ping_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(stream_id, user_id)
);

-- Stream chat messages
CREATE TABLE IF NOT EXISTS stream_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_type TEXT CHECK (user_type IN ('artist', 'label', 'fan')),
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'chat', -- chat, system, donation
  
  is_pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_artist BOOLEAN DEFAULT FALSE, -- Special flag for artist messages
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stream tips/donations during live stream
CREATE TABLE IF NOT EXISTS stream_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  recipient_id UUID REFERENCES auth.users(id), -- Artist/label receiving
  
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON live_streams(status);
CREATE INDEX IF NOT EXISTS idx_live_streams_artist ON live_streams(artist_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_started ON live_streams(started_at);

CREATE INDEX IF NOT EXISTS idx_stream_viewers_stream ON stream_viewers(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_viewers_user ON stream_viewers(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_viewers_active ON stream_viewers(stream_id, left_at) WHERE left_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_stream_chat_stream ON stream_chat(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_created ON stream_chat(stream_id, created_at DESC);

-- Function to update viewer count
CREATE OR REPLACE FUNCTION update_stream_viewer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE live_streams 
    SET max_viewers = GREATEST(max_viewers, (
      SELECT COUNT(*) FROM stream_viewers 
      WHERE stream_id = NEW.stream_id AND left_at IS NULL
    ))
    WHERE id = NEW.stream_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
      -- Viewer left, update total minutes
      UPDATE live_streams 
      SET total_viewer_minutes = total_viewer_minutes + 
        EXTRACT(EPOCH FROM (NEW.left_at - NEW.joined_at))::INTEGER / 60
      WHERE id = NEW.stream_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for viewer count
DROP TRIGGER IF EXISTS trg_update_viewer_count ON stream_viewers;
CREATE TRIGGER trg_update_viewer_count
  AFTER INSERT OR UPDATE ON stream_viewers
  FOR EACH ROW
  EXECUTE FUNCTION update_stream_viewer_count();

-- RLS Policies
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_chat ENABLE ROW ROW LEVEL SECURITY;
ALTER TABLE stream_tips ENABLE ROW LEVEL SECURITY;

-- Live streams: Public can view live/ended streams, artists can manage own
CREATE POLICY "Public can view streams" ON live_streams
  FOR SELECT USING (is_public = TRUE OR status IN ('live', 'ended'));

CREATE POLICY "Artists can manage own streams" ON live_streams
  FOR ALL USING (artist_id = auth.uid());

CREATE POLICY "Labels can manage own streams" ON live_streams
  FOR ALL USING (label_id = auth.uid());

-- Stream chat: Viewers can read, authenticated can post
CREATE POLICY "Viewers can read chat" ON stream_chat
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post" ON stream_chat
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Artists can delete chat" ON stream_chat
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM live_streams 
      WHERE id = stream_chat.stream_id 
      AND (artist_id = auth.uid() OR label_id = auth.uid())
    )
  );

-- Stream viewers: Users can view own, system can manage
CREATE POLICY "Users can view own viewer records" ON stream_viewers
  FOR SELECT USING (user_id = auth.uid());

-- Tips: Public can view, donors can see own
CREATE POLICY "Public can view tips" ON stream_tips
  FOR SELECT USING (true);

CREATE POLICY "Users can create tips" ON stream_tips
  FOR INSERT WITH CHECK (sender_id = auth.uid());