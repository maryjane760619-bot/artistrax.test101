-- Add subscription fields to artists table
ALTER TABLE artists
ADD COLUMN subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid')),
ADD COLUMN subscription_tier TEXT CHECK (subscription_tier IN ('monthly', 'annual')),
ADD COLUMN subscription_started_at TIMESTAMPTZ,
ADD COLUMN trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
ADD COLUMN subscription_expires_at TIMESTAMPTZ,
ADD COLUMN stripe_customer_id TEXT UNIQUE,
ADD COLUMN stripe_subscription_id TEXT UNIQUE;

-- Add subscription fields to labels table
ALTER TABLE labels
ADD COLUMN subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid')),
ADD COLUMN subscription_tier TEXT CHECK (subscription_tier IN ('monthly', 'annual')),
ADD COLUMN subscription_started_at TIMESTAMPTZ,
ADD COLUMN trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
ADD COLUMN subscription_expires_at TIMESTAMPTZ,
ADD COLUMN stripe_customer_id TEXT UNIQUE,
ADD COLUMN stripe_subscription_id TEXT UNIQUE;

-- Create indexes for faster subscription lookups
CREATE INDEX idx_artists_subscription_status ON artists(subscription_status);
CREATE INDEX idx_artists_stripe_customer_id ON artists(stripe_customer_id);
CREATE INDEX idx_labels_subscription_status ON labels(subscription_status);
CREATE INDEX idx_labels_stripe_customer_id ON labels(stripe_customer_id);

-- Function to check if subscription is valid (active or in trial)
CREATE OR REPLACE FUNCTION is_subscription_valid(
  p_subscription_status TEXT,
  p_trial_ends_at TIMESTAMPTZ,
  p_subscription_expires_at TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Active subscription
  IF p_subscription_status = 'active' THEN
    RETURN TRUE;
  END IF;
  
  -- In trial period
  IF p_subscription_status = 'trialing' AND p_trial_ends_at > NOW() THEN
    RETURN TRUE;
  END IF;
  
  -- Has valid subscription expiration
  IF p_subscription_expires_at IS NOT NULL AND p_subscription_expires_at > NOW() THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Add helper views for subscription analytics
CREATE OR REPLACE VIEW artist_subscription_stats AS
SELECT
  subscription_status,
  subscription_tier,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE trial_ends_at > NOW()) as active_trials
FROM artists
GROUP BY subscription_status, subscription_tier;

CREATE OR REPLACE VIEW label_subscription_stats AS
SELECT
  subscription_status,
  subscription_tier,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE trial_ends_at > NOW()) as active_trials
FROM labels
GROUP BY subscription_status, subscription_tier;

-- Update existing artists/labels to have trial period starting now
UPDATE artists 
SET trial_ends_at = NOW() + INTERVAL '30 days'
WHERE trial_ends_at IS NULL;

UPDATE labels 
SET trial_ends_at = NOW() + INTERVAL '30 days'
WHERE trial_ends_at IS NULL;
