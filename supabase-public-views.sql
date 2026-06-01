-- Create public views that exclude sensitive columns (email, stripe IDs)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/wpsmgfulrugrsabgcdmp/sql/new

-- ============================================
-- ARTIST PUBLIC VIEW (no email, no stripe)
-- ============================================
CREATE OR REPLACE VIEW public_artist_profiles AS
SELECT
  id,
  username,
  display_name,
  bio,
  avatar_url,
  subdomain,
  website,
  instagram,
  twitter,
  soundcloud,
  spotify,
  label_id,
  created_at,
  updated_at
FROM artists;

-- Grant anon access to the view
GRANT SELECT ON public_artist_profiles TO anon, authenticated;

-- ============================================
-- LABEL PUBLIC VIEW (no email, no stripe)
-- ============================================
CREATE OR REPLACE VIEW public_label_profiles AS
SELECT
  id,
  slug,
  name,
  bio,
  logo_url,
  website,
  instagram,
  twitter,
  soundcloud,
  spotify,
  created_at,
  updated_at
FROM labels;

-- Grant anon access to the view
GRANT SELECT ON public_label_profiles TO anon, authenticated;