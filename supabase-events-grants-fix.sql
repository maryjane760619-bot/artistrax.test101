-- Fix: supabase-events-schema.sql defined RLS policies but never granted
-- table-level access to anon/authenticated. RLS policies only restrict
-- which ROWS a role can see -- the role also needs a baseline GRANT or
-- Postgres blocks it before RLS even runs. Without this, the public
-- /events page and any public artist/label page section showing events
-- silently returns zero rows for every visitor, regardless of the RLS
-- policies already in place.

GRANT SELECT ON events TO anon, authenticated;
GRANT SELECT ON ticket_tiers TO anon, authenticated;
GRANT SELECT, INSERT ON ticket_purchases TO anon, authenticated;
GRANT SELECT, INSERT ON ticket_attendees TO anon, authenticated;

-- Artists/labels need to manage their own events from the dashboard
GRANT INSERT, UPDATE, DELETE ON events TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ticket_tiers TO authenticated;
