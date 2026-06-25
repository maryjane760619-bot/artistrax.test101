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
