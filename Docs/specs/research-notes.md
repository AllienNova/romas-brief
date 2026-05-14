---
title: Research Notes — ROMAS Brief
version: 1.0.0
date: 2026-05-14
scope: decision-driving research only
---

# Research Notes — ROMAS Brief

> Each note answers: *what decision does this inform?*

## R-N-001 — Audio loudness target -16 LUFS / -1 dBTP

**Decision informed**: Audio publish gate range (audio-production-pipeline.md:13)

**Finding**: -16 LUFS integrated / -1 dBTP true peak is the de-facto podcast loudness target (Apple Podcasts spec, AES TD1004.1.15-10). The publish CHECK constraint accepts `loudness_lufs BETWEEN -17 AND -15` — a **2 LUFS window** centered on -16 (or equivalently, **±1 LUFS tolerance** around the target). ffmpeg `loudnorm` two-pass typical variance is **±0.5 LUFS**, so the pipeline has **±0.5 LUFS headroom on each side of the target** inside the CHECK window. If the first master measures outside the window, `T-220` (auto-retry twice → mark `skipped`) catches it. Two consecutive out-of-window masters → audio is skipped, article ships without audio per `audio-production-pipeline.md:152`.

**Confidence**: high on target; medium on always-in-window-first-pass (depends on source script dynamic range).

**Cycle-1 critic F-P1-02 resolution**: "2 LUFS window" and "±1 LUFS tolerance" describe the same window from different framings; this note disambiguates them.

**Source**: AES TD1004.1.15-10; Apple Podcasts Connect specs; ffmpeg `loudnorm` filter docs.

## R-N-002 — Article → audio length mapping (145–160 wpm)

**Decision informed**: Article archetype word counts (CLAUDE.md §1) ↔ audio length (audio-production-pipeline.md:16-22).

**Finding**: 145–160 wpm aligns with NPR/podcast professional narration pace. Below 140 wpm sounds soporific; above 165 wpm overwhelms non-native English listeners. Article spoken-word counts (700–850 / 1,000–1,150 / 1,400–1,600) sit inside the band at 5 / 7 / 10 minute targets.

**Confidence**: high.

## R-N-003 — Schema-enforced state machines over app-layer

**Decision informed**: ADR-0006 (audio QA state machine)

**Finding**: For inviolable rules (Rule 6 audio QA gate), DB CHECK constraints survive bypass attempts that an app-layer-only validation does not. The constraint pattern in cms-schema.md:96-103 binds 4 fields in one CHECK — clinical_claims_checked + qa_reviewer + loudness_lufs + transcript_url — making it impossible to flip `audio_status = published` without all 4. This pattern is hard to replicate in app code without race conditions.

**Confidence**: high. Postgres CHECK constraints are durable, race-safe, and audit-friendly.

## R-N-004 — pnpm + Turborepo for monorepo

**Decision informed**: ADR-0001 (hypothesis)

**Finding**: pnpm offers content-addressable storage (no `node_modules` duplication across workspaces), strict dependency hoisting (no phantom deps), and explicit workspace protocol (`workspace:*`). Turborepo provides incremental builds with content-hash caching; matches the 4 Workers + 2 Apps shape well. npm workspaces lacks the disk efficiency; Nx is overkill at 6 packages; single-package would force monolithic deploys.

**Confidence**: medium-high. Revisit if pnpm + Wrangler bundling incompatibilities emerge.

**Sources**: pnpm docs (workspace protocol), Turborepo docs (remote cache + filtering).

## R-N-005 — Cloudflare Workers cron for daily 10:30 UTC ingestion

**Decision informed**: ADR-0003 + wrangler.toml triggers (R-103)

**Finding**: Cloudflare Workers Cron Triggers run as scheduled handlers (`scheduled` export). Cron syntax matches POSIX. Mon-Fri 10:30 UTC = `30 10 * * 1-5`. Free tier supports 5 cron triggers per Worker; paid tier supports more. Watchdog every minute = `* * * * *` (paid tier required for 1-min granularity on Workers Free? — verify).

**Open**: Verify Cloudflare Workers Free tier cron granularity (some docs say 1-min minimum on paid only).

**Confidence**: high on Mon-Fri 10:30 UTC; **medium** on 1-min watchdog tier requirement.

## R-N-006 — 60s revoke SLA achievability

**Decision informed**: F-S-001 + R-211 watchdog

**Finding**: Cloudflare cache-purge by tag is documented as eventually-consistent across the edge; "should complete in under 30s" per Cloudflare docs but no SLA. The 60s SSOT-locked SLA is a conservative bound. Watchdog at 90s gives 30s buffer before alert fires.

**Confidence**: medium. Production load test required pre-launch.

**Source**: Cloudflare Cache API docs; Cloudflare Workers Cache documentation.

## R-N-007 — Whisper large-v3 transcript quality

**Decision informed**: I-07 contract

**Finding**: Whisper large-v3 (released 2023-11) outperforms v2 on technical terminology (radiation oncology drugs, vendor names, modality names). WER ~3–5% on English clinical narration when paired with a pronunciation lexicon for proper nouns. SRT generation supported natively.

**Confidence**: high.

## R-N-008 — Resend over Postmark / Beehiiv

