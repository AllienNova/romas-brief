-- =====================================================================
-- 0001_create_articles.sql
-- T-103 (MIP §B.1) · ROMAS Wire
-- Author: ROMAS Wire engineering, 2026-05-16
-- Canonical source: Docs/specs/contracts/supabase-schema.sql
-- Anchors: SSOT v1.2.0 §3 (locked decisions), §7 (state machines),
--          §12.2 (11 categories × 8 content types), ADR-0013 (LATAM LLM-translate)
-- =====================================================================
--
-- Scope of this migration
--   1. Required Postgres extensions for UUID generation
--   2. qa_reviewers table — FK target for articles.author_id; no separate
--      M1 task exists for qa_reviewers, so it is co-located here as a
--      foundational dependency
--   3. articles table — full canonical schema, including all CHECK
--      constraints (inviolable rules 1-3 + ADR-0013 translation
--      provenance) and indexes (Cycle-4 category + content-type +
--      signal-band fan-out, GIN tag indexes)
--
-- Out of scope (deferred per MIP/SSOT)
--   - updated_at trigger attachment (function lives in 0009 per M0c2 fix,
--     articles trigger attached in 0011_rls_policies.sql)
--   - pgvector / embedding columns (T-307 → 0012_pgvector_search.sql)
--   - RLS policies (T-113 → 0011_rls_policies.sql)
--   - Seed inserts for Kimal as audio_qa reviewer (supabase/seed.sql)

