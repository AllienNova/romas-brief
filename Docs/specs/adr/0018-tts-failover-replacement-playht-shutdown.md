# ADR-0018 — TTS failover replacement after PlayHT shutdown

- **Status:** Accepted (Q-F closed 2026-06-03 by Kimal — **Jellypod** failover)
- **Date:** 2026-05-30 · accepted 2026-06-03
- **Supersedes:** the PlayHT half of ADR-0004 (ElevenLabs primary + PlayHT failover)
- **Confidence:** high (vendor chosen; Jellypod API grounded against docs 2026-06-03)
- **Deciders:** Kimal Honour Djam

## Context

ADR-0004 set **ElevenLabs primary + PlayHT failover** for TTS. **PlayHT was acquired by Meta (July 2025) and permanently shut down on 2025-12-31** — accounts, voice clones, and API access deleted, no migration path (reported by Kimal 2026-05-30). The failover provider no longer exists.

Impact at HEAD=dd7f0e0:
- `workers/audio-producer/src/index.ts` — PlayHT failover path (the `playhtTts` calls, retry/backoff) is dead code calling a terminated API.
- Env vars `PLAYHT_API_KEY`, `PLAYHT_USER_ID`, `PLAYHT_ROMAS_VOICE_ID` (`.env.example`) are obsolete.
- `ship-execution-plan.md` SHIP-14 (PlayHT 1→3 retry policy), provisioning P-03, FOUNDERS-BOARD P-03.

Without a failover, a single ElevenLabs outage halts all audio on a Mon–Fri daily-deadline product.

## Decision (accepted 2026-06-03)

Replace PlayHT with **Jellypod** as the failover provider for the single-narrator tiers
(Tier 1 Audio Brief, Tier 2 Daily Brief, Tier 4 Conference Brief). Jellypod is already
adopted for Tier-3 podcast generation (D-POD-1, `Docs/specs/podcast-video-pipeline.md`),
so this **consolidates audio onto two vendors** — ElevenLabs (primary single-narrator) +
Jellypod (Tier-3 podcast **and** the failover) — with one new credential, one billing
relationship, and zero net-new vendor onboarding.

Grounded against `jellypod.com/docs/api` (2026-06-03): base `https://api.jellypod.com/v1`,
Bearer `sk_…`. Failover flow on ElevenLabs failure: submit the same 10-beat script as a
**single-host** episode via `POST /episodes/generate`, **poll** `GET /episodes/{id}`, then
download the MP3.

**Integration shape differs from a synchronous TTS-bytes vendor — recorded honestly:**
- Jellypod is **asynchronous** (generate → poll), not a synchronous `text → bytes` call,
  so failover adds generation + poll latency vs an instant TTS-bytes vendor.
- Output is **MP3**, not WAV/PCM. The existing ffmpeg loudnorm path + Whisper transcription
  consume MP3 fine (the CDN tier already emits MP3), so downstream is unchanged.
- Generation is **credit-billed by duration** — failover consumes credits; acceptable
  because failover is rare and the article still ships audio-less if both engines fail.

These trade-offs are accepted in exchange for vendor consolidation. **Cartesia remains the
documented alternative** if a low-latency *synchronous* failover is later required (see
Alternatives) — switching is a localized change to the failover call.

New env vars: `JELLYPOD_API_KEY`, `JELLYPOD_PODCAST_ID` (added), plus
`JELLYPOD_FAILOVER_HOST_ID` (the single-host voice used for brief failover). Retain the
existing failover retry/backoff semantics and the "on exhaustion → `audio_status='skipped'`
+ `skip_reason='tts_failover_exhausted'`" behavior unchanged.

## Alternatives considered

| Option | API verified | Pros | Cons | Verdict |
|---|---|---|---|---|
| **Jellypod** | ✅ `api.jellypod.com/v1` (docs 2026-06-03) | Vendor consolidation (same vendor as Tier-3 podcast → one key/bill/onboarding); strong conversational + single-host quality; MP3 the pipeline already handles | Async (generate→poll, not sync bytes); credit-billed; MP3 not WAV | **CHOSEN (2026-06-03)** — consolidation outweighs the async latency for a rare failover |
| **Cartesia** | ✅ `api.cartesia.ai/tts/bytes`, sonic-3.5 | Low latency, strong quality, WAV/PCM bytes, clean versioned API (stability signal), well-funded API-native | Newer brand; net-new vendor | **Documented alternative** — switch to this if a low-latency *synchronous* failover is later required |
| Fish Audio | ✅ `api.fish.audio/v1/tts`, s2-pro/s1 | ~80% cheaper/char, WAV/PCM/Opus, voice cloning via `reference_id` | More bulk-oriented; quality for a clinical authoritative read unverified | Strong cost alternative |
| Mistral Voxtral | (open-weight, in AlienNova stack) | Open-weight, EU residency, ~$0.016/1k chars | Fewer languages (9); on-prem ops overhead; quality for narration unverified | If EU on-prem ever required |
| ElevenLabs-only (drop failover) | n/a | Zero integration work | Single-vendor risk on a daily-deadline product; an outage halts audio | Acceptable only as a temporary Day-1 posture with manual fallback |
| AI TextSpeak Pro / Murf | not verified | flat-rate / e-learning | not verified against this pipeline | Not pursued |

## Consequences

- **Positive:** restores TTS redundancy; consolidates audio onto two vendors (ElevenLabs + Jellypod) — one new credential, one billing relationship; Jellypod is the same vendor already chosen for Tier-3 (D-POD-1), so no extra onboarding.
- **Negative:** the failover path is reworked to Jellypod's **async generate→poll** shape (not a sync TTS-bytes call); failover latency is higher and consumes credits; ADR-0004 marked superseded for the PlayHT clause.
- **Migration:** SHIP-14 acceptance updated — "failover submits a single-host Jellypod episode on ElevenLabs failure, polls for the MP3; exhaustion → `audio_status='skipped'`". `JELLYPOD_*` env vars replace the removed `PLAYHT_*`.

## Revisit triggers

- Cartesia pricing/availability change, or another acquisition event (the PlayHT lesson — prefer API-native, independently-funded vendors).
- If Q-B selects LATAM Day-1, re-check the failover provider's language coverage for ES/PT.
- Day-30 audio-volume review: confirm failover throughput for the ~50-episode Day-1 inventory.

## Q-F — CLOSED 2026-06-03

**Q-F (resolved):** failover provider = **Jellypod**. Status flipped to Accepted; env vars
updated (`JELLYPOD_API_KEY` / `JELLYPOD_PODCAST_ID` / `JELLYPOD_FAILOVER_HOST_ID` replace the
removed `PLAYHT_*`); SHIP-14 acceptance reworded to the async single-host failover. Cartesia
retained as the documented synchronous alternative. Rationale: vendor consolidation with the
Tier-3 podcast engine (D-POD-1) — see Decision.
