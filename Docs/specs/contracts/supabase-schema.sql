-- ROMAS Brief — canonical Supabase schema reference
-- This file is the source-of-truth schema (derived from .claude/skills/cms-schema.md).
-- M1 migrations (supabase/migrations/0001..0010) implement this incrementally.
-- pgTAP tests (R-105) enforce every CHECK constraint listed here.

-- =====================================================================
-- 0002_init_qa_reviewers.sql
-- =====================================================================
create table qa_reviewers (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  name            text not null,
  role            text not null check (role in ('editor_in_chief', 'audio_qa', 'fact_checker', 'physics_reviewer')),
  active          boolean default true,
  onboarded_at    timestamptz default now()
);
-- Seed Kimal solo as audio_qa at launch.
insert into qa_reviewers (email, name, role) values
  ('president@aliennova.com', 'Kimal Honour Djam', 'audio_qa');

-- =====================================================================
-- 0001_init_articles.sql
-- =====================================================================
create table articles (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique not null,
  archetype             text not null check (archetype in ('short_brief', 'standard_analysis', 'deep_report')),
  tier                  text not null default 'daily' check (tier in ('daily', 'friday_read', 'conference')),
  -- Cycle-4 addition (SSOT §12.2 launch posture): 11 categories × 8 content types
  category              text not null check (category in (
    'ai', 'physics', 'clinical_rt', 'regulatory', 'guidelines',
    'reimbursement', 'vendor', 'conferences', 'resident_education',
    'future_rt', 'operations'
  )),
  subcategory           text,  -- free-form within category per Launch Plan §2.1 sub-splits
  content_type          text not null check (content_type in (
    'news_brief', 'paper_critique', 'practice_delta', 'fda_brief',
    'reimbursement_explainer', 'vendor_intel', 'long_take', 'primer'
  )),
  -- Cycle-6 addition (ADR-0013 LATAM LLM-translate): source language + translation provenance
  source_language       text not null default 'en'
    check (source_language in ('en','es','pt','ja','zh','ko','de','fr','it','other')),
  translation_provider  text
    check (translation_provider is null or translation_provider in ('deepl','claude','gpt4','human')),
  translation_verified  boolean default false,
  title                 text not null check (length(title) <= 90),
  standfirst            text not null,
  body_md               text not null,
  word_count            int generated always as (array_length(regexp_split_to_array(body_md, '\s+'), 1)) stored,
  romas_insight         text,
  romas_insight_labeled boolean default false,
  status                text not null default 'draft'
                        check (status in ('draft','in_review','ready_to_publish','published','revoked','corrected')),
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

-- Inviolable rule 1: primary source mandatory
alter table articles add constraint articles_primary_source_required
  check (length(primary_source_url) > 0);

-- Inviolable rule 2: embargo consistency
alter table articles add constraint articles_embargo_consistency
  check ((embargoed = false) or (embargo_until is not null));

-- Inviolable rule 3: insight labeling
alter table articles add constraint articles_insight_labeled
  check (romas_insight is null or romas_insight_labeled = true);

-- Cycle-6 (ADR-0013): non-English source language requires a translation provider declared
alter table articles add constraint articles_translation_provider_required
  check (source_language = 'en' or translation_provider is not null);

create index articles_status_idx on articles(status);
create index articles_published_at_idx on articles(published_at desc);
create index articles_tier_published_idx on articles(tier, published_at desc);
create index articles_modality_gin on articles using gin(modality_tags);
create index articles_disease_gin on articles using gin(disease_site_tags);
-- Cycle-4 indexes for 11-category + content-type + homepage-module filtering (SSOT §12.3)
create index articles_category_idx       on articles(category, published_at desc) where status = 'published';
create index articles_category_subcat    on articles(category, subcategory, published_at desc) where status = 'published';
create index articles_content_type_idx   on articles(content_type, published_at desc) where status = 'published';
create index articles_region_gin         on articles using gin(region);
create index articles_audience_gin       on articles using gin(audience_tags);
-- Signal-score band index for homepage Hero / Top Stories / Quick Hits fan-out
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
-- 0003_init_claims.sql
-- =====================================================================
create table claims (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references articles(id) on delete cascade,
  claim_text  text not null,
  source_url  text not null,
  source_id   text,
  source_type text,
  verified_by uuid references qa_reviewers(id),
  verified_at timestamptz,
  confidence  numeric(3,2) check (confidence between 0 and 1),
  created_at  timestamptz default now()
);
create index claims_article_idx on claims(article_id);

-- =====================================================================
-- 0004_init_audio_jobs.sql
-- =====================================================================
create table audio_jobs (
  id                      uuid primary key default gen_random_uuid(),
  article_id              uuid not null references articles(id) on delete cascade,
  tier                    text not null check (tier in ('audio_brief','daily_brief','podcast','conference_brief')),
  target_length_sec       int not null,
  voice_engine_used       text check (voice_engine_used in ('elevenlabs','playht')),
  audio_status            text not null default 'queued'
                          check (audio_status in ('queued','generating','in_review','published','skipped','revoked')),
  audio_url_cdn           text,
  audio_url_archive       text,
  transcript_url          text,
  duration_sec            int,
  loudness_lufs           numeric(5,2),
  true_peak_dbtp          numeric(5,2),
  clinical_claims_checked boolean default false,
  qa_reviewer             uuid references qa_reviewers(id),
  qa_reviewed_at          timestamptz,
  qa_notes                text,
  skip_reason             text,
  revoke_reason           text,
  notes                   text,
  script_md               text,
  cover_url               text,
  error                   text,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),

  -- Inviolable rule 6: audio publish requires full QA gate
  constraint audio_publish_requires_qa check (
    audio_status <> 'published'
    or (clinical_claims_checked = true
        and qa_reviewer is not null
        and loudness_lufs between -17 and -15
        and true_peak_dbtp <= -1
        and transcript_url is not null)
  ),
  constraint audio_revoke_requires_reason check (
    audio_status <> 'revoked' or revoke_reason is not null
  ),
  constraint audio_skip_requires_reason check (
    audio_status <> 'skipped' or skip_reason is not null
  )
);
create index audio_jobs_article_idx on audio_jobs(article_id);
create index audio_jobs_status_idx on audio_jobs(audio_status);
create index audio_jobs_tier_published on audio_jobs(tier, audio_status) where audio_status = 'published';

