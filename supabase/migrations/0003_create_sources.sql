-- =====================================================================
-- 0003_create_sources.sql
-- T-105 (MIP §B.1) · ROMAS Wire
-- Author: ROMAS Wire engineering, 2026-05-16
-- Canonical source: Docs/specs/contracts/supabase-schema.sql lines 183-197
-- Anchors: SSOT v1.2.0 §6 (source domains canonical inventory),
--          inviolable rule 5 (source fetch failure surfaces in source health)
-- Depends: 0001_create_articles.sql (foundational)
-- =====================================================================
--
-- Scope of this migration
--   1. sources catalog table — 7-category enum, per-source health is in
--      0010_create_source_health.sql (T-112)
--   2. One index on active for the ingestion cron's active-set filter
--
-- Out of scope (deferred)
--   - source_health time-series table → T-112 / 0010
--   - RLS policies → T-113 / 0011_rls_policies.sql
--   - Source seed data → ingestion cron will populate; the source-domains
--     skill (referenced in SSOT §6) is the authoritative inventory

-- ---------------------------------------------------------------------
-- sources
-- ---------------------------------------------------------------------
create table sources (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  -- SSOT §6: seven source categories
  category        text not null check (
                    category in (
                      'literature', 'regulatory', 'society',
                      'reimbursement', 'vendor', 'conference', 'preprint'
                    )
                  ),
  region          text not null,
  -- A3 (build-2026-05-21): SSRF surface — the cron-ingest worker (T-115) will
  -- fetch these URLs. Scheme guard at the DB blocks `javascript:` / `file:` /
  -- scheme-less payloads before any outbound HTTP request.
  feed_url        text check (feed_url is null or feed_url ~* '^https?://'),
  api_endpoint    text check (api_endpoint is null or api_endpoint ~* '^https?://'),
  active          boolean default true,
  last_fetched_at timestamptz,
  last_status     int,
  notes           text
);

-- A8 (build-2026-05-21): a btree on a boolean column is a planner no-op
-- (~50% selectivity). The cron's actual query is "oldest active sources
-- first" — a partial index on (last_fetched_at) restricted to active=true
-- is the right shape. Replaces the prior `sources_active_idx on sources(active)`.
create index sources_active_last_fetched_idx
  on sources(last_fetched_at)
  where active = true;

-- =====================================================================
-- End 0003_create_sources.sql
-- =====================================================================
