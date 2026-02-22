-- Mastering Service Schema
-- LANDR integration for Artistrax

-- Mastering jobs table
CREATE TABLE IF NOT EXISTS mastering_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending_payment', 'processing', 'completed', 'failed', 'refunded')) DEFAULT 'pending_payment',
  style TEXT CHECK (style IN ('warm', 'balanced', 'open')) DEFAULT 'balanced',
  style TEXT CHECK (style IN ('warm', 'balanced', 'open', 'loud')) DEFAULT 'balanced',
  loudness TEXT CHECK (loudness IN ('low', 'medium', 'high')) DEFAULT 'medium',
  format TEXT CHECK (format IN ('cd', 'mp3', 'wav')) DEFAULT 'wav',
  original_audio_url TEXT NOT NULL,
  mastered_audio_url TEXT,
  cost DECIMAL(10, 2) DEFAULT 9.99,
  payment_id TEXT,
  paid_at TIMESTAMPTZ,
  -- LANDR API fields
  landr_master_id TEXT,
  landr_status_url TEXT,
  error_message TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mastering_jobs_artist_id ON mastering_jobs(artist_id);
CREATE INDEX IF NOT EXISTS idx_mastering_jobs_track_id ON mastering_jobs(track_id);
CREATE INDEX IF NOT EXISTS idx_mastering_jobs_status ON mastering_jobs(status);

-- Trigger for updated_at
CREATE TRIGGER update_mastering_jobs_updated_at 
  BEFORE UPDATE ON mastering_jobs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE mastering_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Artists can view their own mastering jobs" 
  ON mastering_jobs FOR SELECT 
  USING (auth.uid() = artist_id);

CREATE POLICY "Artists can create their own mastering jobs" 
  ON mastering_jobs FOR INSERT 
  WITH CHECK (auth.uid() = artist_id);

-- Pricing table for different mastering options
CREATE TABLE IF NOT EXISTS mastering_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cost DECIMAL(10, 2) NOT NULL,
  features TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pricing
INSERT INTO mastering_pricing (name, description, cost, features) VALUES
('Standard Mastering', 'AI-powered mastering optimized for streaming platforms', 9.99, 
 ARRAY['AI mastering', 'Streaming optimized', 'Instant delivery', 'WAV + MP3 formats']),

('Pro Mastering', 'Advanced mastering with human engineer review', 24.99,
 ARRAY['AI + Human review', 'Streaming + Vinyl optimized', '2 revision rounds', 'All formats', 'Stem mastering'])

ON CONFLICT DO NOTHING;

-- Mastering stats for artists
CREATE OR REPLACE VIEW artist_mastering_stats AS
SELECT 
  artist_id,
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
  SUM(cost) FILTER (WHERE status = 'completed') as total_spent,
  AVG(completed_at - created_at) FILTER (WHERE status = 'completed') as avg_processing_time
FROM mastering_jobs
GROUP BY artist_id;