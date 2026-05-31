---
adr: 0011
title: Whisper transcription via OpenAI API (with self-hosted Replicate fallback)
status: Proposed (cycle-2 — resolving cycle-1 critic F-P1-03)
date: 2026-05-14
confidence: medium
---

# ADR-0011: Whisper transcription

## Context

`audio-production-pipeline.md:7,57` mandates Whisper large-v3 transcripts for every audio episode. `contracts/supabase-schema.sql:130` enforces `transcript_url IS NOT NULL` at the audio publish gate. Whisper failure therefore BLOCKS audio publish.

Cycle-1 critic flagged (F-P1-03) that no vendor was pinned, no contract existed, and the integration was on the critical path.

## Decision

- **Primary**: **OpenAI Whisper API** (`POST https://api.openai.com/v1/audio/transcriptions`) with `model=whisper-1` (OpenAI's hosted large-v3). Format: SRT + JSON. Auth: `Authorization: Bearer ${OPENAI_API_KEY}`.
- **Fallback**: **Replicate Whisper** (`openai/whisper:large-v3`) — async API, polls until complete. Used when OpenAI fails 3x.
- **Self-hosted later**: re-evaluate if monthly Whisper cost exceeds $200 or if OpenAI's data-retention TOS changes adversely. Self-hosting requires GPU instance (~$40-80/mo on Modal or Replicate cold-start).

Contract written at `docs/specs/contracts/whisper.yaml`.

## Alternatives considered

| Option | Rejection reason |
|---|---|
| **Deepgram** | Strong WER but different model family; lexicon pronunciation tuning would diverge from the ElevenLabs lexicon. |
| **AssemblyAI** | Similar concern; also pricier per minute at ROMAS Wire's volume. |
| **Self-hosted Whisper on Cloudflare Workers AI** | Workers AI supports whisper.large-v3 (`@cf/openai/whisper-large-v3-turbo`) — appealing for single-vendor stack. **Revisit trigger**: lock this as primary once it exits beta with documented WER on clinical narration. Currently still maturing. |
| **No transcript** | Violates audio-production-pipeline.md:154 (transcript URL mandatory). Schema CHECK rejects. Not an option. |

## Consequences

**Positive**:
- OpenAI Whisper API is mature, well-documented, deterministic.
- Replicate fallback adds resilience without architectural complexity.
- Both vendors support SRT output natively.

**Negative**:
- Two-vendor TTS-equivalent for ASR; same operational pattern as ElevenLabs+PlayHT for audio.
- OpenAI data retention: default 30 days for API requests (no training, but stored for abuse review). Document in DPA inventory.
- Cost: ~$0.006/minute at OpenAI; 5-7-10 minute episodes = $0.03–$0.06/episode. At 5 daily episodes × Mon–Fri = ~$1.50/week base. Negligible at launch.

**Neutral**:
- WER on radiation oncology terminology: research-notes.md:R-N-007 cites ~3-5% but methodology was informal. Audio QA reviewer reads the transcript before publish; significant misrecognitions go to `lexicon_proposals` and feed the lexicon. The five-condition publish gate does not enforce WER quality, only `transcript_url IS NOT NULL`.

## Revisit triggers

- OpenAI Whisper API monthly cost > $200
- OpenAI deprecates `whisper-1` (≥6 months notice expected per OpenAI deprecation policy)
- Cloudflare Workers AI `whisper-large-v3-turbo` exits beta with documented clinical WER
- Reviewer reports transcript quality affecting QA cadence
- Data-retention policy changes that conflict with GDPR posture for EU subscribers

## Historical context

Whisper was named in `audio-production-pipeline.md:7,57` from planning-kit inception (2026-05-12) without vendor pinning. The implicit choice was "Whisper large-v3, vendor TBD." Cycle-1 critic surfaced this as a critical-path gap (F-P1-03) because the schema CHECK blocks audio publish on missing transcript URL. Cycle-2 pins OpenAI as primary based on maturity + WER + cost; flags self-hosted Workers AI as the locked-in revisit candidate.
