-- Releases Table
-- For albums, EPs, compilations - groups of tracks

CREATE TABLE IF NOT EXISTS releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ownership
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL, -- Optional: if release is by single artist
  
  -- Release Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  release_type TEXT CHECK (release_type IN ('album', 'ep', 'single', 'compilation', 'mixtape')) DEFAULT 'album',
  release_date DATE,
  
  -- Media
  cover_url TEXT,
  description TEXT,
  
  -- Catalog
  catalog_number TEXT, -- e.g., "SIESTA001"
  
  -- Pricing
  bundle_price DECIMAL(10,2), -- Price for buying entire release (vs individual tracks)
  bundle_discount_percent INTEGER DEFAULT 0, -- e.g., 20 = 20% off individual track prices
  
  -- Stats
  total_tracks INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- seconds
  download_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  
  -- Metadata
  genre TEXT,
  tags TEXT[], -- Array of tags
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add release_id to tracks table
ALTER TABLE tracks 
ADD COLUMN IF NOT EXISTS release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS track_number INTEGER;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_releases_label ON releases(label_id);
CREATE INDEX IF NOT EXISTS idx_releases_artist ON releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_releases_slug ON releases(slug);
CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases(release_date);
CREATE INDEX IF NOT EXISTS idx_tracks_release ON tracks(release_id);

-- Function to auto-update release stats
CREATE OR REPLACE FUNCTION update_release_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE releases
    SET 
      total_tracks = (SELECT COUNT(*) FROM tracks WHERE release_id = NEW.release_id),
      total_duration = (SELECT COALESCE(SUM(duration), 0) FROM tracks WHERE release_id = NEW.release_id)
    WHERE id = NEW.release_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE releases
    SET 
      total_tracks = (SELECT COUNT(*) FROM tracks WHERE release_id = OLD.release_id),
      total_duration = (SELECT COALESCE(SUM(duration), 0) FROM tracks WHERE release_id = OLD.release_id)
    WHERE id = OLD.release_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update release stats when tracks change
DROP TRIGGER IF EXISTS trigger_update_release_stats ON tracks;
CREATE TRIGGER trigger_update_release_stats
  AFTER INSERT OR UPDATE OR DELETE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_release_stats();

-- Row Level Security
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

-- Public can read all releases
CREATE POLICY "Releases are viewable by everyone"
  ON releases FOR SELECT
  USING (true);

-- Labels can insert their own releases
CREATE POLICY "Labels can insert their own releases"
  ON releases FOR INSERT
  WITH CHECK (auth.uid() = label_id);

-- Labels can update their own releases
CREATE POLICY "Labels can update their own releases"
  ON releases FOR UPDATE
  USING (auth.uid() = label_id);

-- Labels can delete their own releases
CREATE POLICY "Labels can delete their own releases"
  ON releases FOR DELETE
  USING (auth.uid() = label_id);

-- Comments
COMMENT ON TABLE releases IS 'Albums, EPs, and other grouped track collections';
COMMENT ON COLUMN releases.bundle_price IS 'Price to buy entire release as a bundle';
COMMENT ON COLUMN releases.bundle_discount_percent IS 'Discount when buying bundle vs individual tracks';
COMMENT ON COLUMN releases.catalog_number IS 'Label catalog number (e.g., SIESTA001)';
