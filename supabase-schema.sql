-- artistrax Database Schema
-- Run this in Supabase SQL Editor: https://wpsmgfulrugrsabgcdmp.supabase.co/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  subdomain TEXT UNIQUE,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  duration INTEGER, -- seconds
  file_size BIGINT, -- bytes
  format TEXT CHECK (format IN ('mp3', 'flac', 'wav')),
  price DECIMAL(10, 2) DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  play_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id, slug)
);

-- Releases table (albums/EPs)
CREATE TABLE IF NOT EXISTS releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  release_type TEXT CHECK (release_type IN ('single', 'ep', 'album', 'compilation')),
  price DECIMAL(10, 2) DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id, slug)
);

-- Release tracks (many-to-many)
CREATE TABLE IF NOT EXISTS release_tracks (
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  PRIMARY KEY (release_id, track_id)
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  buyer_email TEXT NOT NULL,
  buyer_id UUID,
  amount DECIMAL(10, 2) NOT NULL,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((track_id IS NOT NULL) OR (release_id IS NOT NULL))
);

-- Downloads table (tracking)
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  buyer_email TEXT,
  buyer_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plays table (streaming analytics)
CREATE TABLE IF NOT EXISTS plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  listener_id UUID,
  ip_address TEXT,
  duration_played INTEGER, -- seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_slug ON tracks(slug);
CREATE INDEX IF NOT EXISTS idx_purchases_artist_id ON purchases(artist_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_email ON purchases(buyer_email);
CREATE INDEX IF NOT EXISTS idx_downloads_track_id ON downloads(track_id);
CREATE INDEX IF NOT EXISTS idx_downloads_artist_id ON downloads(artist_id);
CREATE INDEX IF NOT EXISTS idx_plays_track_id ON plays(track_id);
CREATE INDEX IF NOT EXISTS idx_plays_artist_id ON plays(artist_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON releases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Artists: public read, artists can update their own
CREATE POLICY "Artists are viewable by everyone" ON artists FOR SELECT USING (true);
CREATE POLICY "Artists can update their own profile" ON artists FOR UPDATE USING (auth.uid() = id);

-- Tracks: public read, artists can manage their own
CREATE POLICY "Tracks are viewable by everyone" ON tracks FOR SELECT USING (true);
CREATE POLICY "Artists can insert their own tracks" ON tracks FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Artists can update their own tracks" ON tracks FOR UPDATE USING (auth.uid() = artist_id);
CREATE POLICY "Artists can delete their own tracks" ON tracks FOR DELETE USING (auth.uid() = artist_id);

-- Releases: similar to tracks
CREATE POLICY "Releases are viewable by everyone" ON releases FOR SELECT USING (true);
CREATE POLICY "Artists can insert their own releases" ON releases FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Artists can update their own releases" ON releases FOR UPDATE USING (auth.uid() = artist_id);
CREATE POLICY "Artists can delete their own releases" ON releases FOR DELETE USING (auth.uid() = artist_id);

-- Purchases: artists can see their own sales
CREATE POLICY "Artists can view their own sales" ON purchases FOR SELECT USING (auth.uid() = artist_id);
CREATE POLICY "Purchases can be inserted" ON purchases FOR INSERT WITH CHECK (true);

-- Downloads: artists can see their own downloads
CREATE POLICY "Artists can view their own downloads" ON downloads FOR SELECT USING (auth.uid() = artist_id);
CREATE POLICY "Downloads can be inserted" ON downloads FOR INSERT WITH CHECK (true);

-- Plays: artists can see their own plays
CREATE POLICY "Artists can view their own plays" ON plays FOR SELECT USING (auth.uid() = artist_id);
CREATE POLICY "Plays can be inserted" ON plays FOR INSERT WITH CHECK (true);
