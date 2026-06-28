-- The entire mastering feature (app/mastering/page.tsx, app/api/mastering/*)
-- has been built against a mastering_jobs table that was never created --
-- confirmed live: PGRST205 "Could not find the table 'public.mastering_jobs'".
-- The LANDR API integration itself degrades gracefully when its API key is
-- missing, but every job-tracking/payment step throws a real database error
-- without this table, regardless of LANDR configuration.

CREATE TABLE IF NOT EXISTS mastering_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending_payment', -- pending_payment, processing, completed, failed
  style TEXT NOT NULL DEFAULT 'balanced', -- warm, balanced, open
  loudness TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
  format TEXT NOT NULL DEFAULT 'wav', -- cd, mp3, wav
  original_audio_url TEXT,
  mastered_audio_url TEXT,
  cost DECIMAL(10,2) NOT NULL DEFAULT 9.99,
  landr_master_id TEXT,
  stripe_payment_intent_id TEXT,
  error_message TEXT,
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mastering_jobs_artist_id ON mastering_jobs(artist_id);
CREATE INDEX IF NOT EXISTS idx_mastering_jobs_track_id ON mastering_jobs(track_id);

ALTER TABLE mastering_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can view own mastering jobs"
  ON mastering_jobs FOR SELECT
  USING (auth.uid() = artist_id);

-- All writes happen server-side via the service role (LANDR/Stripe
-- integration), so no INSERT/UPDATE policy is needed for authenticated users.

-- RLS alone is not enough -- apply the same lesson learned earlier this
-- project from the events/follows tables: grant the baseline access too.
GRANT SELECT ON mastering_jobs TO authenticated;
