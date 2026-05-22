---
name: cms-schema
description: Supabase / Postgres schema for ROMAS Brief — articles, audio_jobs, claims, sources, qa_reviewers, embargo_holds, lexicon, revocations, RLS policies. Load before writing any migration or query touching CMS data.
canonical_source: Docs/specs/contracts/supabase-schema.sql
last_sync: 2026-05-15 (M0c2 — partial — see "Known drift from canonical" below)
---

> **CANONICAL SQL LIVES AT `Docs/specs/contracts/supabase-schema.sql`.** On any conflict between this skill file and the canonical SQL, **the canonical SQL wins** per SSOT §9 precedence. This skill captures the conceptual model; the SQL captures the executable contract.

## Known drift from canonical (M0c2 documented; full sync deferred)

This skill currently does not enumerate the following columns added in cycle-4 and cycle-6 but present in the canonical `supabase-schema.sql`. **Read the canonical SQL when writing migrations or queries that touch these:**

| Table | Column | Type | Added | Canonical source |
|---|---|---|---|---|
| `articles` | `category` | text NOT NULL CHECK in 11-value enum | cycle-4 | `supabase-schema.sql:~60` |
| `articles` | `subcategory` | text | cycle-4 | `supabase-schema.sql` |
| `articles` | `content_type` | text NOT NULL CHECK in 8-value enum | cycle-4 | `supabase-schema.sql` |
| `articles` | `source_language` | text NOT NULL DEFAULT 'en' CHECK in 10-value enum | cycle-6 | `supabase-schema.sql` |
| `articles` | `translation_provider` | text CHECK in 4-value enum | cycle-6 | `supabase-schema.sql` |
| `articles` | `translation_verified` | boolean DEFAULT false | cycle-6 | `supabase-schema.sql` |
| `articles` | `articles_translation_provider_required` | CHECK constraint | cycle-6 | `supabase-schema.sql` |
| `subscribers` | `region` | text NOT NULL DEFAULT 'americas' CHECK in 4-value enum | cycle-5 | `supabase-schema.sql:268` |
| `subscribers` | `beehiiv_subscription_id` | text UNIQUE | cycle-3 (Q3 email split) | `supabase-schema.sql:269` |
| `subscribers` | `confirmed_at` · `unsubscribed_at` · `bounced_at` · `complained_at` | timestamptz | cycle-3 webhook tracking | `supabase-schema.sql` |
| `subscribers` | `subscribers_region_idx` · `subscribers_beehiiv_id_idx` | partial indexes | cycle-5/6 | `supabase-schema.sql` |
| `subscribers` | `subscribers_set_updated` | trigger using `set_updated_at()` (hoisted to migration 0009 in M0c2 P0 fix) | M0c2 | `supabase-schema.sql:312` |

Full skill-side sync to enumerate every column inline is tracked as a P2 M0c2-or-W-7 doc task. Reading the canonical SQL is the supported workflow until then.

---

# ROMAS Brief — CMS Schema (Supabase / Postgres)

Migrations live in `supabase/migrations/`. Naming: `YYYYMMDDHHMMSS_descriptive_name.sql`. **RLS is on by default** for every table.

---

## Core tables

### `articles`

```sql
create table articles (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  archetype       text not null check (archetype in ('short_brief', 'standard_analysis', 'deep_report')),
  tier            text not null default 'daily' check (tier in ('daily', 'friday_read', 'conference')),
  title           text not null check (length(title) <= 90),
  standfirst      text not null,
  body_md         text not null,
  word_count      int generated always as (array_length(regexp_split_to_array(body_md, '\\s+'), 1)) stored,
  romas_insight   text,
  romas_insight_labeled boolean default false,
  status          text not null default 'draft'
                  check (status in ('draft', 'in_review', 'ready_to_publish', 'published', 'revoked', 'corrected')),
  primary_source_url    text not null,
  primary_source_id     text,       -- PMID / DOI / 510k / NCT / press URL
  primary_source_type   text,       -- 'pubmed' | 'fda_510k' | 'doi' | 'ct_gov' | 'press' | ...
  region          text[] default '{}',
  audience_tags   text[] default '{}',
  modality_tags   text[] default '{}',
  disease_site_tags text[] default '{}',
  composite_score numeric(5,2),
  signal_scores   jsonb,             -- {clinical, ai, physics, operational, novelty, confidence}
  embargoed       boolean default false,
  embargo_until   timestamptz,
  publish_at      timestamptz,
  published_at    timestamptz,
  revoked_at      timestamptz,
  revoke_reason   text,
  author_id       uuid references qa_reviewers(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index articles_status_idx on articles(status);
create index articles_published_at_idx on articles(published_at desc);
create index articles_tier_published_idx on articles(tier, published_at desc);
create index articles_modality_gin on articles using gin(modality_tags);
create index articles_disease_gin on articles using gin(disease_site_tags);

-- Constraints
alter table articles add constraint articles_primary_source_required
  check (length(primary_source_url) > 0);
alter table articles add constraint articles_embargo_consistency
  check ((embargoed = false) or (embargo_until is not null));
alter table articles add constraint articles_insight_labeled
  check (romas_insight is null or romas_insight_labeled = true);
```

