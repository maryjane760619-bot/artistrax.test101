-- Labels system for artistrax
-- Run this in Supabase SQL Editor

-- Labels table
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  logo_url TEXT,
  website TEXT,
  instagram TEXT,
  twitter TEXT,
  soundcloud TEXT,
  spotify TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link artists to labels (optional - artists can be independent)
ALTER TABLE artists ADD COLUMN IF NOT EXISTS label_id UUID REFERENCES labels(id) ON DELETE SET NULL;

-- Update tracks to track which label released them
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS label_id UUID REFERENCES labels(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_labels_slug ON labels(slug);
CREATE INDEX IF NOT EXISTS idx_artists_label_id ON artists(label_id);
CREATE INDEX IF NOT EXISTS idx_tracks_label_id ON tracks(label_id);

-- Trigger for updated_at
CREATE TRIGGER update_labels_updated_at BEFORE UPDATE ON labels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for labels
CREATE POLICY "Labels are viewable by everyone" ON labels FOR SELECT USING (true);
CREATE POLICY "Labels can update their own profile" ON labels FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Labels can insert their own profile" ON labels FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow labels to manage tracks they released
CREATE POLICY "Labels can insert tracks" ON tracks FOR INSERT WITH CHECK (auth.uid() = label_id);
CREATE POLICY "Labels can update their tracks" ON tracks FOR UPDATE USING (auth.uid() = label_id);
CREATE POLICY "Labels can delete their tracks" ON tracks FOR DELETE USING (auth.uid() = label_id);
