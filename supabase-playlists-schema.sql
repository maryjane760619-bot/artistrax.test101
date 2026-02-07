-- Playlists for fans
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES fans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist tracks (ordered)
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, track_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_playlists_fan_id ON playlists(fan_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_track_id ON playlist_tracks(track_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_position ON playlist_tracks(playlist_id, position);

-- RLS Policies
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Playlists: fans can manage their own, public playlists viewable by all
CREATE POLICY "Users can view own playlists"
  ON playlists FOR SELECT
  USING (auth.uid() = fan_id OR is_public = true);

CREATE POLICY "Users can create playlists"
  ON playlists FOR INSERT
  WITH CHECK (auth.uid() = fan_id);

CREATE POLICY "Users can update own playlists"
  ON playlists FOR UPDATE
  USING (auth.uid() = fan_id);

CREATE POLICY "Users can delete own playlists"
  ON playlists FOR DELETE
  USING (auth.uid() = fan_id);

-- Playlist tracks: fans can manage tracks in their playlists
CREATE POLICY "Users can view tracks in accessible playlists"
  ON playlist_tracks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_tracks.playlist_id
      AND (playlists.fan_id = auth.uid() OR playlists.is_public = true)
    )
  );

CREATE POLICY "Users can add tracks to own playlists"
  ON playlist_tracks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_tracks.playlist_id
      AND playlists.fan_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tracks in own playlists"
  ON playlist_tracks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_tracks.playlist_id
      AND playlists.fan_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove tracks from own playlists"
  ON playlist_tracks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_tracks.playlist_id
      AND playlists.fan_id = auth.uid()
    )
  );