### `audio_jobs`

```sql
create table audio_jobs (
  id              uuid primary key default gen_random_uuid(),
  article_id      uuid not null references articles(id) on delete cascade,
  -- ADR-0017: column renamed tier → audio_tier; M0c2 + ADR-0005 cycle-3 added video_podcast (Tier 5, Day 60 launch)
  audio_tier      text not null check (audio_tier in ('audio_brief', 'daily_brief', 'podcast', 'conference_brief', 'video_podcast')),
  target_length_sec int not null,
  voice_engine_used text check (voice_engine_used in ('elevenlabs', 'playht')),
  audio_status    text not null default 'queued'
                  check (audio_status in ('queued', 'generating', 'in_review', 'published', 'skipped', 'revoked')),
  audio_url_cdn   text,
  audio_url_archive text,
  transcript_url  text,
  duration_sec    int,
  loudness_lufs   numeric(5,2),
  true_peak_dbtp  numeric(5,2),
  clinical_claims_checked boolean default false,
  qa_reviewer     uuid references qa_reviewers(id),
  qa_reviewed_at  timestamptz,
  qa_notes        text,
  skip_reason     text,
  revoke_reason   text,
  notes           text,
  script_md       text,
  cover_url       text,
  error           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),

  -- Publish requires QA pass
  constraint audio_publish_requires_qa check (
    audio_status <> 'published'
    or (clinical_claims_checked = true
        and qa_reviewer is not null
        and loudness_lufs between -18 and -14  -- ADR-0016: widened DB gate; -16 ±1 target in audio-qa-reviewer agent
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
create index audio_jobs_tier_published on audio_jobs(audio_tier, audio_status) where audio_status = 'published';  -- ADR-0017: column renamed from tier → audio_tier
```

### `claims`

```sql
create table claims (
  id              uuid primary key default gen_random_uuid(),
  article_id      uuid not null references articles(id) on delete cascade,
  claim_text      text not null,
  source_url      text not null,
  source_id       text,
  source_type     text,
  verified_by     uuid references qa_reviewers(id),
  verified_at     timestamptz,
  confidence      numeric(3,2) check (confidence between 0 and 1),
  created_at      timestamptz default now()
);

create index claims_article_idx on claims(article_id);
```

Every clinical claim in body gets a row. Fact-checker subagent owns insertion.

### `qa_reviewers`

```sql
create table qa_reviewers (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  name            text not null,
  role            text not null check (role in ('editor_in_chief', 'audio_qa', 'fact_checker', 'physics_reviewer')),
  active          boolean default true,
  onboarded_at    timestamptz default now()
);

-- Seed: Kimal as solo audio_qa at launch
insert into qa_reviewers (email, name, role) values
  ('president@aliennova.com', 'Kimal Honour Djam', 'audio_qa');
```

### `sources` (catalog of canonical sources)

```sql
create table sources (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  category        text not null check (category in (
    'literature', 'regulatory', 'society', 'reimbursement', 'vendor', 'conference', 'preprint'
  )),
  region          text not null,    -- 'us' | 'eu' | 'uk' | 'ca' | 'jp' | 'au' | 'cn' | 'global'
  feed_url        text,
  api_endpoint    text,
  active          boolean default true,
  last_fetched_at timestamptz,
  last_status     int,
  notes           text
);

create index sources_active_idx on sources(active);
```

### `source_health` (daily reachability log)

