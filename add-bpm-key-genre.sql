-- Add BPM, musical key, and genre to tracks table
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS bpm INTEGER;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS musical_key TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS genre TEXT;

-- Index for genre filtering
CREATE INDEX IF NOT EXISTS idx_tracks_genre ON tracks(genre);
