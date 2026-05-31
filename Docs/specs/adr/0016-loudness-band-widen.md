---
title: ADR-0016 — Loudness publish-gate widen from [-17,-15] to [-18,-14] LUFS
status: Accepted
date: 2026-05-21
deciders: Kimal Honour Djam
supersedes: Cycle-1 F-P1-01 band of [-17,-15] LUFS at the DB publish gate (the 5-condition upgrade itself stands; only the band tolerance changes)
references: SSOT §2 inviolable rule 6; SSOT §4 audio architecture; ADR-0006 (audio QA state machine); Docs/specs/remediation-plan.md R-202; cycle build-2026-05-21 review-synthesis HIGH finding (quality reviewer)
---

# ADR-0016 — Loudness publish-gate widen from [-17,-15] to [-18,-14] LUFS

## Status

**Accepted** (Kimal authorization 2026-05-21 via /team-build approval gate: "Adopt all 13 verbatim from the reviewer" with explicit acknowledgement that this overrides the inviolable-rule-6 band lock and requires an ADR).

## Context

Cycle-1 critic finding F-P1-01 upgraded the `audio_publish_requires_qa` CHECK from a 4-condition to a 5-condition gate. The 5th condition fixed the loudness band at `BETWEEN -17 AND -15` LUFS, treating `-16 LUFS` as the production target and `±1 LUFS` as the acceptable window.

Cycle build-2026-05-21 review-synthesis HIGH finding (from the quality reviewer):

> `loudness_lufs between -17 and -15` is too tight. ElevenLabs/PlayHT output regularly lands at -17.5 to -14.5 after normalize; the spec target (-16 LUFS) is a target, not a range. This DB CHECK will block legitimate publishes at -15.1 or -16.9. Widen to broadcast speech band between -18 and -14 and enforce the tight target in the audio-qa-reviewer agent only.

The reviewer's recommendation surfaces a layered-defense argument: a database CHECK is the wrong layer to enforce a ±1 LUFS production target because it is brittle to upstream pipeline drift, while the agent layer (where the two-pass `loudnorm` measurement runs) is the right layer for the tight target with retry/re-master semantics. The broadcast speech safe band of -18 to -14 LUFS is the conservative DB-level guard that catches truly broken masters without rejecting near-target episodes.

A counter-argument is that widening reverses cycle-1 F-P1-01's tightening. The counter-counter-argument is that F-P1-01 set the band as an inviolable rule, but the band was set without explicit reference to a broadcast-loudness standard or a measured ElevenLabs distribution — the [-17, -15] window was a reasonable first cut, not a fixed requirement.

## Decision

**Widen the DB-layer `audio_publish_requires_qa` CHECK loudness condition from `BETWEEN -17 AND -15` to `BETWEEN -18 AND -14`**, and move the tight [-16 LUFS ± 0.5] production target out of the schema and into the agent layer.

| Layer | Loudness check | Action on out-of-range |
|---|---|---|
| **DB (`audio_publish_requires_qa`)** | `between -18 and -14` | Postgres CHECK rejects with constraint violation. The CMS surfaces a user-friendly error. |
| **audio-production-pipeline** (R-202 two-pass ffmpeg `loudnorm`) | Target `-16 LUFS ± 0.5`; tolerate `±1 LUFS` (`[-17, -15]`) without retry; outside that → re-master once with adjusted `I=-16 TP=-1 LRA=11`; if still outside `[-18, -14]` → mark job `skipped` with reason `loudness_out_of_band` | Pipeline retry + re-master; DB constraint catches the final state. |
| **audio-qa-reviewer agent** | Inline check: `loudness_lufs ∈ [-17, -15]` is "tight target met" (green tick); `[-18, -17) ∪ (-15, -14]` is "wide band met" (amber tick — log + proceed); outside → reviewer cannot approve (DB CHECK will reject anyway). | Reviewer judgment + soft warning. |

The four other inviolable-rule-6 conditions (`clinical_claims_checked`, `qa_reviewer`, `true_peak_dbtp <= -1`, `transcript_url`) are unchanged.

## Consequences

### Positive
- **Layered defense.** The DB is the floor (broken masters fail), the pipeline is the production target (re-master before reviewer sees it), the reviewer is the human judgment layer (taste call on near-target episodes).
- **Eliminates false-positive rejections.** Episodes that land at `-15.1` or `-16.9` are real ROMAS Wire audio that previously would have been blocked by the schema. They now publish with an amber soft-warning rather than a hard reject.
- **Reduces re-master churn.** Pipeline cost (R-202 retry) is reduced for near-target episodes.

### Negative
- **Wider acceptable range at the DB layer.** A determined adversary inserting raw `audio_jobs` rows could push `-17.5 LUFS` audio to `published` without going through the production pipeline. Mitigation: RLS policies (T-113 / 0011_rls_policies.sql) restrict UPDATE of `audio_status` to the `audio_qa` role, and the audio-qa-reviewer agent enforces the tight target. The DB widening is operationally invisible to legitimate flows.
- **Cycle-1 F-P1-01 partial reversal.** The 5-condition upgrade itself stands; only the band tolerance changes. Cycle-1's critic record stays correct.
- **Surface area for propagation.** SSOT, Master-Strategy, Runbook, MIP, product-spec, delivery-plan, test-qa-plan, remediation-plan, design wireframes/user-flows, the cms-schema skill, audio-production-pipeline skill, audio-qa-checklist skill, audio-producer agent, audio-qa-reviewer agent, cms-engineer agent — all carry the band number and all are updated in this cycle.

## Alternatives considered

### Alternative A — Keep [-17, -15] at the DB
**Rejected.** Cycle-1 F-P1-01's tight band is brittle to upstream pipeline drift and rejects legitimate near-target episodes. The reviewer's empirical observation that ElevenLabs/PlayHT output normalize-lands outside [-17, -15] is consistent with public broadcast-loudness measurement literature for speech masters. Hard-rejecting episodes at -16.9 LUFS is operationally undesirable for a daily-cadence editorial product.

### Alternative B — Remove the loudness condition from the DB entirely
**Rejected.** A floor at the DB layer catches the broken-master case (e.g., an audio job written with `loudness_lufs = -8` by a bug or attacker). The CHECK is cheap defense-in-depth.

### Alternative C — Widen further to [-23, -10] (full speech range)
**Rejected.** Too wide for a podcast-spec product. Episodes outside [-18, -14] are genuinely broken (over-normalized, under-mastered, or compressed) and the floor should reject them. The broadcast speech safe band [-18, -14] is the conservative-but-realistic floor.

## Migration

- Canonical contract `Docs/specs/contracts/supabase-schema.sql` updated in lockstep (build-2026-05-21).
- Migration `supabase/migrations/0002_create_audio_jobs.sql` updated in lockstep (the migration is untracked / not yet pushed; in-place amendment is correct).
- All forward-looking spec/skill/agent docs that name the band updated in this cycle (see Negative §3).
- Historical records (cycle-1 critic, smoke-test report dated pre-cycle, agent-memory) NOT updated — they record the prior state and must remain frozen.

## Closing this ADR

This ADR remains Accepted indefinitely. Re-evaluate if the audio-production-pipeline can be re-engineered to hit the tight `[-17, -15]` band reliably (≥99.5% of jobs first-pass), in which case Cycle-1 F-P1-01's narrower window could be reinstated via a follow-up ADR.
