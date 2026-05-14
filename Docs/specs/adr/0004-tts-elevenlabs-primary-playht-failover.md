# ADR-0004 — TTS: ElevenLabs Primary + PlayHT Failover

| Field | Value |
|---|---|
| Status | Accepted (retroactive — CLAUDE.md §7) |
| Date | 2026-05-14 |
| Confidence | High |
| Deciders | Kimal Honour Djam |
| Sources | CLAUDE.md §5 §7; `.claude/skills/audio-production-pipeline.md` (voice spec, failover logic, loudness) |

---

## Context

Every published article generates an audio version under the ROMAS Clinical Narrator voice before it can reach `audio_status = published`. The voice must convey clinical authority — mispronounced drug names, acronyms, or dose values (e.g., "Gy", "SBRT", "BED/EQD2") erode the trust that ROMAS Brief is built on. This is not a generic podcast use case.

Requirements:

- Custom voice clone (ROMAS Clinical Narrator identity, not a stock voice).
- Pronunciation lexicon support (SSML or phoneme substitution) for clinical terminology.
- Loudness target: -16 LUFS integrated, -1 dBTP true peak (audio-production-pipeline.md:13).
- Pace: 145–160 wpm.
- Failover path must preserve voice identity — a generic fallback voice would break brand consistency.
- Single-vendor dependency on TTS is a service-availability risk for a daily-publish operation.

---

## Decision

Use **ElevenLabs** as the primary TTS engine with **PlayHT** as the configured failover.

- ElevenLabs hosts the ROMAS Clinical Narrator custom voice; referenced via `ELEVENLABS_ROMAS_VOICE_ID`.
- PlayHT hosts a cloned voice for failover; referenced via `PLAYHT_ROMAS_VOICE_ID`.
- Failover logic (audio-production-pipeline.md:92-97): 3 retries on ElevenLabs (exponential backoff 1s/4s/16s) → fall through to PlayHT on 429, 5xx, or timeout → if PlayHT also fails, `audio_status = skipped`, article ships without audio.
- `voice_engine_used` is logged in `audio_jobs` on every job — voice swaps are auditable.
- Neither voice swap happens mid-issue silently. Failover is logged.

---

## Alternatives Considered

### Azure Cognitive Services TTS (Neural)

Rejected for primary. Azure's Neural voices are high quality and support SSML with phoneme substitution. However, Azure does not currently support custom voice cloning at the same fidelity level as ElevenLabs for a monologue clinical narrator style. The stock "DavisNeural" or "JasonNeural" voices would not carry the ROMAS Clinical Narrator brand identity. Azure remains a viable tertiary fallback if both ElevenLabs and PlayHT are simultaneously unavailable — not configured at launch.

### Google Cloud Text-to-Speech (WaveNet / Neural2 / Studio)

Rejected for primary. Google Studio voices are high quality but custom voice cloning (via Google's Custom Voice program) has a longer onboarding path and a higher minimum commitment than ElevenLabs. The pronunciation dictionary is SSML-based and less flexible for rapid lexicon expansion. Ruled out for the failover slot because PlayHT's cloning fidelity better preserves voice identity.

### OpenAI TTS (tts-1, tts-1-hd)

Rejected. OpenAI TTS does not support custom voice cloning — only stock voices (alloy, echo, fable, onyx, nova, shimmer). A stock voice cannot carry the ROMAS Clinical Narrator identity. Loudness control is also not available at the API level; post-processing would still be required. Not viable for either primary or failover.

### Single-vendor (ElevenLabs only, no failover)

Rejected. ElevenLabs has experienced service degradations that exceed the 30-minute production window for audio. With Mon–Fri daily publish, a single-vendor failure blocks audio for that issue. The `audio_status = skipped` path allows the article to ship without audio, but maximizing audio availability requires a configured failover. PlayHT clone fidelity is sufficient to maintain voice identity under failover conditions.

---

## Consequences

**Positive**
- Voice identity is preserved across both primary and failover — ROMAS Clinical Narrator sounds consistent to listeners even when failover activates.
- Lexicon proposals (`.claude/skills/cms-schema.md` `lexicon_proposals` table) feed into both ElevenLabs SSML and PlayHT phoneme annotations — one lexicon, two engines.
- Loudness normalization (ffmpeg two-pass loudnorm) is engine-agnostic — same pipeline step regardless of which TTS produced the raw audio.
- `voice_engine_used` logging enables post-hoc quality audits to identify episodes that used failover.

**Negative**
- Two TTS vendor relationships to maintain (billing, API keys, voice model updates). When ElevenLabs releases an updated voice model, the PlayHT clone may lag in fidelity parity.
- Pronunciation consistency between ElevenLabs and PlayHT for edge-case clinical terms (proprietary names, Japanese institutional names) will diverge over time as each vendor's model evolves. The lexicon `ssml` and `spoken` fields must be maintained for both renderers.
- If ElevenLabs deprecates the custom voice ID referenced by `ELEVENLABS_ROMAS_VOICE_ID`, re-cloning and re-seeding the `qa_reviewers` seed row is required.

**Neutral**
- Whisper large-v3 transcript generation is independent of TTS engine — runs on the output MP3 regardless of which engine produced it.
- Pre-roll and post-roll are text-injected into the script before TTS generation, not spliced as audio segments — no engine-specific handling required.

---

## Revisit Triggers

- ElevenLabs raises per-character pricing to a level that makes 5 daily articles × 5 days × 52 weeks unsustainable at the current plan tier — evaluate Azure Neural Custom Voice or Google Studio Custom at that point.
- A new TTS vendor achieves demonstrably superior clinical terminology pronunciation (FDA/drug names, LINAC acronyms, dose units) in independent testing by the physics-reviewer subagent.
- PlayHT changes its voice cloning API in a breaking way and fidelity of the failover voice degrades materially (detectable by A/B listener test).

---

## Historical Context

The ElevenLabs-primary + PlayHT-failover pattern was specified in `audio-production-pipeline.md:9-11` from planning-kit inception (2026-05-12). Failover logic (3 retries 1s/4s/16s → PlayHT; on PlayHT fail → skip) was documented at lines 91-97 of the same skill on the same date. No alternative TTS vendor was compared at decision time — ElevenLabs and PlayHT were named because both support voice cloning, and the resilience pattern is the audio-production analog of the schema-enforced QA gate elsewhere in the system (never single-vendor on a critical path). The retroactive ratification here is honest: voice clone fidelity matters more than headline WPM stats for a clinical narrator, and only ElevenLabs and PlayHT support that primary feature at this quality tier. Azure / Google / OpenAI TTS lack matching voice-clone capability or commercial-use voice-clone licensing.

*Accepted retroactively 2026-05-14 per CLAUDE.md §5 and §7. Voice IDs confirmed in audio-production-pipeline.md env vars section. Historical Context added cycle-2 per critic F-P1-05.*
