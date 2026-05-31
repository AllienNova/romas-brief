-- =====================================================================
-- 0005_create_embargo_hold.sql
-- T-107 (MIP §B.1) · ROMAS Wire
-- Author: ROMAS Wire engineering, 2026-05-16
-- Canonical source: Docs/specs/contracts/supabase-schema.sql lines 213-224
-- Anchors: SSOT v1.2.0 §2 inviolable rule 2 (embargoed items never enter
--          the publish queue — surface in embargo hold list only).
-- Depends: 0001_create_articles.sql (articles for the release FK)
-- =====================================================================
--
-- Naming note
--   MIP filename is singular (`0005_create_embargo_hold.sql`); contract
--   table name is plural (`embargo_holds`). Both ship as-named per
--   MIP §B.1 + SSOT contract.
--
-- Scope of this migration
--   1. embargo_holds table — the rule-2 holding pen for embargoed
--      candidates. Once `embargo_until` lapses AND `released_to_article_id`
--      is wired, the candidate has crossed into the articles pipeline.
--   2. Partial index on `(embargo_until)` restricted to un-released
--      rows for the ingestion cron's "what can release now" sweep.
--
-- Out of scope (deferred)
--   - RLS embargo_read_restricted policy → T-113 / 0011_rls_policies.sql
--     (restrict to editor_in_chief + fact_checker)
--   - Release worker / scheduler → T-121 (workers/ingestion-cron/src/embargo.ts)

-- ---------------------------------------------------------------------
-- embargo_holds
-- ---------------------------------------------------------------------
create table embargo_holds (
  id                     uuid primary key default gen_random_uuid(),
  candidate_title        text not null,
  source_url             text not null,
  source_id              text,
  -- Rule 2 enforced: every hold MUST declare its embargo expiry.
  embargo_until          timestamptz not null,
  region                 text[],
  notes                  text,
  -- Set when the hold is released into the articles pipeline.
  -- A2 (build-2026-05-21): the prior comment said the (released_at,
  -- released_to_article_id) pair was "by workflow convention; not
  -- constraint-enforced because the release worker writes both in a
  -- single update." The /team-review cycle build-2026-05-21 surfaced
  -- this as a 3-of-3 convergent finding: a worker crash mid-update
  -- (or any future raw UPDATE setting only one column) would leave a
  -- silently half-released hold that inviolable rule 2 cannot detect.
  -- The one-line CHECK below eliminates the entire corruption class.
  released_at            timestamptz,
  released_to_article_id uuid references articles(id),
  created_at             timestamptz default now(),
  constraint embargo_release_pair check (
    (released_at is null) = (released_to_article_id is null)
  )
);

-- Partial index: the cron only cares about un-released holds when
-- scanning for releases due. Keeps the index small even after thousands
-- of historical releases.
create index embargo_holds_until_idx
  on embargo_holds(embargo_until)
  where released_at is null;

-- =====================================================================
-- End 0005_create_embargo_hold.sql
-- =====================================================================
