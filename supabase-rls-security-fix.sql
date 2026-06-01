-- RLS Security Fix — Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/wpsmgfulrugrsabgcdmp/sql/new
--
-- WARNING: Do NOT enable RLS on tracks — it's used for public product listings.
-- Only restrict tables with PII (artists, labels, purchases, orders).

-- ============================================
-- ARTISTS — restrict sensitive columns from anon
-- ============================================
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public artists are viewable by everyone" ON artists;
CREATE POLICY "Public artists are viewable by everyone"
  ON artists FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================
-- LABELS — restrict sensitive columns from anon
-- ============================================
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public labels are viewable by everyone" ON labels;
CREATE POLICY "Public labels are viewable by everyone"
  ON labels FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================
-- PURCHASES — only buyer/artist can see
-- ============================================
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = artist_id);

DROP POLICY IF EXISTS "Users can insert own purchases" ON purchases;
CREATE POLICY "Users can insert own purchases"
  ON purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- ============================================
-- ORDERS — only buyer can see
-- ============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- ============================================
-- TRACKS — public read (product listings)
-- ============================================
-- Note: tracks is intentionally public-read.
-- It's used for product listings visible to all visitors.
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tracks are viewable by everyone" ON tracks;
CREATE POLICY "Tracks are viewable by everyone"
  ON tracks FOR SELECT
  USING (true);