-- Fan Subscription to Artists/Labels Database Schema

-- Fan subscriptions table
CREATE TABLE IF NOT EXISTS fan_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID REFERENCES fans(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  
  -- Monthly price (set by creator, $1-10)
  monthly_price DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  
  -- Stripe subscription ID
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'active', -- active, canceled, past_due
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  canceled_at TIMESTAMPTZ,
  
  -- Ensure fan subscribes to either artist OR label
  CONSTRAINT one_creator CHECK (
    (artist_id IS NOT NULL AND label_id IS NULL) OR
    (artist_id IS NULL AND label_id IS NOT NULL)
  ),
  
  UNIQUE(fan_id, artist_id),
  UNIQUE(fan_id, label_id)
);

-- Creator subscription settings
CREATE TABLE IF NOT EXISTS creator_subscription_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  
  is_enabled BOOLEAN DEFAULT FALSE,
  monthly_price DECIMAL(10,2) DEFAULT 5.00,
  
  description TEXT DEFAULT 'Support my music and get exclusive perks',
  welcome_message TEXT DEFAULT 'Thanks for subscribing! You now have access to exclusive content and discounts.',
  
  -- Benefits flags
  benefits_discount_percent INTEGER DEFAULT 10, -- 10% off purchases
  benefits_early_access_hours INTEGER DEFAULT 24, -- 24 hours early
  benefits_exclusive_streams BOOLEAN DEFAULT TRUE,
  benefits_subscriber_badge BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT one_creator_settings CHECK (
    (artist_id IS NOT NULL AND label_id IS NULL) OR
    (artist_id IS NULL AND label_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fan_subscriptions_fan ON fan_subscriptions(fan_id);
CREATE INDEX IF NOT EXISTS idx_fan_subscriptions_artist ON fan_subscriptions(artist_id);
CREATE INDEX IF NOT EXISTS idx_fan_subscriptions_label ON fan_subscriptions(label_id);
CREATE INDEX IF NOT EXISTS idx_fan_subscriptions_status ON fan_subscriptions(status);

-- RLS Policies
ALTER TABLE fan_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_subscription_settings ENABLE ROW LEVEL SECURITY;

-- Fans can view own subscriptions
CREATE POLICY "Fans can view own subscriptions" ON fan_subscriptions
  FOR SELECT USING (fan_id = auth.uid());

-- Fans can create own subscriptions
CREATE POLICY "Fans can create own subscriptions" ON fan_subscriptions
  FOR INSERT WITH CHECK (fan_id = auth.uid());

-- Fans can update own subscriptions (cancel)
CREATE POLICY "Fans can update own subscriptions" ON fan_subscriptions
  FOR UPDATE USING (fan_id = auth.uid());

-- Creators can view their subscribers
CREATE POLICY "Creators can view their subscribers" ON fan_subscriptions
  FOR SELECT USING (artist_id = auth.uid() OR label_id = auth.uid());

-- Settings: Creators can manage own
CREATE POLICY "Creators can manage own settings" ON creator_subscription_settings
  FOR ALL USING (artist_id = auth.uid() OR label_id = auth.uid());

-- Settings: Public can view
CREATE POLICY "Public can view subscription settings" ON creator_subscription_settings
  FOR SELECT USING (true);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_fan_subscriptions_updated_at ON fan_subscriptions;
CREATE TRIGGER update_fan_subscriptions_updated_at
  BEFORE UPDATE ON fan_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_creator_settings_updated_at ON creator_subscription_settings;
CREATE TRIGGER update_creator_settings_updated_at
  BEFORE UPDATE ON creator_subscription_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();