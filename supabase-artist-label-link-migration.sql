-- Run in Supabase SQL Editor. Additive/nullable -- safe, no risk to existing data.
--
-- Lets a label express "this label is run by [artist]" without merging
-- the two account types (separate logins/dashboards stay exactly as they
-- are). Verified at the application layer by checking the artist and
-- label accounts share the same signup email before allowing the link.

ALTER TABLE labels ADD COLUMN IF NOT EXISTS owner_artist_id UUID REFERENCES artists(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_labels_owner_artist_id ON labels(owner_artist_id);
