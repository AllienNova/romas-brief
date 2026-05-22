-- =====================================================================
-- 0010_create_source_health.sql
-- T-112 (MIP §B.1) · ROMAS Brief
-- Author: ROMAS Brief engineering, 2026-05-21 (M1-completion cycle)
-- Canonical source: Docs/specs/contracts/supabase-schema.sql lines 226-235
-- Anchors: SSOT §2 inviolable rule 5 (source-fetch failures surface in
--          source health, never silently dropped) · CLAUDE.md §6 source
--          ingestion · R-201..R-207 (cron-ingest worker writes here)
-- Depends: 0003_create_sources.sql (sources table for FK target)
-- =====================================================================
--
-- Scope of this migration
--   1. source_health table — time-series per-source fetch outcomes.
--      Append-only; one row per scheduled fetch (cron + on-demand).
--      Composite (source_id, fetched_at desc) index supports the
--      cron-ingest worker's "most recent N fetches per source"
--      surface and the future operations dashboard's red/yellow/green
--      panel.
--
-- Out of scope (deferred)
--   - source-health surface in the CMS (operations dashboard) → M2/M3
--   - per-source SLA thresholds (timeout / retry / alert) → defined in
--     contracts/<source>.yaml per-source, not at the DB layer
--   - retention / archival policy → operational decision; for now
--     append-only, manual archival as the table grows
--   - RLS → 0011_rls_policies.sql (R-114; same authenticated-editor read
--     posture as sources)

-- ---------------------------------------------------------------------
-- source_health
-- ---------------------------------------------------------------------
create table source_health (
  id             uuid primary key default gen_random_uuid(),
  -- FK to sources; nullable not because the source can be missing but
  -- because the contract leaves it nullable for forward compatibility
  -- with ad-hoc fetch logging that doesn't tie to a catalogued source.
  source_id      uuid references sources(id),
  fetched_at     timestamptz default now(),
  status_code    int,
  latency_ms     int,
  -- Count of items the parser extracted from the fetch (RSS items,
  -- API records, etc.). Zero is informative (source returned nothing)
  -- and distinct from null (parser ran but did not count).
  items_returned int,
  error          text
);

-- Composite index: per-source time-series query (most recent N fetches).
-- Descending fetched_at because the cron's hot-path query is "what
-- happened recently for source X".
create index source_health_source_idx on source_health(source_id, fetched_at desc);

-- =====================================================================
-- End 0010_create_source_health.sql
-- =====================================================================
