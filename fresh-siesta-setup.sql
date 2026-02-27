-- Fresh Setup for Siesta Records
-- Removes old entries and creates clean Siesta Records label

-- Step 1: Check what's currently in labels table
SELECT id, slug, name, email, created_at 
FROM labels 
WHERE slug LIKE '%siesta%'
ORDER BY created_at;

-- Step 2: Remove test/dupicate labels (KEEP ONLY the main one)
-- First, let's see which one has tracks
SELECT l.slug, l.name, COUNT(t.id) as track_count
FROM labels l
LEFT JOIN tracks t ON t.label_id = l.id
WHERE l.slug LIKE '%siesta%'
GROUP BY l.id, l.slug, l.name;

-- Step 3: Decide which to keep and update it properly
-- Option A: Keep 'siestarecords' (the one with Stripe connected)
-- Option B: Keep 'siesta-records' (the newest one with bio)
-- Option C: Create a completely fresh one

-- Step 4: Update the chosen one with proper info
-- (Run this after deciding which to keep)

-- For now, let's update 'siesta-records' to be the main one:
UPDATE labels 
SET 
  name = 'Siesta Records',
  slug = 'siesta-records',
  bio = 'Surf · Sound · Soul. Independent electronic music label from Encinitas, CA.',
  website = 'https://siestarecords.net',
  instagram = 'siestabert',
  twitter = 'Siestabert',
  updated_at = NOW()
WHERE slug = 'siesta-records';

-- Step 5: Remove the others (or keep for testing)
-- DELETE FROM labels WHERE slug IN ('siesta-test', 'siestarecords');

-- Step 6: Link all unlinked tracks to Siesta Records
UPDATE tracks 
SET label_id = (SELECT id FROM labels WHERE slug = 'siesta-records')
WHERE label_id IS NULL 
  AND artist_id IS NOT NULL;

-- Step 7: Verify the setup
SELECT 
  l.slug,
  l.name,
  COUNT(t.id) as track_count,
  COUNT(DISTINCT t.artist_id) as artist_count
FROM labels l
LEFT JOIN tracks t ON t.label_id = l.id
WHERE l.slug = 'siesta-records'
GROUP BY l.id, l.slug, l.name;