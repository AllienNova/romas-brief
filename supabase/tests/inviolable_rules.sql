-- =====================================================================
-- supabase/tests/inviolable_rules.sql · ROMAS Brief
-- R-105 (remediation-plan M1) · pgTAP coverage for the 6 inviolable rules
-- per SSOT §2 + audio QA gate per ADR-0006 (with ADR-0016 widen).
-- =====================================================================
--
-- Acceptance: A-114..A-119 per test-qa-plan.md
--
-- Run: supabase test db (uses pg_prove against `pgtap` extension)
-- =====================================================================

begin;
select plan(18);

-- Required extension
select has_extension('pgtap', 'pgtap extension loaded');

-- Rule 1: every article requires a primary_source_url that is a non-empty http(s) URL
select throws_ok(
  $$ insert into articles (slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url)
     values ('test-rule1-empty', 'short_brief', 'ai', 'news_brief', 'T', 'S', 'B', '') $$,
  '23514',
  null,
  'rule 1: empty primary_source_url rejected'
);

select throws_ok(
  $$ insert into articles (slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url)
     values ('test-rule1-junk', 'short_brief', 'ai', 'news_brief', 'T', 'S', 'B', '.') $$,
  '23514',
  null,
  'rule 1: junk primary_source_url rejected (ADR-0016 / A3 URL scheme guard)'
);

select throws_ok(
  $$ insert into articles (slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url)
     values ('test-rule1-js', 'short_brief', 'ai', 'news_brief', 'T', 'S', 'B', 'javascript:alert(1)') $$,
  '23514',
  null,
  'rule 1: javascript: scheme rejected (A3 URL scheme guard)'
);

-- Rule 2: embargoed=true requires embargo_until
select throws_ok(
  $$ insert into articles (slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url, embargoed)
     values ('test-rule2', 'short_brief', 'ai', 'news_brief', 'T', 'S', 'B', 'https://example.com', true) $$,
  '23514',
  null,
  'rule 2: embargoed=true without embargo_until rejected'
);

-- Rule 2 alt: embargo_holds release-pair atomicity (A2)
select throws_ok(
  $$ insert into embargo_holds (candidate_title, source_url, embargo_until, released_at)
     values ('T', 'https://example.com', now() + interval '1 day', now()) $$,
  '23514',
  null,
  'rule 2 / A2: released_at set without released_to_article_id rejected'
);

-- Rule 3: romas_insight requires romas_insight_labeled = true
select throws_ok(
  $$ insert into articles (slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url, romas_insight)
     values ('test-rule3', 'short_brief', 'ai', 'news_brief', 'T', 'S', 'B', 'https://example.com', 'Take') $$,
  '23514',
  null,
  'rule 3: romas_insight set without romas_insight_labeled=true rejected'
);

-- Rule 6: audio publish gate (5 conditions per ADR-0016)
-- First create a parent article to satisfy FK
insert into qa_reviewers (id, email, name, role)
values ('00000000-0000-0000-0000-000000000001', 'rls-test-1@example.com', 'Test Reviewer', 'audio_qa')
on conflict (email) do nothing;

insert into articles (id, slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url, status, author_id)
values ('11111111-1111-1111-1111-111111111111', 'rule6-parent', 'short_brief', 'ai', 'news_brief',
        'P', 'S', 'B', 'https://example.com', 'draft',
        '00000000-0000-0000-0000-000000000001');

-- 6a: published audio with clinical_claims_checked=false rejected
select throws_ok(
  $$ insert into audio_jobs (article_id, audio_tier, target_length_sec, audio_status, transcript_url, qa_reviewer, loudness_lufs, true_peak_dbtp, clinical_claims_checked)
     values ('11111111-1111-1111-1111-111111111111', 'audio_brief', 420, 'published',
             'https://example.com/transcript.txt',
             '00000000-0000-0000-0000-000000000001',
             -16.0, -1.5, false) $$,
  '23514',
  null,
  'rule 6a: published audio with clinical_claims_checked=false rejected'
);

-- 6b: published audio with qa_reviewer NULL rejected
select throws_ok(
  $$ insert into audio_jobs (article_id, audio_tier, target_length_sec, audio_status, transcript_url, loudness_lufs, true_peak_dbtp, clinical_claims_checked)
     values ('11111111-1111-1111-1111-111111111111', 'daily_brief', 600, 'published',
             'https://example.com/transcript.txt',
             -16.0, -1.5, true) $$,
  '23514',
  null,
  'rule 6b: published audio with qa_reviewer NULL rejected'
);

