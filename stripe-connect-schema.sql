-- Stripe Connect Integration Schema
-- Run this in Supabase SQL Editor

-- Add Stripe Connect fields to labels table
ALTER TABLE labels 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN DEFAULT FALSE;

-- Add Stripe Connect status fields to artists table (if not exists)
ALTER TABLE artists
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN DEFAULT FALSE;

-- Create payouts table to track earnings and transfers
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  net_amount DECIMAL(10, 2) NOT NULL,
  stripe_transfer_id TEXT,
  status TEXT CHECK (status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((artist_id IS NOT NULL AND label_id IS NULL) OR (artist_id IS NULL AND label_id IS NOT NULL))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payouts_artist_id ON payouts(artist_id);
CREATE INDEX IF NOT EXISTS idx_payouts_label_id ON payouts(label_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- Add Stripe payment intent ID to orders if not exists
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Comments for documentation
COMMENT ON COLUMN artists.stripe_account_id IS 'Stripe Connect account ID (acct_xxx)';
COMMENT ON COLUMN artists.stripe_onboarding_complete IS 'True when Stripe onboarding is complete';
COMMENT ON COLUMN artists.stripe_charges_enabled IS 'True when artist can receive payments';
COMMENT ON COLUMN labels.stripe_account_id IS 'Stripe Connect account ID (acct_xxx)';
COMMENT ON TABLE payouts IS 'Tracks earnings splits and Stripe transfers to artists/labels';
