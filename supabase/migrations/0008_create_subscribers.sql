-- =====================================================================
-- 0008_create_subscribers.sql
-- T-110 (MIP §B.1) · ROMAS Brief
-- Author: ROMAS Brief engineering, 2026-05-21 (M1-completion cycle)
-- Canonical source: Docs/specs/contracts/supabase-schema.sql lines 311-333
-- Anchors: SSOT §3 row 5 (subscriber count hidden until 2,500) · SSOT
--          §3 row 16 (three-edition publish requires region tag) · ADR-0007
--          cycle-3 (Beehiiv newsletter + Resend transactional split) ·
--          FR-014 + FR-014A + FR-023 (Beehiiv webhook ↔ Supabase sync)
-- Depends: 0001_create_articles.sql (foundational)
-- Trigger note: subscribers_set_updated trigger is created in
--          0009_create_set_updated_at.sql alongside the set_updated_at()
--          function definition (M0c2 P0 hoist fix per build-log).
-- =====================================================================
--
-- Scope of this migration
--   1. subscribers table — Beehiiv-canonical subscriber list mirrored
--      into Supabase via webhook for query-side use (CMS subscriber
--      count view, three-edition delivery segmentation, drift
--      reconciliation).
--   2. Three indexes:
--        - subscribers_active (partial on status='active') for count view
--        - subscribers_region_idx (cycle-5 three-edition fan-out)
--        - subscribers_beehiiv_id_idx (cycle-6 reconciliation by Beehiiv ID)
--   3. The set_updated_at trigger attachment is deferred to 0009 because
--      the function it references is defined there (M0c2 P0 fix).
--
-- Out of scope (deferred)
--   - workers/beehiiv-webhook HMAC-SHA256 verification → T-310C (M3)
--   - daily reconciliation alert (>5 row OR >0.5% drift) → T-310D (M3)
--   - subscriber_count view → 0009 alongside set_updated_at function
--   - subscriber count UI guard (qualitative under 2,500) → R-015 (M3)
--   - RLS policies → 0011_rls_policies.sql (R-114)

-- ---------------------------------------------------------------------
-- subscribers
-- ---------------------------------------------------------------------
create table subscribers (
  id                       uuid primary key default gen_random_uuid(),
  email                    text unique not null,
  status                   text not null default 'active' check (
                             status in ('active', 'unsubscribed', 'bounced')
                           ),
  signup_source            text,
  -- Default '{daily}' = daily issue subscription. Multi-value array
  -- supports future per-tier opt-out (e.g. Friday Read only).
  tier_prefs               text[] default '{daily}',
  -- Cycle-5 (SSOT §3 row 16): three-edition publish needs region tag for
  -- Beehiiv segment-based delivery time. Default 'americas' per D-002
  -- decision-log entry; Beehiiv webhook overrides on signup via
  -- cf-ipcountry auto-detect.
  region                   text not null default 'americas' check (
                             region in ('apac', 'eu', 'americas', 'global')
                           ),
  -- Cycle-6 (ADR-0007 cycle-3): Beehiiv canonical subscription id for
  -- reconciliation sync. Unique because Beehiiv guarantees uniqueness.
  beehiiv_subscription_id  text unique,
  -- Cycle-6: webhook event timestamps for drift detection
  confirmed_at             timestamptz,
  unsubscribed_at          timestamptz,
  bounced_at               timestamptz,
  complained_at            timestamptz,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

-- ---------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------
-- Partial on status='active' — the subscriber-count view + most reader
-- surface queries only care about active subscribers
create index subscribers_active
  on subscribers(status)
  where status = 'active';

-- Cycle-5: three-edition fan-out by region
create index subscribers_region_idx
  on subscribers(region, status)
  where status = 'active';

-- Cycle-6: Beehiiv reconciliation lookups by external ID
create index subscribers_beehiiv_id_idx
  on subscribers(beehiiv_subscription_id)
  where beehiiv_subscription_id is not null;

-- =====================================================================
-- End 0008_create_subscribers.sql
-- =====================================================================
