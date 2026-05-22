-- =====================================================================
-- supabase/tests/enums_and_lengths.sql · ROMAS Brief
-- R-105 extension · cycle-1 P2-05 carry — enum + length CHECK coverage
-- per /team-build cycle-1 critic F-P2-05 (articles.title<=90,
-- claims.confidence, archetype/tier/status/category/content_type/
-- source_language/qa_reviewers.role/audio_jobs.audio_tier enums).
-- =====================================================================

begin;
select plan(13);

-- Fixture
insert into qa_reviewers (id, email, name, role)
values ('00000000-0000-0000-0000-000000000003', 'enums-test@example.com', 'Enums Reviewer', 'audio_qa');

-- articles.title <= 90 chars
select throws_ok(
  $$ insert into articles (slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url)
     values ('test-title-overflow', 'short_brief', 'ai', 'news_brief',
             repeat('x', 91), 'S', 'B', 'https://example.com') $$,
  '23514',
  null,
  'articles.title > 90 chars rejected'
);

-- archetype enum
select throws_ok(
  $$ insert into articles (slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url)
     values ('test-archetype', 'novella', 'ai', 'news_brief',
             'T', 'S', 'B', 'https://example.com') $$,
  '23514',
  null,
  'archetype enum rejects unknown value'
);

-- articles.tier enum (editorial edition)
select throws_ok(
  $$ insert into articles (slug, archetype, tier, category, content_type, title, standfirst, body_md, primary_source_url)
     values ('test-tier', 'short_brief', 'monthly', 'ai', 'news_brief',
             'T', 'S', 'B', 'https://example.com') $$,
  '23514',
  null,
  'articles.tier enum rejects unknown editorial-edition value'
);

-- status enum
select throws_ok(
  $$ insert into articles (slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url, status)
     values ('test-status', 'short_brief', 'ai', 'news_brief',
             'T', 'S', 'B', 'https://example.com', 'archived') $$,
  '23514',
  null,
  'articles.status enum rejects unknown value'
);

-- category enum (SSOT §12.2: 11 categories)
select throws_ok(
  $$ insert into articles (slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url)
     values ('test-category', 'short_brief', 'biotech', 'news_brief',
             'T', 'S', 'B', 'https://example.com') $$,
  '23514',
  null,
  'articles.category enum rejects unknown value (SSOT §12.2 11-category lock)'
);

-- content_type enum
select throws_ok(
  $$ insert into articles (slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url)
     values ('test-content-type', 'short_brief', 'ai', 'editorial',
             'T', 'S', 'B', 'https://example.com') $$,
  '23514',
  null,
  'articles.content_type enum rejects unknown value'
);

-- source_language enum (ADR-0013)
select throws_ok(
  $$ insert into articles (slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url, source_language)
     values ('test-source-lang', 'short_brief', 'ai', 'news_brief',
             'T', 'S', 'B', 'https://example.com', 'tr') $$,
  '23514',
  null,
  'articles.source_language enum rejects unknown value (ADR-0013 10-language lock)'
);

-- translation_provider enum
select throws_ok(
  $$ insert into articles (slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url, source_language, translation_provider)
     values ('test-trans-prov', 'short_brief', 'ai', 'news_brief',
             'T', 'S', 'B', 'https://example.com', 'es', 'manual') $$,
  '23514',
  null,
  'articles.translation_provider enum rejects unknown value'
);

-- qa_reviewers.role enum
select throws_ok(
  $$ insert into qa_reviewers (email, name, role) values ('role-test@example.com', 'T', 'designer') $$,
  '23514',
  null,
  'qa_reviewers.role enum rejects unknown value'
);

-- audio_jobs.audio_tier enum (ADR-0017 column rename + 5-value enum)
insert into articles (id, slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url, author_id)
values ('44444444-4444-4444-4444-444444444444', 'enum-parent', 'short_brief', 'ai', 'news_brief',
        'T', 'S', 'B', 'https://example.com', '00000000-0000-0000-0000-000000000003');

select throws_ok(
  $$ insert into audio_jobs (article_id, audio_tier, target_length_sec)
     values ('44444444-4444-4444-4444-444444444444', 'mini_brief', 300) $$,
  '23514',
  null,
  'audio_jobs.audio_tier enum rejects unknown value (ADR-0017 5-value lock)'
);

-- audio_jobs.audio_status enum
select throws_ok(
  $$ insert into audio_jobs (article_id, audio_tier, target_length_sec, audio_status)
     values ('44444444-4444-4444-4444-444444444444', 'audio_brief', 420, 'mastering') $$,
  '23514',
  null,
  'audio_jobs.audio_status enum rejects unknown value'
);

-- audio_jobs.voice_engine_used enum
select throws_ok(
  $$ insert into audio_jobs (article_id, audio_tier, target_length_sec, voice_engine_used)
     values ('44444444-4444-4444-4444-444444444444', 'audio_brief', 420, 'whisper') $$,
  '23514',
  null,
  'audio_jobs.voice_engine_used enum rejects unknown value (only elevenlabs/playht)'
);

-- claims.confidence in [0, 1]
insert into claims (article_id, claim_text, source_url, confidence)
values ('44444444-4444-4444-4444-444444444444', 'C', 'https://example.com', 0.5);

select results_eq(
  $$ select confidence from claims where article_id = '44444444-4444-4444-4444-444444444444' $$,
  $$ values (0.5::numeric(4,3)) $$,
  'claims.confidence = 0.5 stored correctly per A12 numeric(4,3)'
);

select * from finish();
rollback;
