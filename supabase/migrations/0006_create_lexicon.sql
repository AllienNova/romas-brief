-- =====================================================================
-- 0006_create_lexicon.sql
-- T-108 (MIP §B.1) · ROMAS Wire
-- Author: ROMAS Wire engineering, 2026-05-21 (M1-completion cycle)
-- Canonical source: Docs/specs/contracts/supabase-schema.sql lines 263-289
-- Anchors: SSOT §10 (audio architecture lexicon discipline) · ADR-0004
--          (TTS engines) · pronunciation-lexicon skill (30-entry seed)
-- Depends: 0001_create_articles.sql (qa_reviewers for added_by + decided_by)
-- =====================================================================
--
-- Scope of this migration
--   1. lexicon table — canonical 30+ entry vocabulary feeding ElevenLabs
--      SSML + PlayHT speech substitution. Term types per audio architecture:
--      vendor / drug / device / modality / acronym / person / institution / site.
--   2. lexicon_proposals table — proposed new entries from the
--      audio-producer agent when it encounters an unknown medical/physics
--      term during script generation. Editor-in-chief or audio_qa promotes
--      proposals to lexicon entries via the CMS lexicon admin UI (M2).
--
-- Out of scope (deferred)
--   - 30-entry seed data → supabase/seed.sql (M2 T-201 expansion)
--   - lexicon admin UI in apps/cms → T-201/T-202
--   - audio-producer auto-proposal logic → T-202

-- ---------------------------------------------------------------------
-- lexicon
-- ---------------------------------------------------------------------
create table lexicon (
  id       uuid primary key default gen_random_uuid(),
  term     text unique not null,
  -- SSOT §10 + audio architecture: 8 vocabulary types
  type     text not null check (
             type in (
               'vendor', 'drug', 'device', 'modality',
               'acronym', 'person', 'institution', 'site'
             )
           ),
  -- IPA (International Phonetic Alphabet) string for tooling fallback
  ipa      text,
  -- SSML <phoneme> markup applied at TTS pre-processing time
  ssml     text,
  -- Plain-English re-spelling for the PlayHT failover path (no SSML there)
  spoken   text,
  notes    text,
  added_by uuid references qa_reviewers(id),
  added_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- lexicon_proposals
-- ---------------------------------------------------------------------
create table lexicon_proposals (
  id              uuid primary key default gen_random_uuid(),
  term            text not null,
  proposed_ipa    text,
  proposed_spoken text,
  -- audio-producer is the default proposer; manual proposals carry the
  -- editor's identifier in this column for future audit trail.
  proposed_by     text default 'audio_producer',
  status          text not null default 'pending' check (
                    status in ('pending', 'approved', 'rejected')
                  ),
  decided_by      uuid references qa_reviewers(id),
  decided_at      timestamptz,
  created_at      timestamptz default now()
);

-- =====================================================================
-- End 0006_create_lexicon.sql
-- =====================================================================