-- =====================================================================
-- 0005_init_sources_and_health.sql
-- =====================================================================
create table sources (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  category        text not null check (category in
                  ('literature','regulatory','society','reimbursement','vendor','conference','preprint')),
  region          text not null,
  feed_url        text,
  api_endpoint    text,
  active          boolean default true,
  last_fetched_at timestamptz,
  last_status     int,
  notes           text
);
create index sources_active_idx on sources(active);

create table source_health (
  id             uuid primary key default gen_random_uuid(),
  source_id      uuid references sources(id),
  fetched_at     timestamptz default now(),
  status_code    int,
  latency_ms     int,
  items_returned int,
  error          text
);
create index source_health_source_idx on source_health(source_id, fetched_at desc);

-- =====================================================================
-- 0006_init_embargo_holds.sql
-- =====================================================================
create table embargo_holds (
  id                     uuid primary key default gen_random_uuid(),
  candidate_title        text not null,
  source_url             text not null,
  source_id              text,
  embargo_until          timestamptz not null,
  region                 text[],
  notes                  text,
  released_at            timestamptz,
  released_to_article_id uuid references articles(id),
  created_at             timestamptz default now()
);
create index embargo_holds_until_idx on embargo_holds(embargo_until) where released_at is null;

-- =====================================================================
-- 0007_init_lexicon.sql
-- =====================================================================
create table lexicon (
  id       uuid primary key default gen_random_uuid(),
  term     text unique not null,
  type     text not null check (type in
           ('vendor','drug','device','modality','acronym','person','institution','site')),
  ipa      text,
  ssml     text,
  spoken   text,
  notes    text,
  added_by uuid references qa_reviewers(id),
  added_at timestamptz default now()
);

create table lexicon_proposals (
  id              uuid primary key default gen_random_uuid(),
  term            text not null,
  proposed_ipa    text,
  proposed_spoken text,
  proposed_by     text default 'audio_producer',
  status          text not null default 'pending'
                  check (status in ('pending','approved','rejected')),
  decided_by      uuid references qa_reviewers(id),
  decided_at      timestamptz,
  created_at      timestamptz default now()
);

