-- pgTAP: notices_run_scheduler() lifecycle transitions (NB-5 / §10).
-- Runs at migrate time via `supabase test db` / pg_prove. Verifies the fn
-- exists and that promote / expire / featured-invariant behave per spec.
begin;
select plan(6);

select has_function(
  'public', 'notices_run_scheduler', 'notices_run_scheduler() exists'
);

-- Fixtures: due scheduled, future scheduled, expiring published, and a
-- featured hand-off (old published lead + new due-scheduled lead).
insert into notices (id, type, title, summary, publish_at, priority, status, is_sponsored) values
  ('11111111-1111-1111-1111-111111111111', 'news',         'due',     'summary', now() - interval '1 minute', 'normal',   'scheduled', false),
  ('22222222-2222-2222-2222-222222222222', 'news',         'future',  'summary', now() + interval '1 day',    'normal',   'scheduled', false),
  ('33333333-3333-3333-3333-333333333333', 'news',         'expiring','summary', now() - interval '2 days',   'normal',   'published', false),
  ('44444444-4444-4444-4444-444444444444', 'announcement', 'old lead','summary', now() - interval '3 days',   'featured', 'published', false),
  ('55555555-5555-5555-5555-555555555555', 'announcement', 'new lead','summary', now() - interval '1 minute', 'featured', 'scheduled', false);

update notices set expires_at = now() - interval '1 minute'
  where id = '33333333-3333-3333-3333-333333333333';

select notices_run_scheduler();

select is(
  (select status::text from notices where id = '11111111-1111-1111-1111-111111111111'),
  'published', 'due scheduled → published'
);
select is(
  (select status::text from notices where id = '22222222-2222-2222-2222-222222222222'),
  'scheduled', 'future scheduled untouched'
);
select is(
  (select status::text from notices where id = '33333333-3333-3333-3333-333333333333'),
  'expired', 'past-expiry published → expired'
);
select is(
  (select priority::text from notices where id = '44444444-4444-4444-4444-444444444444'),
  'high', 'old featured demoted (yields the lead)'
);
select is(
  (select priority::text || ':' || status::text from notices where id = '55555555-5555-5555-5555-555555555555'),
  'featured:published', 'new featured promoted as the sole live lead'
);

select * from finish();
rollback;
