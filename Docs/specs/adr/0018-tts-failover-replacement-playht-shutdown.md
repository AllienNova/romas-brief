# ADR-0018 — TTS failover replacement after PlayHT shutdown

- **Status:** Proposed (pending Q-F decision by Kimal)
- **Date:** 2026-05-30
- **Supersedes:** the PlayHT half of ADR-0004 (ElevenLabs primary + PlayHT failover)
- **Confidence:** medium (vendor APIs verified current; final vendor choice pending)
- **Deciders:** Kimal Honour Djam

## Context

ADR-0004 set **ElevenLabs primary + PlayHT failover** for TTS. **PlayHT was acquired by Meta (July 2025) and permanently shut down on 2025-12-31** — accounts, voice clones, and API access deleted, no migration path (reported by Kimal 2026-05-30). The failover provider no longer exists.

Impact at HEAD=dd7f0e0:
- `workers/audio-producer/src/index.ts` — PlayHT failover path (the `playhtTts` calls, retry/backoff) is dead code calling a terminated API.
- Env vars `PLAYHT_API_KEY`, `PLAYHT_USER_ID`, `PLAYHT_ROMAS_VOICE_ID` (`.env.example`) are obsolete.
- `ship-execution-plan.md` SHIP-14 (PlayHT 1→3 retry policy), provisioning P-03, FOUNDERS-BOARD P-03.

Without a failover, a single ElevenLabs outage halts all audio on a Mon–Fri daily-deadline product.

## Decision (proposed)

Replace PlayHT with **Cartesia** as the failover provider. Different vendor than the ElevenLabs primary (the point of a failover), API-first, returns WAV/PCM bytes the existing ffmpeg loudnorm path consumes directly.

Verified current (2026-05-30, official docs):
- **Cartesia** — `POST https://api.cartesia.ai/tts/bytes`; auth `Authorization` Bearer or API key `sk_car_...` (keys at https://play.cartesia.ai/keys); output RAW/WAV/MP3; models `sonic-3.5` / `sonic-3` / `sonic-latest`; required header `Cartesia-Version: 2026-03-01`.

New env vars (if Cartesia): `CARTESIA_API_KEY`, `CARTESIA_VOICE_ID`. Retain the existing failover retry/backoff semantics (3 attempts, 2s/8s/30s) and the "on exhaustion → `audio_status='skipped'` + `skip_reason`" behavior unchanged.

## Alternatives considered

| Option | API verified | Pros | Cons | Verdict |
|---|---|---|---|---|
| **Cartesia** | ✅ `api.cartesia.ai/tts/bytes`, sonic-3.5 | Low latency, strong quality, WAV/PCM bytes, clean versioned API (stability signal), well-funded API-native | Newer brand | **Recommended default** |
| Fish Audio | ✅ `api.fish.audio/v1/tts`, s2-pro/s1 | ~80% cheaper/char, WAV/PCM/Opus, voice cloning via `reference_id` | More bulk-oriented; quality for a clinical authoritative read unverified | Strong cost alternative |
| Mistral Voxtral | (open-weight, in AlienNova stack) | Open-weight, EU residency, ~$0.016/1k chars | Fewer languages (9); on-prem ops overhead; quality for narration unverified | If EU on-prem ever required |
| ElevenLabs-only (drop failover) | n/a | Zero integration work | Single-vendor risk on a daily-deadline product; an outage halts audio | Acceptable only as a temporary Day-1 posture with manual fallback |
| AI TextSpeak Pro / Murf | not verified | flat-rate / e-learning | not verified against this pipeline | Not pursued |

## Consequences

- **Positive:** restores TTS redundancy; Cartesia/Fish both emit WAV/PCM so the loudnorm + R2 + Whisper pipeline downstream is unchanged.
- **Negative:** rework of the failover code path + new credential (P-03 changes vendor); ADR-0004 must be marked superseded for the PlayHT clause.
- **Migration:** SHIP-14 acceptance updated — "failover calls the chosen provider once on ElevenLabs failure; exhaustion → skipped" (provider-agnostic).

## Revisit triggers

- Cartesia pricing/availability change, or another acquisition event (the PlayHT lesson — prefer API-native, independently-funded vendors).
- If Q-B selects LATAM Day-1, re-check the failover provider's language coverage for ES/PT.
- Day-30 audio-volume review: confirm failover throughput for the ~50-episode Day-1 inventory.

## Open question to close this ADR

**Q-F:** Pick the failover provider — **Cartesia (recommended)** / Fish Audio (cheaper) / ElevenLabs-only-for-Day-1 (defer failover). On decision, flip Status → Accepted and update env vars + SHIP-14.
