-- =====================================================================
-- 0012_rls_with_check_and_tags.sql
-- SHIP-16 (ship-execution-plan Wave 3) · ROMAS Wire
-- Depends: 0011_rls_policies.sql (editor_publish + audio_qa_flip policies)
-- =====================================================================
--
-- Defense-in-depth hardening:
--   1. Add WITH CHECK to the two UPDATE policies. 0011 set only USING, which
--      gates WHICH existing rows an authorized role may target — but without
--      WITH CHECK, the NEW row after UPDATE is unconstrained. Adding the same
--      role predicate as WITH CHECK ensures an authorized writer cannot mutate
--      a row into a state that escapes the policy. (The schema CHECKs —
--      audio_publish_requires_qa, articles_published_requires_author — remain
--      the WHETHER gate; these policies are the WHO gate.)
--   2. Gate #8 (SSOT §12.8): a PUBLISHED article must carry audience + region
--      tags. modality_tags is intentionally NOT forced here — reimbursement /
--      operations / vendor / policy content legitimately has no modality, so a
--      hard modality constraint would block valid publishes. Gate #8's modality
--      requirement stays editorial-enforced (audio-qa / fact-checker review).
--
-- Postgres ALTER POLICY can set WITH CHECK on an existing policy; to keep the
-- DOWN path clean (true removal, not "WITH CHECK (true)"), DOWN drops + recreates
-- the 0011 USING-only form.

-- ---------------------------------------------------------------------
-- UP
-- ---------------------------------------------------------------------
alter policy "editor_publish" on articles
  with check (
    exists (
      select 1 from qa_reviewers
      where id = auth.uid()
        and role = 'editor_in_chief'
        and active = true
    )
  );

alter policy "audio_qa_flip" on audio_jobs
  with check (
    exists (
      select 1 from qa_reviewers
      where id = auth.uid()
        and role = 'audio_qa'
        and active = true
    )
  );

alter table articles add constraint articles_published_requires_tags
  check (
    status <> 'published'
    or (
      array_length(audience_tags, 1) >= 1
      and array_length(region, 1) >= 1
    )
  );

-- =====================================================================
-- DOWN (manual revert — Supabase migrations are forward-only; this block
-- documents + is validated by the SHIP-16 rollback check)
-- ---------------------------------------------------------------------
--   alter table articles drop constraint articles_published_requires_tags;
--   drop policy "editor_publish" on articles;
--   create policy "editor_publish" on articles for update using (
--     exists (select 1 from qa_reviewers where id = auth.uid()
--             and role = 'editor_in_chief' and active = true));
--   drop policy "audio_qa_flip" on audio_jobs;
--   create policy "audio_qa_flip" on audio_jobs for update using (
--     exists (select 1 from qa_reviewers where id = auth.uid()
--             and role = 'audio_qa' and active = true));
-- =====================================================================
-- End 0012_rls_with_check_and_tags.sql
-- =====================================================================