-- Seed: 30 entries — see pronunciation-lexicon skill for content
-- (omitted here; lives in supabase/seed.sql)

-- =====================================================================
-- 0008_init_revocations.sql
-- =====================================================================
create table revocations (
  id                  uuid primary key default gen_random_uuid(),
  audio_job_id        uuid references audio_jobs(id),
  article_id          uuid references articles(id),
  reason              text not null,
  triggered_by        uuid references qa_reviewers(id),
  cdn_purge_at        timestamptz,     -- set only on confirmed 2xx from Cloudflare purge API
  rss_regenerated_at  timestamptz,
  created_at          timestamptz default now()
);

-- =====================================================================
-- 0009_init_subscribers.sql
-- =====================================================================
create table subscribers (
  id                       uuid primary key default gen_random_uuid(),
  email                    text unique not null,
  status                   text not null default 'active' check (status in ('active','unsubscribed','bounced')),
  signup_source            text,
  tier_prefs               text[] default '{daily}',
  -- Cycle-5 (SSOT §3 row 16): three-edition publish requires region tag for Beehiiv segment-based delivery
  region                   text not null default 'americas'
    check (region in ('apac','eu','americas','global')),
  -- Cycle-6 (ADR-0007 cycle-3): Beehiiv canonical subscription id for reconciliation sync
  beehiiv_subscription_id  text unique,
  -- Cycle-6: webhook event timestamps for drift detection
  confirmed_at             timestamptz,
  unsubscribed_at          timestamptz,
  bounced_at               timestamptz,
  complained_at            timestamptz,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);
create index subscribers_active on subscribers(status) where status = 'active';
-- Cycle-5/6 indexes: three-edition fan-out + Beehiiv reconciliation
create index subscribers_region_idx on subscribers(region, status) where status = 'active';
create index subscribers_beehiiv_id_idx on subscribers(beehiiv_subscription_id) where beehiiv_subscription_id is not null;

-- M0c2 P0 fix: set_updated_at() must be defined BEFORE migration 0009
-- creates the subscribers_set_updated trigger that references it.
-- Original placement was after migration 0010_rls_policies — applying
-- migrations in order (0001..0010) failed at 0009 with "function
-- set_updated_at() does not exist". Hoisted to live alongside the
-- first trigger that needs it.
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger subscribers_set_updated before update on subscribers
  for each row execute function set_updated_at();

create or replace view subscriber_count as
  select count(*) as total from subscribers where status = 'active';

-- =====================================================================
-- 0010_rls_policies.sql
-- =====================================================================
alter table articles      enable row level security;
alter table claims        enable row level security;
alter table audio_jobs    enable row level security;
alter table sources       enable row level security;
alter table source_health enable row level security;
alter table embargo_holds enable row level security;
alter table lexicon       enable row level security;
alter table lexicon_proposals enable row level security;
alter table revocations   enable row level security;
alter table subscribers   enable row level security;
alter table qa_reviewers  enable row level security;

-- Public can read published, non-revoked articles
create policy "public_read_published" on articles
  for select using (status = 'published' and revoked_at is null);

-- Authenticated editors can read everything
create policy "editor_read_all" on articles
  for select using (
    exists (select 1 from qa_reviewers where id = auth.uid() and active = true)
  );

-- Only editor_in_chief can publish
create policy "editor_publish" on articles
  for update using (
    exists (select 1 from qa_reviewers
            where id = auth.uid() and role = 'editor_in_chief' and active = true)
  );

-- Only audio_qa can flip audio_status (validated additionally by CHECK constraint)
create policy "audio_qa_flip" on audio_jobs
  for update using (
    exists (select 1 from qa_reviewers
            where id = auth.uid() and role = 'audio_qa' and active = true)
  );

-- Embargo holds readable only by regulatory_analyst-equivalent + editor_in_chief
create policy "embargo_read_restricted" on embargo_holds
  for select using (
    exists (select 1 from qa_reviewers
            where id = auth.uid() and role in ('editor_in_chief','fact_checker') and active = true)
  );

-- Updated_at triggers (set_updated_at() function hoisted to migration 0009 region above per M0c2 P0 fix)
create trigger articles_set_updated   before update on articles   for each row execute function set_updated_at();
create trigger audio_jobs_set_updated before update on audio_jobs for each row execute function set_updated_at();
