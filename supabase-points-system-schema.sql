-- Add points balance to fans table
ALTER TABLE fans
ADD COLUMN points_balance INTEGER DEFAULT 0 CHECK (points_balance >= 0);

-- Create index for faster lookups
CREATE INDEX idx_fans_points_balance ON fans(points_balance);

-- Create points transactions table for tracking
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES fans(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for earning, negative for spending
  balance_after INTEGER NOT NULL, -- snapshot of balance after transaction
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'adjustment')),
  source_type TEXT, -- 'purchase', 'redemption', 'admin', etc.
  source_id TEXT, -- purchase_id, track_id, etc.
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for points_transactions
CREATE INDEX idx_points_transactions_fan_id ON points_transactions(fan_id);
CREATE INDEX idx_points_transactions_created_at ON points_transactions(created_at);
CREATE INDEX idx_points_transactions_type ON points_transactions(transaction_type);

-- Function to award points (safe with transaction)
CREATE OR REPLACE FUNCTION award_points(
  p_fan_id UUID,
  p_amount INTEGER,
  p_source_type TEXT,
  p_source_id TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Update fan's points balance
  UPDATE fans
  SET points_balance = points_balance + p_amount
  WHERE id = p_fan_id
  RETURNING points_balance INTO v_new_balance;

  -- Log transaction
  INSERT INTO points_transactions (
    fan_id,
    amount,
    balance_after,
    transaction_type,
    source_type,
    source_id,
    description
  ) VALUES (
    p_fan_id,
    p_amount,
    v_new_balance,
    'earn',
    p_source_type,
    p_source_id,
    COALESCE(p_description, format('Earned %s points from %s', p_amount, p_source_type))
  );
END;
$$ LANGUAGE plpgsql;

-- Function to redeem points (with validation)
CREATE OR REPLACE FUNCTION redeem_points(
  p_fan_id UUID,
  p_amount INTEGER,
  p_track_id UUID,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Check current balance
  SELECT points_balance INTO v_current_balance
  FROM fans
  WHERE id = p_fan_id;

  -- Insufficient points
  IF v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct points
  UPDATE fans
  SET points_balance = points_balance - p_amount
  WHERE id = p_fan_id
  RETURNING points_balance INTO v_new_balance;

  -- Log transaction
  INSERT INTO points_transactions (
    fan_id,
    amount,
    balance_after,
    transaction_type,
    source_type,
    source_id,
    description
  ) VALUES (
    p_fan_id,
    -p_amount,
    v_new_balance,
    'redeem',
    'track_redemption',
    p_track_id::TEXT,
    COALESCE(p_description, format('Redeemed %s points for track', p_amount))
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- View for fan points summary
CREATE OR REPLACE VIEW fan_points_summary AS
SELECT
  f.id as fan_id,
  f.email,
  f.username,
  f.points_balance,
  COUNT(pt.id) as total_transactions,
  SUM(CASE WHEN pt.amount > 0 THEN pt.amount ELSE 0 END) as total_earned,
  SUM(CASE WHEN pt.amount < 0 THEN ABS(pt.amount) ELSE 0 END) as total_redeemed
FROM fans f
LEFT JOIN points_transactions pt ON pt.fan_id = f.id
GROUP BY f.id, f.email, f.username, f.points_balance;

-- RLS policies for points_transactions
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- Fans can view their own transactions
CREATE POLICY "Fans can view own points transactions"
  ON points_transactions FOR SELECT
  USING (auth.uid() = fan_id);

-- Only service role can insert/update transactions (via functions)
CREATE POLICY "Service role can manage points transactions"
  ON points_transactions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Initial migration: set existing fans to 0 points (already default)
-- No action needed

COMMENT ON TABLE points_transactions IS 'Tracks all points earning and redemption activity for fans';
COMMENT ON COLUMN fans.points_balance IS 'Current points balance for rewards system (10 points per $1 spent, 500 points per free track - 2% reward)';
