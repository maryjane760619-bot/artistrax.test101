-- Enhanced subscription schema with storage tracking
-- Run this after the existing supabase-subscriptions-schema.sql

-- Add storage fields to artists table
ALTER TABLE artists
ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS storage_limit_bytes BIGINT DEFAULT 10737418240, -- 10GB in bytes
ADD COLUMN IF NOT EXISTS has_unlimited_storage BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT; -- Track which price they subscribed to

-- Add storage fields to labels table
ALTER TABLE labels
ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS storage_limit_bytes BIGINT DEFAULT 10737418240, -- 10GB in bytes
ADD COLUMN IF NOT EXISTS has_unlimited_storage BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Function to check storage quota
CREATE OR REPLACE FUNCTION check_storage_quota(
  p_user_id UUID,
  p_user_type TEXT, -- 'artist' or 'label'
  p_file_size_bytes BIGINT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_storage_used BIGINT;
  v_storage_limit BIGINT;
  v_has_unlimited BOOLEAN;
BEGIN
  IF p_user_type = 'artist' THEN
    SELECT storage_used_bytes, storage_limit_bytes, has_unlimited_storage
    INTO v_storage_used, v_storage_limit, v_has_unlimited
    FROM artists WHERE id = p_user_id;
  ELSIF p_user_type = 'label' THEN
    SELECT storage_used_bytes, storage_limit_bytes, has_unlimited_storage
    INTO v_storage_used, v_storage_limit, v_has_unlimited
    FROM labels WHERE id = p_user_id;
  ELSE
    RETURN FALSE;
  END IF;

  -- Unlimited storage always passes
  IF v_has_unlimited THEN
    RETURN TRUE;
  END IF;

  -- Check if adding this file would exceed quota
  RETURN (v_storage_used + p_file_size_bytes) <= v_storage_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to update storage usage
CREATE OR REPLACE FUNCTION update_storage_usage(
  p_user_id UUID,
  p_user_type TEXT,
  p_bytes_delta BIGINT -- Can be positive (add) or negative (remove)
)
RETURNS VOID AS $$
BEGIN
  IF p_user_type = 'artist' THEN
    UPDATE artists
    SET storage_used_bytes = GREATEST(0, storage_used_bytes + p_bytes_delta)
    WHERE id = p_user_id;
  ELSIF p_user_type = 'label' THEN
    UPDATE labels
    SET storage_used_bytes = GREATEST(0, storage_used_bytes + p_bytes_delta)
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get storage stats
CREATE OR REPLACE FUNCTION get_storage_stats(
  p_user_id UUID,
  p_user_type TEXT
)
RETURNS TABLE(
  used_bytes BIGINT,
  limit_bytes BIGINT,
  has_unlimited BOOLEAN,
  percentage_used NUMERIC
) AS $$
BEGIN
  IF p_user_type = 'artist' THEN
    RETURN QUERY
    SELECT 
      storage_used_bytes,
      storage_limit_bytes,
      has_unlimited_storage,
      CASE 
        WHEN has_unlimited_storage THEN 0
        ELSE ROUND((storage_used_bytes::NUMERIC / NULLIF(storage_limit_bytes, 0)::NUMERIC) * 100, 2)
      END
    FROM artists WHERE id = p_user_id;
  ELSIF p_user_type = 'label' THEN
    RETURN QUERY
    SELECT 
      storage_used_bytes,
      storage_limit_bytes,
      has_unlimited_storage,
      CASE 
        WHEN has_unlimited_storage THEN 0
        ELSE ROUND((storage_used_bytes::NUMERIC / NULLIF(storage_limit_bytes, 0)::NUMERIC) * 100, 2)
      END
    FROM labels WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update subscription tier enum to include storage add-on
ALTER TABLE artists DROP CONSTRAINT IF EXISTS artists_subscription_tier_check;
ALTER TABLE artists ADD CONSTRAINT artists_subscription_tier_check 
  CHECK (subscription_tier IN ('monthly', 'annual', 'monthly_unlimited', 'annual_unlimited'));

ALTER TABLE labels DROP CONSTRAINT IF EXISTS labels_subscription_tier_check;
ALTER TABLE labels ADD CONSTRAINT labels_subscription_tier_check 
  CHECK (subscription_tier IN ('monthly', 'annual', 'monthly_unlimited', 'annual_unlimited'));

-- Create subscription events table for tracking history
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('artist', 'label')),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'trial_started', 'trial_ending_soon', 'trial_ended',
    'subscription_created', 'subscription_updated', 'subscription_canceled',
    'payment_succeeded', 'payment_failed', 'storage_upgraded'
  )),
  stripe_event_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscription_events_user ON subscription_events(user_id, user_type);
CREATE INDEX idx_subscription_events_created_at ON subscription_events(created_at);

COMMENT ON TABLE subscription_events IS 'Tracks all subscription-related events for analytics and debugging';
