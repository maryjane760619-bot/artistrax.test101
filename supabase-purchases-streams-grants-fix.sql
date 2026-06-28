-- Audited the same missing-GRANT pattern already confirmed twice this
-- session (events, fan_follows_*) against the remaining fan-facing
-- tables. Could not fully confirm purchases/stream_plays live (no way
-- to mint a real fan session via curl), but a redundant GRANT is a
-- harmless no-op if these turn out to already be fine, and a real fix
-- if they're not -- same additive, zero-risk reasoning used for the
-- other grants-fix files. videos was checked live and confirmed
-- already correct, so it's deliberately excluded here.

GRANT SELECT ON purchases TO authenticated;
GRANT SELECT, INSERT ON stream_plays TO authenticated;
GRANT SELECT ON fan_favorites TO authenticated;
GRANT INSERT, DELETE ON fan_favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE ON fan_subscriptions TO authenticated;
