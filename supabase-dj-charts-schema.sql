-- DJ Charts system for artistrax
-- Run this in Supabase SQL Editor

-- DJ Charts table
CREATE TABLE IF NOT EXISTS dj_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id, slug)
);

-- Chart tracks (many-to-many with ordering)
CREATE TABLE IF NOT EXISTS chart_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chart_id UUID REFERENCES dj_charts(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  note TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chart_id, track_id),
  UNIQUE(chart_id, position)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dj_charts_artist_id ON dj_charts(artist_id);
CREATE INDEX IF NOT EXISTS idx_dj_charts_created_at ON dj_charts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chart_tracks_chart_id ON chart_tracks(chart_id);
CREATE INDEX IF NOT EXISTS idx_chart_tracks_position ON chart_tracks(chart_id, position);

-- Trigger
CREATE TRIGGER update_dj_charts_updated_at BEFORE UPDATE ON dj_charts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE dj_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_tracks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Charts are viewable by everyone" ON dj_charts FOR SELECT USING (is_published = true);
CREATE POLICY "Artists can insert their own charts" ON dj_charts FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Artists can update their own charts" ON dj_charts FOR UPDATE USING (auth.uid() = artist_id);
CREATE POLICY "Artists can delete their own charts" ON dj_charts FOR DELETE USING (auth.uid() = artist_id);

CREATE POLICY "Chart tracks are viewable by everyone" ON chart_tracks FOR SELECT USING (
  chart_id IN (SELECT id FROM dj_charts WHERE is_published = true)
);
CREATE POLICY "Artists can manage their chart tracks" ON chart_tracks FOR INSERT WITH CHECK (
  chart_id IN (SELECT id FROM dj_charts WHERE artist_id = auth.uid())
);
CREATE POLICY "Artists can update their chart tracks" ON chart_tracks FOR UPDATE USING (
  chart_id IN (SELECT id FROM dj_charts WHERE artist_id = auth.uid())
);
CREATE POLICY "Artists can delete their chart tracks" ON chart_tracks FOR DELETE USING (
  chart_id IN (SELECT id FROM dj_charts WHERE artist_id = auth.uid())
);
