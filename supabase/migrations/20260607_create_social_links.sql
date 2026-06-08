-- =============================================
-- Migration: Create social_links table
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wpsmgfulrugrsabgcdmp/sql/new
-- =============================================

-- Create the social_links table
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  platform TEXT,
  icon_url TEXT,
  position INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT link_owner CHECK (
    (artist_id IS NOT NULL AND label_id IS NULL) OR
    (artist_id IS NULL AND label_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_links_artist_id ON social_links(artist_id);
CREATE INDEX IF NOT EXISTS idx_social_links_label_id ON social_links(label_id);
CREATE INDEX IF NOT EXISTS idx_social_links_position ON social_links(position);
CREATE INDEX IF NOT EXISTS idx_social_links_visible ON social_links(is_visible);

-- RLS
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view visible links"
  ON social_links FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Artists can manage own links"
  ON social_links FOR ALL
  USING (auth.uid() = artist_id);

CREATE POLICY "Labels can manage own links"
  ON social_links FOR ALL
  USING (auth.uid() = label_id);

-- Link click tracking table
CREATE TABLE IF NOT EXISTS link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES social_links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  ip_address INET
);

CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON link_clicks(clicked_at);

ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert clicks"
  ON link_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Artists can view own link clicks"
  ON link_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM social_links
      WHERE social_links.id = link_clicks.link_id
      AND social_links.artist_id = auth.uid()
    )
  );

CREATE POLICY "Labels can view own link clicks"
  ON link_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM social_links
      WHERE social_links.id = link_clicks.link_id
      AND social_links.label_id = auth.uid()
    )
  );