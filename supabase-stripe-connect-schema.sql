-- Stripe Connect Schema
-- Add stripe_account_id columns for artists and labels

-- Add stripe_account_id to artists table
ALTER TABLE artists ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Add stripe_account_id to labels table
ALTER TABLE labels ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_artists_stripe_account ON artists(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_labels_stripe_account ON labels(stripe_account_id);

-- Add comments
COMMENT ON COLUMN artists.stripe_account_id IS 'Stripe Connect Express account ID for receiving payments';
COMMENT ON COLUMN labels.stripe_account_id IS 'Stripe Connect Express account ID for receiving payments';

-- Done!
-- Next step: Enable Stripe Connect in your Stripe dashboard
