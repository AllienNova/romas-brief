-- =====================================================================
-- 0002_create_audio_jobs.sql
-- T-104 (MIP §B.1) · ROMAS Brief
-- Author: ROMAS Brief engineering, 2026-05-16
-- Canonical source: Docs/specs/contracts/supabase-schema.sql lines 130-178
-- Anchors: SSOT v1.2.0 §4 (4-tier audio + Tier 5 video), §7 (state
--          machines, 5-condition publish gate), §2 rule 6 (inviolable
--          rule: no audio live without editorial QA pass)
-- Depends: 0001_create_articles.sql (articles + qa_reviewers)
-- =====================================================================
--
-- Scope of this migration
--   1. audio_jobs table — full canonical schema, 1:N from articles
--   2. Three named CHECK constraints:
--        - audio_publish_requires_qa  (the 5-condition inviolable gate)
--        - audio_revoke_requires_reason
--        - audio_skip_requires_reason
--   3. Three indexes: article_id, audio_status, partial tier+published
--
-- Out of scope (deferred)
--   - updated_at trigger attachment → 0011 (set_updated_at fn in 0009)
--   - RLS audio_qa_flip policy → T-113 / 0011_rls_policies.sql
--   - Audio job seed fixtures → land with T-201 lexicon seed work

-- ---------------------------------------------------------------------
-- audio_jobs
-- ---------------------------------------------------------------------
create table audio_jobs (
  id                      uuid primary key default gen_random_uuid(),
  article_id              uuid not null references articles(id) on delete cascade,
  -- SSOT §4: 4 tiers Day 1 + Tier 5 video Day 60 (ADR-0005 cycle-3, ADR-0012 placeholder)
  -- A11 (build-2026-05-21 / ADR-0017): column renamed from `tier` → `audio_tier`
  -- to disambiguate from articles.tier (editorial-edition enum).
  audio_tier              text not null check (
                            audio_tier in (
                              'audio_brief', 'daily_brief', 'podcast',
                              'conference_brief', 'video_podcast'
                            )
                          ),
  target_length_sec       int not null,
  -- ADR-0004: ElevenLabs primary + PlayHT failover
  voice_engine_used       text check (
                            voice_engine_used is null
                            or voice_engine_used in ('elevenlabs', 'playht')
                          ),
  -- SSOT §7 audio_jobs.audio_status state machine
  audio_status            text not null default 'queued' check (
                            audio_status in (
                              'queued', 'generating', 'in_review',
                              'published', 'skipped', 'revoked'
                            )
                          ),
  audio_url_cdn           text,
  audio_url_archive       text,
  transcript_url          text,
  duration_sec            int,
  -- ADR-0016 (build-2026-05-21): -16 LUFS / -1 dBTP production target enforced
  -- in audio-qa-reviewer + audio-production-pipeline (R-202 two-pass loudnorm).
  -- DB gate widened to broadcast speech safe band [-18, -14] LUFS.
  loudness_lufs           numeric(5,2),
  true_peak_dbtp          numeric(5,2),
  clinical_claims_checked boolean default false,
  qa_reviewer             uuid references qa_reviewers(id),
  qa_reviewed_at          timestamptz,
  qa_notes                text,
  skip_reason             text,
  revoke_reason           text,
  notes                   text,
  -- A4 (build-2026-05-21): 200 KB cap matches articles.body_md guard.
  script_md               text check (script_md is null or length(script_md) <= 200000),
  cover_url               text,
  error                   text,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),

  -- -------------------------------------------------------------------
  -- Inviolable rule 6 (SSOT §2 + §7): the 5-condition publish gate
  -- All five must be true for audio_status='published':
  --   1. clinical_claims_checked = true
  --   2. qa_reviewer IS NOT NULL
  --   3. loudness_lufs BETWEEN -18 AND -14  (ADR-0016, was -17..-15)
  --   4. true_peak_dbtp <= -1
  --   5. transcript_url IS NOT NULL
  -- Cycle-1 F-P1-01 upgraded this gate from 4 to 5 conditions WITH the
  -- band. ADR-0016 (cycle build-2026-05-21) widens the band to the
  -- broadcast safe range; the -16 LUFS production target remains the
  -- agent-layer target enforced by audio-qa-reviewer.
  -- -------------------------------------------------------------------
  constraint audio_publish_requires_qa check (
    audio_status <> 'published'
    or (
      clinical_claims_checked = true
      and qa_reviewer is not null
      and loudness_lufs between -18 and -14
      and true_peak_dbtp <= -1
      and transcript_url is not null
    )
  ),

  -- SSOT §7: revoke requires an explicit revoke_reason
  constraint audio_revoke_requires_reason check (
    audio_status <> 'revoked' or revoke_reason is not null
  ),

  -- SSOT §7: skip requires an explicit skip_reason
  constraint audio_skip_requires_reason check (
    audio_status <> 'skipped' or skip_reason is not null
  )
);

-- ---------------------------------------------------------------------
-- Indexes (per contract supabase-schema.sql lines 176-178)
-- ---------------------------------------------------------------------
create index audio_jobs_article_idx   on audio_jobs(article_id);
create index audio_jobs_status_idx    on audio_jobs(audio_status);
-- Partial index for per-tier published-set fan-out (RSS publishers + reader).
-- A11: index references renamed audio_tier column.
create index audio_jobs_tier_published
  on audio_jobs(audio_tier, audio_status)
  where audio_status = 'published';
-- A6 (build-2026-05-21): one audio job per (article, audio_tier). The
-- audio-producer agent retries on failure (audio-production-pipeline §3-retry
-- backoff); the unique index makes retries idempotent at the DB layer.
create unique index audio_jobs_article_tier_uniq
  on audio_jobs(article_id, audio_tier);

-- =====================================================================
-- End 0002_create_audio_jobs.sql
-- =====================================================================
