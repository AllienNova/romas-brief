-- =====================================================================
-- supabase/tests/notices_security.sql · ROMAS Wire · NoticeBoard v2 (NB-fix A)
-- pgTAP guards for the security invariants added in review (H-01/H-03/M-04)
-- + the sponsor-firewall CHECK. Runs in the pgTAP suite once 0015 is applied.
-- =====================================================================
begin;
select plan(4);

-- M-04: sponsor_public exposes ONLY id + name (contact_email never anon-readable).
select columns_are(
  'public', 'sponsor_public', array['id', 'name'],
  'sponsor_public must expose exactly id,name — contact_email never anon-readable'
);

-- H-01: cta_url scheme CHECK present (https-only external OR absolute-path internal).
select ok(
  exists(select 1 from pg_constraint where conname = 'cta_url_safe_scheme'),
  'cta_url_safe_scheme CHECK present (XSS guard)'
);

-- H-03: notice_events INSERT policy is published-gated (not WITH CHECK true).
select ok(
  exists(
    select 1 from pg_policies
    where tablename = 'notice_events'
      and policyname = 'notice_events_public_insert'
      and with_check ilike '%published%'
  ),
  'notice_events INSERT restricted to published notices'
);

-- Firewall: sponsored notices can never be featured.
select ok(
  exists(select 1 from pg_constraint where conname = 'sponsored_cannot_be_featured'),
  'sponsored_cannot_be_featured CHECK present'
);

select * from finish();
rollback;
