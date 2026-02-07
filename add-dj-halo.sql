-- Add DJ Halo as a showcase artist
-- Run this in Supabase SQL Editor

INSERT INTO artists (
  id,
  email,
  username,
  display_name,
  bio,
  created_at
) VALUES (
  gen_random_uuid(),
  'halo@showcase.artistrax.com',
  'halo',
  'Halo',
  'HALO (Brian Varga) is a dance music artist and producer who has DJ''d in places like London, South Africa, Australia, Singapore, Tel Aviv and Brazil. Based across Chicago, San Diego, Las Vegas and San Francisco, Halo''s music features equal nods to the robotic and the organic - pointing toward where sounds are heading while being rooted in the early days of electronic music.',
  NOW()
) ON CONFLICT (username) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio;
