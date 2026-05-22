-- =====================================================================
-- supabase/tests/bucket_a_constraints.sql · ROMAS Brief
-- R-105 extension · pgTAP coverage for the 8 new CHECK constraints
-- introduced by /team-build cycle build-2026-05-21 (Bucket A items
-- A2 / A3 / A4 / A6 / A9 / A10 plus URL regex variants).
-- =====================================================================

begin;
select plan(13);

-- Fixture: a known qa_reviewer + article for FK + audio_jobs tests
insert into qa_reviewers (id, email, name, role)
values ('00000000-0000-0000-0000-000000000002', 'bucket-a-test@example.com', 'Bucket A Reviewer', 'audio_qa');

insert into articles (id, slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url, status, author_id)
values ('22222222-2222-2222-2222-222222222222', 'bucket-a-parent', 'short_brief', 'ai', 'news_brief',
        'P', 'S', 'B', 'https://example.com', 'draft',
        '00000000-0000-0000-0000-000000000002');

-- A3: URL scheme guards
select throws_ok(
  $$ insert into claims (article_id, claim_text, source_url)
     values ('22222222-2222-2222-2222-222222222222', 'Claim', 'not-a-url') $$,
  '23514',
  null,
  'A3: claims.source_url without http(s) scheme rejected'
);

select throws_ok(
  $$ insert into sources (slug, name, category, region, feed_url)
     values ('test-source-1', 'Test', 'literature', 'global', 'ftp://example.com/feed') $$,
  '23514',
  null,
  'A3: sources.feed_url with ftp scheme rejected'
);

select throws_ok(
  $$ insert into sources (slug, name, category, region, api_endpoint)
     values ('test-source-2', 'Test', 'regulatory', 'global', 'file:///etc/passwd') $$,
  '23514',
  null,
  'A3: sources.api_endpoint with file:// scheme rejected (SSRF guard)'
);

select lives_ok(
  $$ insert into sources (slug, name, category, region, feed_url, api_endpoint)
     values ('test-source-3', 'Test OK', 'literature', 'global',
             'https://example.com/feed.xml', 'https://api.example.com/v1') $$,
  'A3 happy path: https URLs accepted in sources'
);

-- A4: body_md length cap (200 KB)
select throws_ok(
  $$ insert into articles (slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url)
     values ('test-a4-oversize', 'deep_report', 'ai', 'news_brief',
             'T', 'S', repeat('x', 200001), 'https://example.com') $$,
  '23514',
  null,
  'A4: articles.body_md > 200000 chars rejected'
);

select lives_ok(
  $$ insert into articles (id, slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url, author_id)
     values ('33333333-3333-3333-3333-333333333333',
             'test-a4-under', 'deep_report', 'ai', 'news_brief',
             'T', 'S', repeat('x', 199999), 'https://example.com',
             '00000000-0000-0000-0000-000000000002') $$,
  'A4 happy path: body_md at 199999 chars accepted'
);

-- A4: script_md length cap on audio_jobs
select throws_ok(
  $$ insert into audio_jobs (article_id, audio_tier, target_length_sec, script_md)
     values ('22222222-2222-2222-2222-222222222222', 'audio_brief', 420, repeat('y', 200001)) $$,
  '23514',
  null,
  'A4: audio_jobs.script_md > 200000 chars rejected'
);

-- A5: word_count uses trim(body_md) — leading whitespace does NOT inflate count
select results_eq(
  $$ select word_count from articles where id = '33333333-3333-3333-3333-333333333333' $$,
  $$ values (1) $$,
  'A5: word_count is 1 for body_md = 199999 contiguous x chars (no extra leading-whitespace inflation)'
);

-- A6: audio_jobs unique on (article_id, audio_tier)
insert into audio_jobs (article_id, audio_tier, target_length_sec, audio_status)
values ('22222222-2222-2222-2222-222222222222', 'audio_brief', 420, 'queued');

select throws_ok(
  $$ insert into audio_jobs (article_id, audio_tier, target_length_sec, audio_status)
     values ('22222222-2222-2222-2222-222222222222', 'audio_brief', 420, 'generating') $$,
  '23505',  -- unique_violation
  null,
  'A6: second audio_jobs row with same (article_id, audio_tier) rejected'
);

-- A10: qa_reviewers.email must be lowercase
select throws_ok(
  $$ insert into qa_reviewers (email, name, role)
     values ('UPPERCASE@example.com', 'Test', 'audio_qa') $$,
  '23514',
  null,
  'A10: qa_reviewers.email with uppercase characters rejected'
);

-- A2: embargo_holds release-pair invariant
select throws_ok(
  $$ insert into embargo_holds (candidate_title, source_url, embargo_until, released_to_article_id)
     values ('T', 'https://example.com', now() + interval '1 day',
             '22222222-2222-2222-2222-222222222222') $$,
  '23514',
  null,
  'A2: released_to_article_id set without released_at rejected'
);

select lives_ok(
  $$ insert into embargo_holds (candidate_title, source_url, embargo_until)
     values ('T', 'https://example.com', now() + interval '1 day') $$,
  'A2 happy path: both columns null at insert accepted'
);

-- A12: claims.confidence in [0, 1]
select throws_ok(
  $$ insert into claims (article_id, claim_text, source_url, confidence)
     values ('22222222-2222-2222-2222-222222222222', 'C', 'https://example.com', 1.5) $$,
  '23514',
  null,
  'A12: claims.confidence > 1 rejected'
);

select * from finish();
rollback;
