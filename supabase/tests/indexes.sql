-- =====================================================================
-- supabase/tests/indexes.sql · ROMAS Brief
-- R-105 extension · verify named indexes exist per Bucket A + canonical
-- contract. Tests existence, not query-plan optimality (that lives in
-- /team-qa performance reports).
-- =====================================================================

begin;
select plan(13);

-- Core articles indexes
select has_index('public', 'articles', 'articles_status_idx',
  'articles_status_idx exists');
select has_index('public', 'articles', 'articles_published_at_idx',
  'articles_published_at_idx exists');
select has_index('public', 'articles', 'articles_tier_published_idx',
  'articles_tier_published_idx exists');

-- A7: publish_at partial index for 3-edition scheduler
select has_index('public', 'articles', 'articles_publish_at_idx',
  'A7: articles_publish_at_idx exists (3-edition publish scheduler)');

-- Cycle-4 category + content_type fan-out
select has_index('public', 'articles', 'articles_category_idx',
  'articles_category_idx exists');
select has_index('public', 'articles', 'articles_content_type_idx',
  'articles_content_type_idx exists');

-- audio_jobs core indexes
select has_index('public', 'audio_jobs', 'audio_jobs_article_idx',
  'audio_jobs_article_idx exists');
select has_index('public', 'audio_jobs', 'audio_jobs_status_idx',
  'audio_jobs_status_idx exists');
select has_index('public', 'audio_jobs', 'audio_jobs_tier_published',
  'audio_jobs_tier_published partial index exists (on audio_tier, ADR-0017)');

-- A6: audio_jobs unique on (article_id, audio_tier)
select has_index('public', 'audio_jobs', 'audio_jobs_article_tier_uniq',
  'A6: audio_jobs_article_tier_uniq unique index exists');

-- A8: sources active+last_fetched_at partial replacement
select has_index('public', 'sources', 'sources_active_last_fetched_idx',
  'A8: sources_active_last_fetched_idx partial index exists');

-- claims FK index
select has_index('public', 'claims', 'claims_article_idx',
  'claims_article_idx exists');

-- embargo_holds partial
select has_index('public', 'embargo_holds', 'embargo_holds_until_idx',
  'embargo_holds_until_idx partial-on-unreleased index exists');

select * from finish();
rollback;