```sql
create table source_health (
  id              uuid primary key default gen_random_uuid(),
  source_id       uuid references sources(id),
  fetched_at      timestamptz default now(),
  status_code     int,
  latency_ms      int,
  items_returned  int,
  error           text
);

create index source_health_source_idx on source_health(source_id, fetched_at desc);
```

### `embargo_holds`

```sql
create table embargo_holds (
  id              uuid primary key default gen_random_uuid(),
  candidate_title text not null,
  source_url      text not null,
  source_id       text,
  embargo_until   timestamptz not null,
  region          text[],
  notes           text,
  released_at     timestamptz,
  released_to_article_id uuid references articles(id),
  created_at      timestamptz default now()
);

create index embargo_holds_until_idx on embargo_holds(embargo_until)
  where released_at is null;
```

### `lexicon`

```sql
create table lexicon (
  id              uuid primary key default gen_random_uuid(),
  term            text unique not null,
  type            text not null check (type in
    ('vendor', 'drug', 'device', 'modality', 'acronym', 'person', 'institution', 'site')),
  ipa             text,
  ssml            text,
  spoken          text,
  notes           text,
  added_by        uuid references qa_reviewers(id),
  added_at        timestamptz default now()
);
```

### `lexicon_proposals`

```sql
create table lexicon_proposals (
  id              uuid primary key default gen_random_uuid(),
  term            text not null,
  proposed_ipa    text,
  proposed_spoken text,
  proposed_by     text default 'audio_producer',
  status          text not null default 'pending'
                  check (status in ('pending', 'approved', 'rejected')),
  decided_by      uuid references qa_reviewers(id),
  decided_at      timestamptz,
  created_at      timestamptz default now()
);
```

### `revocations`

```sql
create table revocations (
  id              uuid primary key default gen_random_uuid(),
  audio_job_id    uuid references audio_jobs(id),
  article_id      uuid references articles(id),
  reason          text not null,
  triggered_by    uuid references qa_reviewers(id),
  cdn_purge_at    timestamptz,
  rss_regenerated_at timestamptz,
  created_at      timestamptz default now()
);
```

### `subscribers` (for the issue email)

```sql
create table subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  status          text not null default 'active' check (status in ('active', 'unsubscribed', 'bounced')),
  signup_source   text,
  tier_prefs      text[] default '{daily}',
  created_at      timestamptz default now()
);

create index subscribers_active on subscribers(status) where status = 'active';

-- Public count view used by homepage (hidden until 2,500)
create or replace view subscriber_count as
  select count(*) as total from subscribers where status = 'active';
```

---

## RLS policies (illustrative)

```sql
alter table articles enable row level security;

-- Public can read published, non-revoked
create policy "public_read_published" on articles
  for select using (status = 'published' and revoked_at is null);

-- Authenticated editors can read everything
create policy "editor_read_all" on articles
  for select using (
    exists (select 1 from qa_reviewers
            where id = auth.uid() and active = true)
  );

-- Only editor_in_chief can flip ready_to_publish → published
create policy "editor_publish" on articles
  for update using (
    exists (select 1 from qa_reviewers
            where id = auth.uid() and role = 'editor_in_chief' and active = true)
  );
```

Audio jobs: only `audio_qa` reviewers can flip `audio_status = published`.

---

## Triggers

```sql
-- Update updated_at on every row change
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger articles_set_updated before update on articles
  for each row execute function set_updated_at();

create trigger audio_jobs_set_updated before update on audio_jobs
  for each row execute function set_updated_at();
```

---

## Migrations order

1. `0001_init_articles.sql`
2. `0002_init_qa_reviewers.sql` (seed Kimal)
3. `0003_init_claims.sql`
4. `0004_init_audio_jobs.sql`
5. `0005_init_sources_and_health.sql`
6. `0006_init_embargo_holds.sql`
7. `0007_init_lexicon.sql` (seed 30 entries)
8. `0008_init_revocations.sql`
9. `0009_init_subscribers.sql`
10. `0010_rls_policies.sql`

---

## Critical invariants

- `articles.primary_source_url` is **NOT NULL** — schema-enforces Rule 1.
- `audio_jobs.audio_status = 'published'` requires QA pass — schema-enforces Rule 6.
- `articles.embargoed = true` requires `embargo_until` — schema-enforces Rule 2.
- `articles.romas_insight` requires `romas_insight_labeled = true` — schema-enforces Rule 3.

---

*Never bypass these constraints in application code. They are the contract.*
