-- fan_follows_artists and fan_follows_labels already exist in the live
-- database (from supabase-fans-schema.sql) but, like the events tables
-- before this, have no GRANT for anon/authenticated -- confirmed by
-- inserting a real row via service role and finding it invisible to the
-- anon key. Run in Supabase SQL editor.

GRANT SELECT ON fan_follows_artists TO anon, authenticated;
GRANT SELECT ON fan_follows_labels TO anon, authenticated;
GRANT INSERT, DELETE ON fan_follows_artists TO authenticated;
GRANT INSERT, DELETE ON fan_follows_labels TO authenticated;
