-- =====================================================================
-- 0007_create_revocations.sql
-- T-109 (MIP §B.1) · ROMAS Brief
-- Author: ROMAS Brief engineering, 2026-05-21 (M1-completion cycle)
-- Canonical source: Docs/specs/contracts/supabase-schema.sql lines 295-306
-- Anchors: SSOT §7 audio revocation state machine · CLAUDE.md §5
--          revoke kill switch (60s CDN withdrawal SLA) · ADR-0006 audio
--          QA state machine published → revoked transition · R-211
--          (cdn-purge-watchdog) consumer
-- Depends: 0001_create_articles.sql (articles) · 0002_create_audio_jobs.sql
--          (audio_jobs) · qa_reviewers (T-103 territory in 0001)
-- =====================================================================
--
-- Scope of this migration
--   1. revocations table — single audit-log row per revocation event.
--      Tracks both audio-only revocations (audio_job_id non-null) and
--      article-level revocations (article_id non-null); usually both
--      are set for a coordinated revoke.
--   2. cdn_purge_at — only populated on confirmed 2xx response from
--      Cloudflare cache-purge API. Null after 90s is the trigger for
--      the cdn-purge-watchdog worker (R-211, M2) to alert.
--   3. rss_regenerated_at — populated by the rss-publisher worker once
--      the per-tier feeds have been regenerated post-revoke.
--
-- Out of scope (deferred)
--   - cdn-purge-watchdog worker → workers/cdn-purge-watchdog (R-211 M2)
--   - rss-publisher revoke trigger → workers/rss-publisher (R-212 M2)
--   - 60s SLA p99 NFR verification → /team-qa cycle-3 / A-034

-- ---------------------------------------------------------------------
-- revocations
-- ---------------------------------------------------------------------
create table revocations (
  id                  uuid primary key default gen_random_uuid(),
  -- Either or both may be set; reason and triggered_by are mandatory.
  audio_job_id        uuid references audio_jobs(id),
  article_id          uuid references articles(id),
  reason              text not null,
  triggered_by        uuid references qa_reviewers(id),
  -- ONLY set on confirmed 2xx from Cloudflare purge API (see workers/
  -- cdn-purge-watchdog for the verification path). Null at row creation;
  -- watchdog alerts if still null after 90s.
  cdn_purge_at        timestamptz,
  -- Set by rss-publisher worker once the per-tier feeds reflect the
  -- revoke. Independent of CDN purge confirmation.
  rss_regenerated_at  timestamptz,
  created_at          timestamptz default now()
);

-- =====================================================================
-- End 0007_create_revocations.sql
-- =====================================================================