-- ---------------------------------------------------------------------
-- Required extensions
-- ---------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- qa_reviewers (FK target for articles.author_id; full table per contract)
-- ---------------------------------------------------------------------
create table qa_reviewers (
  id           uuid primary key default gen_random_uuid(),
  -- A10 (build-2026-05-21): case-insensitive uniqueness. Application layer
  -- must lowercase before insert; the CHECK enforces it.
  email        text unique not null check (email = lower(email)),
  name         text not null,
  role         text not null check (
                 role in ('editor_in_chief', 'audio_qa', 'fact_checker', 'physics_reviewer')
               ),
  active       boolean default true,
  onboarded_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- articles (canonical per Docs/specs/contracts/supabase-schema.sql)
-- ---------------------------------------------------------------------
create table articles (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique not null,
  archetype             text not null check (
                          archetype in ('short_brief', 'standard_analysis', 'deep_report')
                        ),
  tier                  text not null default 'daily' check (
                          tier in ('daily', 'friday_read', 'conference')
                        ),
  -- SSOT §12.2: 11 categories
  category              text not null check (
                          category in (
                            'ai', 'physics', 'clinical_rt', 'regulatory', 'guidelines',
                            'reimbursement', 'vendor', 'conferences', 'resident_education',
                            'future_rt', 'operations'
                          )
                        ),
  subcategory           text,  -- free-form per Launch Plan §2.1 sub-splits
  content_type          text not null check (
                          content_type in (
                            'news_brief', 'paper_critique', 'practice_delta', 'fda_brief',
                            'reimbursement_explainer', 'vendor_intel', 'long_take', 'primer'
                          )
                        ),
  -- ADR-0013 (LATAM LLM-translate): source language + translation provenance
  source_language       text not null default 'en' check (
                          source_language in (
                            'en','es','pt','ja','zh','ko','de','fr','it','other'
                          )
                        ),
  translation_provider  text check (
                          translation_provider is null
                          or translation_provider in ('deepl','claude','gpt4','human')
                        ),
  translation_verified  boolean default false,
  title                 text not null check (length(title) <= 90),
  standfirst            text not null,
  -- A4 (build-2026-05-21): 200 KB cap (~32k words) — well above the
  -- 3,500-word deep-report archetype. Guards the word_count generated
  -- column's regexp_split_to_array against multi-MB DoS payloads.
  body_md               text not null check (length(body_md) <= 200000),
  -- A5 (build-2026-05-21): trim() avoids the leading-whitespace overcount
  -- bug (`regexp_split_to_array('\ntext', '\s+')` returns `{'', 'text'}`,
  -- inflating word_count by 1).
  word_count            int generated always as (
                          array_length(regexp_split_to_array(trim(body_md), '\s+'), 1)
                        ) stored,
  romas_insight         text,
  romas_insight_labeled boolean default false,
  status                text not null default 'draft' check (
                          status in (
                            'draft', 'in_review', 'ready_to_publish',
                            'published', 'revoked', 'corrected'
                          )
                        ),
  primary_source_url    text not null,
  primary_source_id     text,
  primary_source_type   text,
  region                text[] default '{}',
  audience_tags         text[] default '{}',
  modality_tags         text[] default '{}',
  disease_site_tags     text[] default '{}',
  composite_score       numeric(5,2),
  signal_scores         jsonb,
  embargoed             boolean default false,
  embargo_until         timestamptz,
  publish_at            timestamptz,
  published_at          timestamptz,
  revoked_at            timestamptz,
  revoke_reason         text,
  author_id             uuid references qa_reviewers(id),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ---------------------------------------------------------------------
-- Inviolable-rule CHECK constraints (SSOT §2 + ADR-0013)
-- ---------------------------------------------------------------------

-- Rule 1: every article has a primary source.
-- A3 (build-2026-05-21): scheme guard tightens rule-1 enforcement. The prior
-- `length > 0` check accepted `.`, ` `, and `javascript:` payloads. The
-- regex blocks all three at the DB layer.
alter table articles add constraint articles_primary_source_required
  check (length(primary_source_url) > 0 and primary_source_url ~* '^https?://');

-- Rule 2: embargoed items carry an embargo_until timestamp
alter table articles add constraint articles_embargo_consistency
  check (embargoed = false or embargo_until is not null);

-- Rule 3: ROMAS Insight / ROMAS Take always labeled as interpretation
alter table articles add constraint articles_insight_labeled
  check (romas_insight is null or romas_insight_labeled = true);

-- ADR-0013: non-English source language declares a translation provider
alter table articles add constraint articles_translation_provider_required
  check (source_language = 'en' or translation_provider is not null);

-- A9 (build-2026-05-21): a published article must name its author.
-- (status,author_id) coupling at the DB layer prevents accidental
-- anonymous publication via direct UPDATE.
alter table articles add constraint articles_published_requires_author
  check (status <> 'published' or author_id is not null);

-- ---------------------------------------------------------------------
-- Indexes (per contract supabase-schema.sql lines 90-111)
-- ---------------------------------------------------------------------

-- Core query indexes
create index articles_status_idx        on articles(status);
create index articles_published_at_idx  on articles(published_at desc);
create index articles_tier_published_idx on articles(tier, published_at desc);
-- A7 (build-2026-05-21): SSOT §3 row 8 three-edition publish scheduler queries
-- WHERE status='ready_to_publish' AND publish_at <= now(). Partial index keeps
-- the planner tight as the article catalog grows.
create index articles_publish_at_idx
  on articles(publish_at) where status = 'ready_to_publish';

-- GIN tag indexes for array filtering (modality, disease, region, audience)
create index articles_modality_gin   on articles using gin(modality_tags);
create index articles_disease_gin    on articles using gin(disease_site_tags);
create index articles_region_gin     on articles using gin(region);
create index articles_audience_gin   on articles using gin(audience_tags);

-- Cycle-4 (SSOT §12.3): 11-category + content-type + sub-category fan-out
-- All restricted to published rows to keep the planner tight
create index articles_category_idx
  on articles(category, published_at desc) where status = 'published';
create index articles_category_subcat
  on articles(category, subcategory, published_at desc) where status = 'published';
create index articles_content_type_idx
  on articles(content_type, published_at desc) where status = 'published';

-- Signal-score band index for homepage Hero / Strong / Standard / QuickHit fan-out
-- Bands per SSOT §3 row 13 (composite_score thresholds)
create index articles_score_band_idx on articles(
  (case
    when composite_score >= 85 then 'hero'
    when composite_score >= 70 then 'strong'
    when composite_score >= 55 then 'standard'
    when composite_score >= 40 then 'quick_hit'
    else 'reference'
  end),
  published_at desc
) where status = 'published';

-- =====================================================================
-- End 0001_create_articles.sql
-- =====================================================================
