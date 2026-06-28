-- Real catalog bundles (replaces the fake demo data the /bundles page
-- was showing -- it imported from lib/data.ts, not Supabase, so every
-- "bundle" a visitor saw was non-purchasable fake content).
--
-- Run in Supabase SQL Editor. New tables only -- no risk to existing data.

CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  discount_percent INTEGER NOT NULL DEFAULT 20 CHECK (discount_percent > 0 AND discount_percent <= 90),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug),
  CHECK ((artist_id IS NOT NULL AND label_id IS NULL) OR (artist_id IS NULL AND label_id IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS bundle_tracks (
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
  position INTEGER DEFAULT 0,
  PRIMARY KEY (bundle_id, track_id)
);

CREATE INDEX IF NOT EXISTS idx_bundles_artist_id ON bundles(artist_id);
CREATE INDEX IF NOT EXISTS idx_bundles_label_id ON bundles(label_id);
CREATE INDEX IF NOT EXISTS idx_bundles_slug ON bundles(slug);
CREATE INDEX IF NOT EXISTS idx_bundle_tracks_bundle_id ON bundle_tracks(bundle_id);

ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active bundles are viewable by everyone" ON bundles
  FOR SELECT USING (is_active = true);
CREATE POLICY "Artists can manage their own bundles" ON bundles FOR ALL
  USING (artist_id = auth.uid()) WITH CHECK (artist_id = auth.uid());
CREATE POLICY "Labels can manage their own bundles" ON bundles FOR ALL
  USING (label_id = auth.uid()) WITH CHECK (label_id = auth.uid());

CREATE POLICY "Bundle tracks are viewable by everyone" ON bundle_tracks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bundles WHERE bundles.id = bundle_tracks.bundle_id AND bundles.is_active = true)
  );
CREATE POLICY "Creators can manage their own bundle tracks" ON bundle_tracks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bundles
      WHERE bundles.id = bundle_tracks.bundle_id
      AND (bundles.artist_id = auth.uid() OR bundles.label_id = auth.uid())
    )
  );

-- IMPORTANT: RLS policies alone are not enough -- Postgres also requires
-- a baseline table-level GRANT for anon/authenticated, or it blocks the
-- role before RLS is even evaluated (this is the exact bug that made
-- the public /events page silently show nothing -- same fix applied
-- here up front this time).
GRANT SELECT ON bundles TO anon, authenticated;
GRANT SELECT ON bundle_tracks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON bundles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON bundle_tracks TO authenticated;
