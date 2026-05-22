-- =====================================================================
-- supabase/seed.sql · ROMAS Brief
-- Applied after `supabase db push` (migrations 0001..0010 land in M1;
-- 0001..0005 are present today per T-103..T-107).
-- Canonical seed inventory per SSOT §8 + MIP §B.1 / §C.1.
-- =====================================================================
--
-- Seed inventory (per SSOT §8 + Docs/specs/contracts/supabase-schema.sql)
--   1. qa_reviewers — Kimal as audio_qa at launch (T-103 territory)
--   2. pronunciation_lexicon (30 medical/physics terms) — T-201 / A-201
--   3. voice_consent_registry initial entries — T-213
-- Only (1) lands now because migration 0001 creates qa_reviewers; the
-- remaining seeds land alongside their respective migrations.

-- ---------------------------------------------------------------------
-- qa_reviewers (T-103 / MIP §B.1)
-- ---------------------------------------------------------------------
-- Kimal solo as audio_qa at launch (SSOT §8 + contract supabase-schema.sql).
-- Idempotent on email so repeated `supabase db reset` cycles are safe.
insert into qa_reviewers (email, name, role)
values ('president@aliennova.com', 'Kimal Honour Djam', 'audio_qa')
on conflict (email) do nothing;
