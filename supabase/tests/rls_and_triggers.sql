-- =====================================================================
-- supabase/tests/rls_and_triggers.sql · ROMAS Wire
-- R-105 extension · RLS enabled on all 11 tables + 5 named policies +
-- set_updated_at function + 3 trigger attachments per 0011_rls_policies.
-- =====================================================================

begin;
select plan(22);

-- ---------------------------------------------------------------------
-- RLS enabled on every table
-- ---------------------------------------------------------------------
select ok(
  (select relrowsecurity from pg_class where relname = 'articles'),
  'RLS enabled on articles'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'claims'),
  'RLS enabled on claims'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'audio_jobs'),
  'RLS enabled on audio_jobs'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'sources'),
  'RLS enabled on sources'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'source_health'),
  'RLS enabled on source_health'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'embargo_holds'),
  'RLS enabled on embargo_holds'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'lexicon'),
  'RLS enabled on lexicon'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'lexicon_proposals'),
  'RLS enabled on lexicon_proposals'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'revocations'),
  'RLS enabled on revocations'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'subscribers'),
  'RLS enabled on subscribers'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'qa_reviewers'),
  'RLS enabled on qa_reviewers'
);

-- ---------------------------------------------------------------------
-- Five named policies present
-- ---------------------------------------------------------------------
select policies_are(
  'public',
  'articles',
  array['public_read_published', 'editor_read_all', 'editor_publish'],
  'articles has the 3 expected policies'
);

select policies_are(
  'public',
  'audio_jobs',
  array['audio_qa_flip'],
  'audio_jobs has the audio_qa_flip policy'
);

select policies_are(
  'public',
  'embargo_holds',
  array['embargo_read_restricted'],
  'embargo_holds has the embargo_read_restricted policy'
);

-- ---------------------------------------------------------------------
-- set_updated_at function exists
-- ---------------------------------------------------------------------
select has_function(
  'public',
  'set_updated_at',
  'set_updated_at() function exists (defined in 0009)'
);

-- ---------------------------------------------------------------------
-- Three trigger attachments (subscribers in 0009; articles + audio_jobs in 0011)
-- ---------------------------------------------------------------------
select has_trigger(
  'public',
  'subscribers',
  'subscribers_set_updated',
  'subscribers_set_updated trigger exists'
);
select has_trigger(
  'public',
  'articles',
  'articles_set_updated',
  'articles_set_updated trigger exists'
);
select has_trigger(
  'public',
  'audio_jobs',
  'audio_jobs_set_updated',
  'audio_jobs_set_updated trigger exists'
);

-- ---------------------------------------------------------------------
-- updated_at refresh actually fires on UPDATE
-- ---------------------------------------------------------------------
insert into qa_reviewers (id, email, name, role)
values ('00000000-0000-0000-0000-000000000004', 'rls-trigger@example.com', 'T', 'audio_qa');

insert into articles (id, slug, archetype, category, content_type, title, standfirst, body_md, primary_source_url, author_id, updated_at)
values ('55555555-5555-5555-5555-555555555555',
        'trigger-test', 'short_brief', 'ai', 'news_brief',
        'T', 'S', 'B', 'https://example.com',
        '00000000-0000-0000-0000-000000000004',
        now() - interval '1 hour');

update articles set title = 'T-updated' where id = '55555555-5555-5555-5555-555555555555';

select ok(
  (select updated_at >= now() - interval '1 minute'
   from articles
   where id = '55555555-5555-5555-5555-555555555555'),
  'articles.updated_at refreshed by trigger on UPDATE'
);

-- subscriber_count view exists and is queryable
select has_view('public', 'subscriber_count', 'subscriber_count view exists');

-- Default region for subscribers (cycle-5 D-002)
insert into subscribers (email) values ('region-default@example.com');
select results_eq(
  $$ select region from subscribers where email = 'region-default@example.com' $$,
  $$ values ('americas'::text) $$,
  'subscribers.region defaults to americas (D-002 decision-log)'
);

-- Beehiiv subscription_id uniqueness
insert into subscribers (email, beehiiv_subscription_id) values ('beehiiv-1@example.com', 'bh_001');
select throws_ok(
  $$ insert into subscribers (email, beehiiv_subscription_id) values ('beehiiv-2@example.com', 'bh_001') $$,
  '23505',
  null,
  'subscribers.beehiiv_subscription_id unique constraint enforced'
);

select * from finish();
rollback;
