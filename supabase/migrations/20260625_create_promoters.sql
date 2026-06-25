-- Promoters: fans who can create ticket-selling events (keep 95%)
-- Run in Supabase SQL Editor

-- 1. Create promoters table (mirrors artists/labels structure)
CREATE TABLE IF NOT EXISTS promoters (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  website TEXT,
  instagram TEXT,
  twitter TEXT,
  tiktok TEXT,
  phone TEXT,

  -- Stripe Connect for ticket payouts
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  stripe_charges_enabled BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add promoter_id to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS promoter_id UUID REFERENCES promoters(id) ON DELETE CASCADE;

-- 3. Drop old CHECK constraint, add new one allowing promoters
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_artist_id_label_id_check;
ALTER TABLE events ADD CONSTRAINT events_creator_check
  CHECK (
    (artist_id IS NOT NULL AND label_id IS NULL AND promoter_id IS NULL)
    OR (artist_id IS NULL AND label_id IS NOT NULL AND promoter_id IS NULL)
    OR (artist_id IS NULL AND label_id IS NULL AND promoter_id IS NOT NULL)
    OR (artist_id IS NULL AND label_id IS NULL AND promoter_id IS NULL) -- Fan-created (no tickets)
  );

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_events_promoter_id ON events(promoter_id);
CREATE INDEX IF NOT EXISTS idx_promoters_stripe ON promoters(stripe_charges_enabled);
CREATE INDEX IF NOT EXISTS idx_promoters_display_name ON promoters(display_name);

-- 5. Triggers
CREATE TRIGGER IF NOT EXISTS update_promoters_updated_at BEFORE UPDATE ON promoters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable RLS
ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for promoters
CREATE POLICY "Promoters are viewable by everyone" ON promoters
  FOR SELECT USING (true);

CREATE POLICY "Promoters can update own profile" ON promoters FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Promoters can insert own profile" ON promoters FOR INSERT
  WITH CHECK (id = auth.uid());

-- 8. Update events RLS to include promoters
DROP POLICY IF EXISTS "Artists can manage their own events" ON events;
DROP POLICY IF EXISTS "Labels can manage their own events" ON events;

CREATE POLICY "Creators can manage their own events" ON events FOR ALL
  USING (
    (artist_id = auth.uid() AND label_id IS NULL AND promoter_id IS NULL)
    OR (label_id = auth.uid() AND artist_id IS NULL AND promoter_id IS NULL)
    OR (promoter_id = auth.uid() AND artist_id IS NULL AND label_id IS NULL)
    OR (artist_id IS NULL AND label_id IS NULL AND promoter_id IS NULL AND auth.uid() IS NOT NULL) -- Fans can create/free events
  )
  WITH CHECK (
    (artist_id = auth.uid() AND label_id IS NULL AND promoter_id IS NULL)
    OR (label_id = auth.uid() AND artist_id IS NULL AND promoter_id IS NULL)
    OR (promoter_id = auth.uid() AND artist_id IS NULL AND label_id IS NULL)
    OR (artist_id IS NULL AND label_id IS NULL AND promoter_id IS NULL AND auth.uid() IS NOT NULL)
  );

-- 9. Update ticket_tiers RLS to include promoters
DROP POLICY IF EXISTS "Event creators can manage ticket tiers" ON ticket_tiers;
CREATE POLICY "Event creators can manage ticket tiers" ON ticket_tiers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = ticket_tiers.event_id
      AND (
        events.artist_id = auth.uid()
        OR events.label_id = auth.uid()
        OR events.promoter_id = auth.uid()
      )
    )
  );

-- 10. Update ticket_purchases RLS to include promoters
DROP POLICY IF EXISTS "Creators can view ticket sales" ON ticket_purchases;
CREATE POLICY "Creators can view ticket sales" ON ticket_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = ticket_purchases.event_id
      AND (
        events.artist_id = auth.uid()
        OR events.label_id = auth.uid()
        OR events.promoter_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Creators can update ticket purchases" ON ticket_purchases;
CREATE POLICY "Creators can update ticket purchases" ON ticket_purchases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = ticket_purchases.event_id
      AND (
        events.artist_id = auth.uid()
        OR events.label_id = auth.uid()
        OR events.promoter_id = auth.uid()
      )
    )
  );

-- 11. Update ticket_attendees RLS to include promoters
DROP POLICY IF EXISTS "Creators can view ticket attendees" ON ticket_attendees;
CREATE POLICY "Creators can view ticket attendees" ON ticket_attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = ticket_attendees.event_id
      AND (
        events.artist_id = auth.uid()
        OR events.label_id = auth.uid()
        OR events.promoter_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Creators can update ticket attendees" ON ticket_attendees;
CREATE POLICY "Creators can update ticket attendees" ON ticket_attendees FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = ticket_attendees.event_id
      AND (
        events.artist_id = auth.uid()
        OR events.label_id = auth.uid()
        OR events.promoter_id = auth.uid()
      )
    )
  );

-- 12. Public view for promoters
DROP VIEW IF EXISTS public_promoter_profiles CASCADE;
CREATE VIEW public_promoter_profiles AS
SELECT
  id,
  display_name,
  bio,
  avatar_url,
  banner_url,
  website,
  instagram,
  twitter,
  tiktok,
  created_at
FROM promoters;