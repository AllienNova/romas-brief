-- =====================================================================
-- 0009_create_set_updated_at.sql
-- T-111 (MIP §B.1) · ROMAS Brief
-- Author: ROMAS Brief engineering, 2026-05-21 (M1-completion cycle)
-- Canonical source: Docs/specs/contracts/supabase-schema.sql lines 335-352
-- Anchors: M0c2 P0 fix — function hoisted from 0010_rls_policies to
--          land BEFORE the first trigger that references it (subscribers
--          in 0008). Per Docs/build/decision-log.md D-005 + build-log
--          M0c2 row.
-- Depends: 0008_create_subscribers.sql (subscribers table exists so the
--          first trigger attachment succeeds)
-- =====================================================================
--
-- Scope of this migration
--   1. set_updated_at() trigger function — generic NEW.updated_at = now()
--      handler, attached by name from every table that wants automatic
--      updated_at refresh on UPDATE.
--   2. subscribers_set_updated trigger — attached to subscribers; first
--      consumer of the function so it MUST land here, not later.
--   3. subscriber_count view — count of active subscribers, materialised
--      on read (low-traffic view; refresh-on-write cadence is fine).
--
-- Out of scope (deferred)
--   - articles_set_updated + audio_jobs_set_updated triggers →
--     0011_rls_policies.sql (lands alongside RLS policy enablement,
--     matching the contract's grouping)
--   - subscriber-count UI guard (qualitative under 2,500) → R-015 (M3)

-- ---------------------------------------------------------------------
-- set_updated_at() function
-- ---------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------
-- subscribers_set_updated trigger (first consumer; must land here)
-- ---------------------------------------------------------------------
create trigger subscribers_set_updated
  before update on subscribers
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------
-- subscriber_count view
-- ---------------------------------------------------------------------
-- Simple count view. Reader surface enforces the qualitative-vs-numeric
-- subscriber-count UI guard at the app layer (R-015 M3), not here.
create or replace view subscriber_count as
  select count(*) as total
  from subscribers
  where status = 'active';

-- =====================================================================
-- End 0009_create_set_updated_at.sql
-- =====================================================================
