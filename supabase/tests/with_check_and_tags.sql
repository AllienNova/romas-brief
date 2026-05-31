-- =====================================================================
-- with_check_and_tags.sql · pgTAP · SHIP-16 (migration 0012)
-- Runs in deploy-migrations CI after 0012 is applied. Asserts the two
-- UPDATE policies carry a WITH CHECK and the gate-#8 tag constraint exists.
-- =====================================================================
begin;
select plan(3);

-- 1. editor_publish UPDATE policy now has a WITH CHECK expression
select ok(
  (select with_check is not null from pg_policies
     where schemaname = 'public' and tablename = 'articles' and policyname = 'editor_publish'),
  'editor_publish policy has WITH CHECK (0012)'
);

-- 2. audio_qa_flip UPDATE policy now has a WITH CHECK expression
select ok(
  (select with_check is not null from pg_policies
     where schemaname = 'public' and tablename = 'audio_jobs' and policyname = 'audio_qa_flip'),
  'audio_qa_flip policy has WITH CHECK (0012)'
);

-- 3. gate-#8 tag-presence CHECK constraint exists on articles
select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'public.articles'::regclass
      and conname = 'articles_published_requires_tags'
  ),
  'articles_published_requires_tags constraint exists (0012)'
);

select * from finish();
rollback;