**Decision informed**: ADR-0007 (this session)

**Finding**: Resend offers React-Email templates (matches Next.js stack), one-click unsubscribe (RFC 8058) native, EU region option, programmable webhooks. Postmark is mature but pricier at scale and lacks React-Email native. Beehiiv is a newsletter SaaS (vertical product) — wrong tool for transactional + issue delivery (article URLs change frequently, templates are React components).

**Confidence**: high.

## R-N-009 — Audio archive in private R2 + CDN in public R2

**Decision informed**: ADR-0003 (R2 bucket split)

**Finding**: Two-bucket pattern is Cloudflare's recommended approach for protected-master + public-CDN content. Private bucket holds WAV originals (re-master without re-render), public bucket holds CDN-fronted MP3. Revoke purges only the public bucket; archive retains.

**Confidence**: high.

**Source**: Cloudflare R2 docs (Public Buckets vs Private Buckets).

## R-N-010 — Friday sub-rubric rotation (4-window)

**Decision informed**: friday-read-format.md, R-401

**Finding**: 4 sub-rubrics rotated weekly means each rubric repeats every 4 weeks. `friday_read_predictions.json` should prevent a rubric from repeating within the prior 3 issues. Simple Python/TS lookup; JSON file in R2 archive bucket OK.

**Confidence**: high.

## R-N-011 — openFDA discovery vs FDA 510(k) primary verification

**Decision informed**: Rule 4 + regulatory-analyst.md

**Finding**: openFDA exposes 510(k), De Novo, PMA, and recall data via REST. Its dataset lags the official `accessdata.fda.gov` records by 24–72h. Use openFDA for discovery (fast, filterable); cite the official record as primary source. This is the documented chain (AGENT.md:81-82).

**Confidence**: high.

## R-N-012 — pgTAP for schema-constraint testing

**Decision informed**: ADR-0009 (testing stack)

**Finding**: pgTAP runs TAP-protocol unit tests inside the DB. Best fit for CHECK constraints — tests run against actual Postgres, not a mock. `supabase test db` integrates pgTAP. Coverage target: 100% on the 4 inviolable-rule constraints + RLS policies.

**Confidence**: high.

## R-N-013 — RSS validation: Atom 1.0 + iTunes podcast namespace

**Decision informed**: NFR-010, A-036..A-042

**Finding**: Atom 1.0 (`application/atom+xml`) is preferred over RSS 2.0 for new feeds (better date handling, mandatory IDs). iTunes/podcast namespace is required for `podcast.xml` to appear in Apple Podcasts / Spotify / Pocket Casts. Embargo lint is a custom XSLT/Schematron rule for `conference-brief.xml`.

**Confidence**: high.

**Sources**: RFC 4287 (Atom); Apple Podcasts RSS spec; Podcast Index `podcast:` namespace.

## R-N-014 — Cloudflare Access for /cms route

**Decision informed**: I-03 (CMS authentication)

**Finding**: Cloudflare Access can gate the `apps/cms` Pages project at the edge using email allowlist + One-Time PIN. No app-layer auth code required for the perimeter. Inside the app, Supabase Auth handles row-level identity.

**Confidence**: high.

## R-N-015 — Plausible vs PostHog vs GA4 for reader

**Decision informed**: Tech stack analytics row

**Finding**: Plausible is cookieless, privacy-friendly, EU-hosted option available, $9/mo for 10k MAU. GA4 is free but requires consent banner in EU. PostHog is feature-rich but heavy (cookies + session replay). Plausible matches the editorial brand and the "no cookies" SSOT posture.

**Confidence**: high.

## R-N-016 — HIPAA non-applicability (re-affirmed)

**Decision informed**: Master Strategy §7.1 + NFR-015

**Finding**: ROMAS Brief publishes editorial content based on public primary sources. No PHI is ingested. Therefore not a HIPAA-covered entity nor a business associate. ToS must carry an explicit "No PHI" clause to prevent inadvertent submission via comments/feedback (out of scope at launch — no public submission surface).

**Confidence**: high.

## R-N-017 — Voice clone consent (ElevenLabs + PlayHT TOS)

**Decision informed**: F-S-003 + R-110

**Finding**: ElevenLabs Voice Cloning TOS requires the user to own rights to the voice they clone OR have a signed consent from the voice donor. Commercial use is permitted only on paid tiers with explicit consent on file. PlayHT has analogous terms. A `Docs/voice-consent-registry.md` referencing a signed PDF (or DocuSign envelope ID) is the canonical evidence.

**Confidence**: high. **Action required**: Kimal sign-off pre-M2 close.

**Source**: ElevenLabs Terms of Service §Voice Cloning; PlayHT Terms §Voice Cloning.

## R-N-018 — GDPR posture for EU subscribers

**Decision informed**: NFR-016, F-S-008

**Finding**: EU subscriber emails are personal data. Required: lawful basis (likely consent at signup), DPA with every processor, right-to-erasure endpoint, data minimization (only `email + status + tier_prefs + signup_source`). Cookie-banner avoided by Plausible's cookieless mode.

**Confidence**: high.

## Revision history

| Date | Version | Change |
|---|---|---|
| 2026-05-14 | 1.0.0 | Initial research notes. 18 decision-driving items. |
