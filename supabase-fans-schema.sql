-- Fans table for consumers/users
CREATE TABLE IF NOT EXISTS fans (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  twitter TEXT,
  instagram TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fan favorites/library
CREATE TABLE IF NOT EXISTS fan_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES fans(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fan_id, track_id)
);

-- Fan follows (artists)
CREATE TABLE IF NOT EXISTS fan_follows_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES fans(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fan_id, artist_id)
);

-- Fan follows (labels)
CREATE TABLE IF NOT EXISTS fan_follows_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES fans(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fan_id, label_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fan_favorites_fan_id ON fan_favorites(fan_id);
CREATE INDEX IF NOT EXISTS idx_fan_favorites_track_id ON fan_favorites(track_id);
CREATE INDEX IF NOT EXISTS idx_fan_follows_artists_fan_id ON fan_follows_artists(fan_id);
CREATE INDEX IF NOT EXISTS idx_fan_follows_artists_artist_id ON fan_follows_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_fan_follows_labels_fan_id ON fan_follows_labels(fan_id);
CREATE INDEX IF NOT EXISTS idx_fan_follows_labels_label_id ON fan_follows_labels(label_id);

-- RLS Policies
ALTER TABLE fans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_follows_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_follows_labels ENABLE ROW LEVEL SECURITY;

-- Fans: users can read all, update only their own
CREATE POLICY "Fans are viewable by everyone"
  ON fans FOR SELECT
  USING (true);

CREATE POLICY "Users can update own fan profile"
  ON fans FOR UPDATE
  USING (auth.uid() = id);

-- Favorites: users can manage their own
CREATE POLICY "Users can view own favorites"
  ON fan_favorites FOR SELECT
  USING (auth.uid() = fan_id);

CREATE POLICY "Users can add favorites"
  ON fan_favorites FOR INSERT
  WITH CHECK (auth.uid() = fan_id);

CREATE POLICY "Users can remove favorites"
  ON fan_favorites FOR DELETE
  USING (auth.uid() = fan_id);

-- Follows: users can manage their own
CREATE POLICY "Users can view own artist follows"
  ON fan_follows_artists FOR SELECT
  USING (auth.uid() = fan_id);

CREATE POLICY "Users can follow artists"
  ON fan_follows_artists FOR INSERT
  WITH CHECK (auth.uid() = fan_id);

CREATE POLICY "Users can unfollow artists"
  ON fan_follows_artists FOR DELETE
  USING (auth.uid() = fan_id);

CREATE POLICY "Users can view own label follows"
  ON fan_follows_labels FOR SELECT
  USING (auth.uid() = fan_id);

CREATE POLICY "Users can follow labels"
  ON fan_follows_labels FOR INSERT
  WITH CHECK (auth.uid() = fan_id);

CREATE POLICY "Users can unfollow labels"
  ON fan_follows_labels FOR DELETE
  USING (auth.uid() = fan_id);
