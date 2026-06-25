-- Run in Supabase SQL Editor (Bert or Chris, whoever has dashboard access)
-- Both additive/nullable -- safe, does not affect existing rows or queries.

-- 1. Banner image for labels (logo_url already exists)
ALTER TABLE labels ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- 2. Banner image for artists (avatar_url already exists, this adds the wide cover photo)
ALTER TABLE artists ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- 3. DJ mix support on tracks: a long-form mix with an optional manual tracklist
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS is_mix BOOLEAN DEFAULT FALSE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS tracklist JSONB;
-- tracklist shape: [{ "timestamp_seconds": 0, "title": "Track Name", "artist": "Artist Name" }, ...]

-- 4. TikTok social link for artists (instagram/twitter/soundcloud/spotify already exist)
ALTER TABLE artists ADD COLUMN IF NOT EXISTS tiktok TEXT;

-- 5. public_artist_profiles only exposes an explicit column list (see
-- supabase-public-views.sql), so banner_url and tiktok need to be added
-- there too or the public artist page will never see them even after
-- the ALTER TABLE statements above.
CREATE OR REPLACE VIEW public_artist_profiles AS
SELECT
  id,
  username,
  display_name,
  bio,
  avatar_url,
  banner_url,
  subdomain,
  website,
  instagram,
  twitter,
  soundcloud,
  spotify,
  tiktok,
  label_id,
  created_at,
  updated_at
FROM artists;