-- 6c: published audio with loudness outside [-18, -14] rejected (ADR-0016 DB gate)
select throws_ok(
  $$ insert into audio_jobs (article_id, audio_tier, target_length_sec, audio_status, transcript_url, qa_reviewer, loudness_lufs, true_peak_dbtp, clinical_claims_checked)
     values ('11111111-1111-1111-1111-111111111111', 'podcast', 1800, 'published',
             'https://example.com/transcript.txt',
             '00000000-0000-0000-0000-000000000001',
             -13.5, -1.5, true) $$,
  '23514',
  null,
  'rule 6c: published audio at -13.5 LUFS (outside ADR-0016 DB gate) rejected'
);

select throws_ok(
  $$ insert into audio_jobs (article_id, audio_tier, target_length_sec, audio_status, transcript_url, qa_reviewer, loudness_lufs, true_peak_dbtp, clinical_claims_checked)
     values ('11111111-1111-1111-1111-111111111111', 'conference_brief', 900, 'published',
             'https://example.com/transcript.txt',
             '00000000-0000-0000-0000-000000000001',
             -19.0, -1.5, true) $$,
  '23514',
  null,
  'rule 6c: published audio at -19 LUFS (outside ADR-0016 DB gate) rejected'
);

-- 6d: published audio with true_peak_dbtp > -1 rejected
select throws_ok(
  $$ insert into audio_jobs (article_id, audio_tier, target_length_sec, audio_status, transcript_url, qa_reviewer, loudness_lufs, true_peak_dbtp, clinical_claims_checked)
     values ('11111111-1111-1111-1111-111111111111', 'video_podcast', 1800, 'published',
             'https://example.com/transcript.txt',
             '00000000-0000-0000-0000-000000000001',
             -16.0, -0.5, true) $$,
  '23514',
  null,
  'rule 6d: published audio with true_peak_dbtp=-0.5 (above -1 ceiling) rejected'
);

-- 6e: published audio with transcript_url NULL rejected
select throws_ok(
  $$ insert into audio_jobs (article_id, audio_tier, target_length_sec, audio_status, qa_reviewer, loudness_lufs, true_peak_dbtp, clinical_claims_checked)
     values ('11111111-1111-1111-1111-111111111111', 'audio_brief', 420, 'published',
             '00000000-0000-0000-0000-000000000001',
             -16.0, -1.5, true) $$,
  '23514',
  null,
  'rule 6e: published audio with transcript_url NULL rejected'
);

-- 6 happy path: all 5 conditions met → row accepted (using audio_tier not yet used: video_podcast)
select lives_ok(
  $$ insert into audio_jobs (article_id, audio_tier, target_length_sec, audio_status, transcript_url, qa_reviewer, loudness_lufs, true_peak_dbtp, clinical_claims_checked)
     values ('11111111-1111-1111-1111-111111111111', 'video_podcast', 1800, 'published',
             'https://example.com/transcript.txt',
             '00000000-0000-0000-0000-000000000001',
             -16.0, -1.5, true) $$,
  'rule 6 happy path: all 5 conditions met → publish accepted'
);

-- Revoke + skip reason constraints
select throws_ok(
  $$ insert into audio_jobs (article_id, audio_tier, target_length_sec, audio_status)
     values ('11111111-1111-1111-1111-111111111111', 'daily_brief', 600, 'revoked') $$,
  '23514',
  null,
  'audio_revoke_requires_reason: revoked without revoke_reason rejected'
);

select throws_ok(
  $$ insert into audio_jobs (article_id, audio_tier, target_length_sec, audio_status)
     values ('11111111-1111-1111-1111-111111111111', 'daily_brief', 600, 'skipped') $$,
  '23514',
  null,
  'audio_skip_requires_reason: skipped without skip_reason rejected'
);

-- ADR-0013: non-English source_language requires translation_provider
select throws_ok(
  $$ insert into articles (slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url, source_language)
     values ('test-translate', 'short_brief', 'ai', 'news_brief', 'T', 'S', 'B', 'https://example.com', 'es') $$,
  '23514',
  null,
  'ADR-0013: non-English source_language requires translation_provider'
);

-- A9: published article requires author_id
select throws_ok(
  $$ insert into articles (slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url, status)
     values ('test-a9', 'short_brief', 'ai', 'news_brief', 'T', 'S', 'B', 'https://example.com', 'published') $$,
  '23514',
  null,
  'A9: status=published without author_id rejected'
);

select * from finish();
rollback;
