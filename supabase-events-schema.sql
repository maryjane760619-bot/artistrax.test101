-- Events & Ticketing Schema for artistrax
-- Run this in Supabase SQL Editor

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  venue_name TEXT,
  venue_address TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_virtual BOOLEAN DEFAULT FALSE,
  streaming_url TEXT,
  
  -- Who created the event (artist or label)
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  
  -- Stripe Connect for payouts
  stripe_account_id TEXT,
  
  -- Status and tracking
  status TEXT CHECK (status IN ('draft', 'published', 'cancelled', 'completed')) DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(slug),
  CHECK ((artist_id IS NOT NULL AND label_id IS NULL) OR (artist_id IS NULL AND label_id IS NOT NULL))
);

-- Ticket tiers (GA, VIP, Early Bird, etc.)
CREATE TABLE IF NOT EXISTS ticket_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  max_per_order INTEGER DEFAULT 10,
  is_available BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (quantity >= 0),
  CHECK (quantity_sold >= 0),
  CHECK (quantity_sold <= quantity OR quantity = 0) -- 0 = unlimited
);

-- Ticket purchases
CREATE TABLE IF NOT EXISTS ticket_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  ticket_tier_id UUID REFERENCES ticket_tiers(id) ON DELETE CASCADE NOT NULL,
  
  -- Buyer info
  buyer_email TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_id UUID, -- Optional: if logged in
  
  -- Purchase details
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Payment
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  status TEXT CHECK (status IN ('pending', 'paid', 'refunded', 'cancelled')) DEFAULT 'pending',
  
  -- Buyer contact
  phone TEXT,
  email_opt_in BOOLEAN DEFAULT FALSE,
  
  -- Buyer address (for physical events, merch, or record keeping)
  buyer_address JSONB, -- {street, city, state, zip, country}
  
  -- Additional info
  notes TEXT, -- special requests
  referral_source TEXT, -- how they heard about the event
  
  -- Check-in / redemption
  is_redeemed BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_artist_id ON events(artist_id);
CREATE INDEX IF NOT EXISTS idx_events_label_id ON events(label_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event_id ON ticket_tiers(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_event_id ON ticket_purchases(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_buyer_email ON ticket_purchases(buyer_email);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_status ON ticket_purchases(status);

-- Triggers
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_tiers_updated_at BEFORE UPDATE ON ticket_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_purchases_updated_at BEFORE UPDATE ON ticket_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Events: public can read published, creators can manage their own
CREATE POLICY "Published events are viewable by everyone" ON events
  FOR SELECT USING (status = 'published' OR status = 'completed');
CREATE POLICY "Artists can manage their own events" ON events FOR ALL
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());
CREATE POLICY "Labels can manage their own events" ON events FOR ALL
  USING (label_id = auth.uid())
  WITH CHECK (label_id = auth.uid());

-- Ticket tiers: public read, event creators can manage
CREATE POLICY "Ticket tiers are viewable by everyone" ON ticket_tiers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events WHERE events.id = ticket_tiers.event_id
      AND events.status IN ('published', 'completed')
    )
  );
CREATE POLICY "Event creators can manage ticket tiers" ON ticket_tiers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = ticket_tiers.event_id
      AND (events.artist_id = auth.uid() OR events.label_id = auth.uid())
    )
  );

-- Ticket purchases: buyers see their own, creators see sales
CREATE POLICY "Buyers can view their own purchases" ON ticket_purchases FOR SELECT
  USING (buyer_email = auth.email() OR buyer_id = auth.uid());
CREATE POLICY "Creators can view ticket sales" ON ticket_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = ticket_purchases.event_id
      AND (events.artist_id = auth.uid() OR events.label_id = auth.uid())
    )
  );
CREATE POLICY "Ticket purchases can be inserted" ON ticket_purchases
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Creators can update ticket purchases" ON ticket_purchases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = ticket_purchases.event_id
      AND (events.artist_id = auth.uid() OR events.label_id = auth.uid())
    )
  );

-- Ticket attendees — one record per ticket in a multi-ticket order
CREATE TABLE IF NOT EXISTS ticket_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id UUID REFERENCES ticket_purchases(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  ticket_tier_id UUID REFERENCES ticket_tiers(id) ON DELETE CASCADE NOT NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT,
  special_accommodations TEXT,
  dietary_restrictions TEXT,
  ticket_code TEXT UNIQUE NOT NULL,
  is_redeemed BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ticket attendees
CREATE INDEX IF NOT EXISTS idx_ticket_attendees_purchase_id ON ticket_attendees(purchase_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attendees_event_id ON ticket_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attendees_ticket_code ON ticket_attendees(ticket_code);

-- RLS for ticket attendees
ALTER TABLE ticket_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their own ticket attendees" ON ticket_attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ticket_purchases
      WHERE ticket_purchases.id = ticket_attendees.purchase_id
      AND (ticket_purchases.buyer_email = auth.email() OR ticket_purchases.buyer_id = auth.uid())
    )
  );
CREATE POLICY "Creators can view ticket attendees" ON ticket_attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = ticket_attendees.event_id
      AND (events.artist_id = auth.uid() OR events.label_id = auth.uid())
    )
  );
CREATE POLICY "Ticket attendees can be inserted" ON ticket_attendees
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Creators can update ticket attendees" ON ticket_attendees FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = ticket_attendees.event_id
      AND (events.artist_id = auth.uid() OR events.label_id = auth.uid())
    )
  );
