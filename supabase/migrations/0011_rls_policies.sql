-- =====================================================================
-- 0011_rls_policies.sql
-- T-113 (MIP §B.1) + R-114 (RLS wiring for apps/cms) · ROMAS Wire
-- Author: ROMAS Wire engineering, 2026-05-21 (M1-completion cycle)
-- Canonical source: Docs/specs/contracts/supabase-schema.sql lines 320-368
-- Anchors: SSOT §2 inviolable rule 6 (audio QA gate enforced by RLS +
--          schema CHECK) · CLAUDE.md §7 internal CMS Cloudflare
--          Access-gated · ADR-0002 (Supabase + RLS) · ADR-0015 v2
--          (no Pages Router middleware — Auth at server component level)
-- Depends: 0001..0010 (all 11 tables exist) · qa_reviewers seeded
--          (supabase/seed.sql)
-- =====================================================================
--
-- RLS deferral note: build-2026-05-21 build cycle deliberately deferred
-- RLS to this migration so the team could iterate on schema CHECK
-- constraints in 0001..0005 without prematurely restricting test query
-- access. With 0011 applied, the database becomes deny-by-default for
-- anon + authenticated; the 5 named policies and service-role bypass
-- handle every legitimate access pattern.
--
-- Scope of this migration
--   1. Enable RLS on all 11 tables.
--   2. Five named policies per canonical contract:
--        - public_read_published — anonymous can read published, non-revoked articles
--        - editor_read_all — authenticated qa_reviewers can SELECT every article
--        - editor_publish — only editor_in_chief role can UPDATE article status
--        - audio_qa_flip — only audio_qa role can UPDATE audio_status
--        - embargo_read_restricted — editor_in_chief + fact_checker only
--   3. articles_set_updated + audio_jobs_set_updated triggers (the
--      set_updated_at function landed in 0009; subscribers trigger
--      attached there. Articles + audio_jobs land here per the
--      contract's grouping with RLS.)
--
-- Tables WITHOUT an explicit policy after this migration:
--   - sources, source_health, lexicon, lexicon_proposals, revocations,
--     qa_reviewers — these are service-role-only surfaces (cron-ingest
--     worker, audio-producer worker, cms-engineer admin views).
--     Service role bypasses RLS by design. Anonymous + authenticated
--     have no read/write access. The CMS uses Supabase Auth Helper at
--     the server-component layer with a JWT scoped to the qa_reviewer's
--     auth.uid(); the editor_read_all + audio_qa_flip policies on
--     articles + audio_jobs hand back the relevant rows.
--
-- R-114 partial-close: the migration + Kimal seed (supabase/seed.sql)
-- land in this cycle; the `apps/cms/lib/supabase.ts` Auth Helper scaffold
-- (server-component-side via `@supabase/ssr`, NOT Next middleware per
-- ADR-0015 v2 closed-CVE class hygiene) is **deferred to the next cycle**
-- so it can be written against verified-current `@supabase/ssr` docs
-- (per rule 11 — read official sources before implementing). Live
-- Supabase project provisioning is also yours; this cycle only delivers
-- the schema + RLS migration + pgTAP coverage.
--
-- Other deferrals
--   - qa_reviewers seed → supabase/seed.sql (already inserts Kimal solo
--     per D-023; no change needed in this cycle)
--   - second audio_qa reviewer activation (Day 30) → operational, no
--     schema change needed
--   - lexicon admin policy when CMS lexicon UI lands → future migration

-- ---------------------------------------------------------------------
-- Enable RLS on every table
-- ---------------------------------------------------------------------
alter table articles          enable row level security;
alter table claims            enable row level security;
alter table audio_jobs        enable row level security;
alter table sources           enable row level security;
alter table source_health     enable row level security;
alter table embargo_holds     enable row level security;
alter table lexicon           enable row level security;
alter table lexicon_proposals enable row level security;
alter table revocations       enable row level security;
alter table subscribers       enable row level security;
alter table qa_reviewers      enable row level security;

-- ---------------------------------------------------------------------
-- Policy 1: public can read published, non-revoked articles
-- ---------------------------------------------------------------------
create policy "public_read_published" on articles
  for select
  using (status = 'published' and revoked_at is null);

-- ---------------------------------------------------------------------
-- Policy 2: authenticated qa_reviewers can read everything in articles
-- ---------------------------------------------------------------------
create policy "editor_read_all" on articles
  for select
  using (
    exists (
      select 1 from qa_reviewers
      where id = auth.uid() and active = true
    )
  );

-- ---------------------------------------------------------------------
-- Policy 3: only editor_in_chief can update articles (status flip)
-- ---------------------------------------------------------------------
create policy "editor_publish" on articles
  for update
  using (
    exists (
      select 1 from qa_reviewers
      where id = auth.uid()
        and role = 'editor_in_chief'
        and active = true
    )
  );

-- ---------------------------------------------------------------------
-- Policy 4: only audio_qa role can flip audio_status
-- (The schema CHECK constraint `audio_publish_requires_qa` validates
--  the 5 conditions independently — RLS gates WHO can attempt the
--  flip; the CHECK gates WHETHER the flip is allowed.)
-- ---------------------------------------------------------------------
create policy "audio_qa_flip" on audio_jobs
  for update
  using (
    exists (
      select 1 from qa_reviewers
      where id = auth.uid()
        and role = 'audio_qa'
        and active = true
    )
  );

-- ---------------------------------------------------------------------
-- Policy 5: embargo_holds readable only by editor_in_chief + fact_checker
-- ---------------------------------------------------------------------
create policy "embargo_read_restricted" on embargo_holds
  for select
  using (
    exists (
      select 1 from qa_reviewers
      where id = auth.uid()
        and role in ('editor_in_chief', 'fact_checker')
        and active = true
    )
  );

-- ---------------------------------------------------------------------
-- Trigger attachments for set_updated_at (function defined in 0009)
-- ---------------------------------------------------------------------
create trigger articles_set_updated
  before update on articles
  for each row
  execute function set_updated_at();

create trigger audio_jobs_set_updated
  before update on audio_jobs
  for each row
  execute function set_updated_at();

-- =====================================================================
-- End 0011_rls_policies.sql
-- =====================================================================
