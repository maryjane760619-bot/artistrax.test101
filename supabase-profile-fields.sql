-- Add social link fields to artists table
-- Run this in Supabase SQL Editor

ALTER TABLE artists ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS twitter TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS soundcloud TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS spotify TEXT;
