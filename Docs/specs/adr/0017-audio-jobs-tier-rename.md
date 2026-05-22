---
title: ADR-0017 — Rename `audio_jobs.tier` → `audio_jobs.audio_tier`
status: Accepted
date: 2026-05-21
deciders: Kimal Honour Djam
supersedes: implicit shared `tier` column name across articles + audio_jobs
references: SSOT §4 (4-tier audio + Tier 5 video); ADR-0005 (RSS four-tier feeds); cycle build-2026-05-21 review-synthesis LOW finding (architecture reviewer)
---

# ADR-0017 — Rename `audio_jobs.tier` → `audio_jobs.audio_tier`

## Status

**Accepted** (Kimal authorization 2026-05-21 via /team-build approval gate: "Adopt all 13 verbatim from the reviewer").

## Context

The canonical schema named two columns identically:
- `articles.tier` — editorial edition enum: `('daily', 'friday_read', 'conference')`
- `audio_jobs.tier` — audio product enum: `('audio_brief', 'daily_brief', 'podcast', 'conference_brief', 'video_podcast')`

The two columns carry entirely different enumerations but share a name. Cycle build-2026-05-21 architecture reviewer flagged the collision as a LOW maintainability finding:

> Both named `tier`, different enums (`conference` vs `conference_brief`). The naming similarity will cause confusion when joining or filtering across tables. A column rename on one side — e.g., `audio_jobs.audio_tier` or `articles.edition` — would disambiguate.

A join across the two tables (e.g., "for every article in tier=conference, find the audio_jobs row in tier=conference_brief") becomes ambiguous in code review unless every reference is fully qualified. The cost grows as more callers join the tables (RSS publishers per ADR-0005, CMS QA UI per T-209, reader surface filters).

## Decision

Rename `audio_jobs.tier` to `audio_jobs.audio_tier`. Keep `articles.tier` unchanged (it is the more semantic name in the editorial domain — "Friday Read tier", "conference tier" — and the historical surface area is wider).

| Object | Old | New |
|---|---|---|
| Column | `audio_jobs.tier` | `audio_jobs.audio_tier` |
| CHECK constraint | inline `tier in (…)` | inline `audio_tier in (…)` |
| Partial index | `audio_jobs_tier_published on (tier, audio_status)` | `audio_jobs_tier_published on (audio_tier, audio_status)` (name unchanged for now — see Consequences) |
| Unique index (new in A6) | `audio_jobs_article_tier_uniq on (article_id, audio_tier)` | (new index, ships under final name) |

## Consequences

### Positive
- **Joins are self-documenting.** `articles a JOIN audio_jobs j ON j.article_id = a.id WHERE a.tier = 'conference' AND j.audio_tier = 'conference_brief'` reads correctly without column qualification.
- **Future onboarding cost lower.** New contributors don't have to remember which `tier` is which.
- **Aligns with the SSOT vocabulary.** SSOT §4 consistently says "audio tier" when referring to the audio product enum.

### Negative
- **Surface-area updates.** Every doc/skill/agent reference to `audio_jobs.tier` needs updating in this cycle:
  - `Docs/specs/test-qa-plan.md` A-056
  - `Docs/specs/adr/0005-rss-four-tier-feeds.md` table + paragraph
  - `Docs/qa/performance-report.md` pgTAP-coverage row
  - `.claude/skills/cms-schema.md` example DDL
- **Index name kept (`audio_jobs_tier_published`).** The index name doesn't say `audio_tier` — historical convenience. Acceptable; the index name is internal-only and never appears in agent prompts or spec docs.
- **Migration is a column rename of an unpublished migration.** Migration `0002_create_audio_jobs.sql` is untracked / not yet pushed; in-place amendment is correct. If the migration had been applied to any remote DB, this would require an `ALTER TABLE audio_jobs RENAME COLUMN tier TO audio_tier` migration; it doesn't because the migration is pre-push.

## Alternatives considered

### Alternative A — Rename `articles.tier` to `articles.edition` instead
**Rejected.** `articles.tier` is the more frequently referenced column (every publish event, every RSS publisher per-tier filter, every reader surface). Renaming it forces a wider rewrite across the editorial layer.

### Alternative B — Keep both as `tier` and rely on table qualification
**Rejected.** The architecture reviewer's argument that join confusion grows as the codebase expands is sound. Cost of a one-time rename now is lower than the persistent cost of disambiguation in every join.

### Alternative C — Defer the rename to a post-launch cycle
**Rejected.** Cheaper to land now while no consumers exist than later when worker code references the column.

## Migration

- Canonical contract `Docs/specs/contracts/supabase-schema.sql` updated in lockstep (build-2026-05-21).
- Migration `supabase/migrations/0002_create_audio_jobs.sql` updated in lockstep (untracked / pre-push; in-place amendment).
- Surface area docs updated in this cycle (Negative §1).

## Closing this ADR

Accepted indefinitely. Future schema additions touching audio products MUST use `audio_tier` (not `tier`) as the column name.
