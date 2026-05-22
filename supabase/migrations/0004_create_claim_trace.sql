-- =====================================================================
-- 0004_create_claim_trace.sql
-- T-106 (MIP §B.1) · ROMAS Brief
-- Author: ROMAS Brief engineering, 2026-05-16
-- Canonical source: Docs/specs/contracts/supabase-schema.sql lines 116-128
-- Anchors: SSOT v1.2.0 §2 inviolable rule 1 (every clinical claim traces
--          to a primary source) — article-level satisfied in 0001;
--          this table provides the per-sentence trace surfaced in the
--          ROMAS Insight panel and fact-checker UI.
-- Depends: 0001_create_articles.sql (articles + qa_reviewers)
-- =====================================================================
--
-- Naming note
--   The MIP filename is `0004_create_claim_trace.sql`; the contract
--   table name is `claims`. Both names ship — file = trace, table =
--   claims — matching MIP §B.1 and SSOT contract precedence (SSOT §9).
--
-- Scope of this migration
--   1. claims table — one row per traceable claim inside an article
--   2. CHECK confidence ∈ [0,1]
--   3. ON DELETE CASCADE from articles (claim trace is article-owned)
--   4. Optional verifier FK to qa_reviewers (set when a fact_checker
--      signs off; null until verified)
--   5. One index on article_id for the per-article join
--
-- Out of scope (deferred)
--   - RLS policies → T-113 / 0011_rls_policies.sql

-- ---------------------------------------------------------------------
-- claims
-- ---------------------------------------------------------------------
create table claims (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references articles(id) on delete cascade,
  claim_text  text not null,
  -- A3 (build-2026-05-21): scheme guard mirrors inviolable rule 1 at the
  -- per-claim level. Reviewer's claim_text → primary source URL must be
  -- a real http/https URL.
  source_url  text not null check (source_url ~* '^https?://'),
  source_id   text,
  source_type text,
  verified_by uuid references qa_reviewers(id),
  verified_at timestamptz,
  -- A12 (build-2026-05-21): numeric(4,3) better expresses a probability
  -- (storage range 0.000–9.999 still bounded by the CHECK). The CHECK is
  -- the real guard; the type is the documentation.
  confidence  numeric(4,3) check (confidence between 0 and 1),
  created_at  timestamptz default now()
);

create index claims_article_idx on claims(article_id);

-- =====================================================================
-- End 0004_create_claim_trace.sql
-- =====================================================================
