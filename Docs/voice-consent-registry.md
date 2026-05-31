---
title: ROMAS Wire — Voice Operations Registry (formerly Voice Consent Registry)
version: 2.0.0
date: 2026-05-22 (D-032 restructure)
status: Operational record — 3 ElevenLabs Creator-tier voices by tier role per D-032; PlayHT failover voice tracked separately
owner: Kimal Honour Djam (president@aliennova.com)
authority_chain: SSOT v1.2.0 §3 row 9 (D-032 voice architecture) · ADR-0004 (TTS engines) · Docs/ROMAS-Brief-Audio-Architecture.md §2 · D-031 (ElevenLabs tier finding) · D-032 (3-voice architecture)
supersedes: voice-consent-registry.md v1.0.0-template (donor-signature pattern for single Kimal voice clone — superseded by D-032 ElevenLabs Creator-tier ToS reference for 3 stock voices)
---

# Voice Operations Registry — ROMAS Wire

## 0. Purpose

This registry is the **operational record of voices used in ROMAS Wire audio production**. It captures:
- Which 3 ElevenLabs voices are bound to which audio tier
- The ElevenLabs Creator-tier ToS reference (replaces per-donor signed instruments per D-032)
- Per-voice operational metadata (selected date, last verified date, retirement procedure)
- PlayHT failover voice details (separate consent posture — PlayHT requires its own ToS acceptance per ADR-0004)

**D-032 architecture pivot (2026-05-22)**: the prior v1.0.0-template assumed a single Kimal-cloned voice with a signed donor instrument. That path is now **deferred to post-launch revisit**. Day 1 ships with 3 ElevenLabs Creator-tier library voices, by tier role. ElevenLabs commercial use is governed by the Creator-tier ToS (no per-donor signed instrument needed).

The `audio-producer` agent reads this registry at start-of-pipeline. If a voice is marked **RETIRED** (rare; only on ElevenLabs voice removal or a Kimal editorial decision to switch), the agent MUST refuse to use it and fall back to the designated alternate. The PlayHT failover voice has its own consent + retirement procedure in §3.

---

## 1. Active voice IDs

### Voice 1 — Audio Brief + Daily Brief (tier 1+2)

```yaml
voice_id_entry:
  vendor:                elevenlabs
  voice_id:              FILL_REQUIRED  # ElevenLabs voice ID for the "news register" voice
  voice_name:            FILL_REQUIRED  # voice name from ElevenLabs (e.g. "Sarah", "Roger")
  env_var_name:          ELEVENLABS_VOICE_ID_BRIEF
  tier_role:             "tier 1 Audio Brief + tier 2 Daily Brief"
  audio_tier_enum:       audio_brief, daily_brief
  status:                FILL_REQUIRED  # "active" once selected + tested via tools/audio/smoke-test.mjs
  status_updated:        FILL_REQUIRED  # ISO 8601 date
  selected_at:           FILL_REQUIRED  # ISO 8601 date
  selected_by:           Kimal Honour Djam
  selection_rationale:   "Crisp, calm narrator for short-form daily content. Editorial register: news / brief."

  commercial_use:
    license:             ElevenLabs Creator-tier ToS (commercial use included)
    license_url:         https://elevenlabs.io/terms
    license_verified:    FILL_REQUIRED  # ISO 8601 date Kimal verified ToS coverage for ROMAS Wire commercial use
    tier_scope:          audio_brief, daily_brief
    revenue_share:       none (ElevenLabs is a tooling provider, not a content collaborator)

  retirement_procedure:
    triggers:
      - "ElevenLabs removes the voice from the Creator-tier library"
      - "Editorial decision to switch voice (Kimal sign-off in this file)"
      - "Quality regression observed in audio QA flow (rare; document the regression)"
    cascade:
      - "Set status to 'retired' in this file with status_updated = retirement date"
      - "Pick alternate voice from the 9 ElevenLabs Creator-tier defaults"
      - "Update ELEVENLABS_VOICE_ID_BRIEF in Cloudflare Worker Secrets + this file"
      - "Republish: NO retroactive revocation needed — past episodes stay live (the voice was licensed at synthesis time)"
      - "Update CLAUDE.md §6 voice section if the editorial register changes"

  alternate_voice_id:    FILL_REQUIRED  # a second voice ID from the Creator-tier list as documented fallback

  operational_notes:     FILL_REQUIRED  # any voice-specific tuning (stability, similarity_boost recommendations from smoke tests)
```

### Voice 2 — The ROMAS Podcast (tier 3)

```yaml
voice_id_entry:
  vendor:                elevenlabs
  voice_id:              FILL_REQUIRED  # ElevenLabs voice ID for the "podcast register" voice
  voice_name:            FILL_REQUIRED
  env_var_name:          ELEVENLABS_VOICE_ID_PODCAST
  tier_role:             "tier 3 The ROMAS Podcast"
  audio_tier_enum:       podcast
  status:                FILL_REQUIRED
  status_updated:        FILL_REQUIRED
  selected_at:           FILL_REQUIRED
  selected_by:           Kimal Honour Djam
  selection_rationale:   "Deeper voice for 30-60 min weekly deep-dives. Editorial register: long-form analysis / interview-ready."

  commercial_use:
    license:             ElevenLabs Creator-tier ToS
    license_url:         https://elevenlabs.io/terms
    license_verified:    FILL_REQUIRED  # ISO 8601
    tier_scope:          podcast
    revenue_share:       none

  retirement_procedure:
    triggers:
      - "ElevenLabs removes the voice"
      - "Editorial decision to switch voice"
      - "Quality regression observed"
    cascade:
      - "Set status to 'retired'; update env var; republish; no retroactive revocation"

  alternate_voice_id:    FILL_REQUIRED

  operational_notes:     FILL_REQUIRED  # podcast voice may need different loudnorm parameters than brief; document
```

### Voice 3 — Conference Brief + Video Podcast (tier 4+5)

```yaml
voice_id_entry:
  vendor:                elevenlabs
  voice_id:              FILL_REQUIRED  # ElevenLabs voice ID for the "event-paced register" voice
  voice_name:            FILL_REQUIRED
  env_var_name:          ELEVENLABS_VOICE_ID_CONFERENCE
  tier_role:             "tier 4 Conference Brief + tier 5 Video Podcast"
  audio_tier_enum:       conference_brief, video_podcast
  status:                FILL_REQUIRED
  status_updated:        FILL_REQUIRED
  selected_at:           FILL_REQUIRED
  selected_by:           Kimal Honour Djam
  selection_rationale:   "Event-paced voice for conference coverage + future Day-60 video podcast. Editorial register: live-event reporting / hosted interview."

  commercial_use:
    license:             ElevenLabs Creator-tier ToS
    license_url:         https://elevenlabs.io/terms
    license_verified:    FILL_REQUIRED  # ISO 8601
    tier_scope:          conference_brief, video_podcast
    revenue_share:       none

  retirement_procedure:
    triggers:
      - "ElevenLabs removes the voice"
      - "Editorial decision to switch voice"
      - "Quality regression observed"
    cascade:
      - "Set status to 'retired'; update env var; republish; no retroactive revocation"

  alternate_voice_id:    FILL_REQUIRED

  operational_notes:     FILL_REQUIRED
```

---

## 2. ElevenLabs Creator-tier license summary

Per ElevenLabs Creator-tier ToS (verified by Kimal on FILL_REQUIRED):

- **Commercial use of library voices**: PERMITTED. Audio generated with library voices on Creator tier or higher may be used in commercial products including subscription newsletters + podcasts + advertising surfaces.
- **Voice attribution**: NOT REQUIRED for library voices. ROMAS Wire does NOT need to credit ElevenLabs or the voice name in episode metadata. (This differs from some other TTS providers; verify against the current ToS at each ElevenLabs plan change.)
- **Per-voice retention**: voices remain available indefinitely while the Creator tier is active. If subscription lapses, library voices revert to free-tier restrictions and the audio-producer falls into the D-031 free-tier-blocked failure mode.
- **API permission requirement**: production API key MUST carry both `voices_read` AND `text_to_speech` permissions (per D-031).

Re-verify ToS coverage on every ElevenLabs subscription change OR when ElevenLabs sends Terms-update notice. Update the `license_verified` field for each voice entry on re-verification.

---

## 3. PlayHT failover voice (separate consent posture per ADR-0004)

```yaml
voice_id_entry:
  vendor:                playht
  voice_id:              # FILL: PlayHT voice ID for ROMAS failover
  env_var_name:          PLAYHT_ROMAS_VOICE_ID
  status:                # FILL
  status_updated:        # FILL
  selected_at:           # FILL
  selected_by:           Kimal Honour Djam

  commercial_use:
    license:             PlayHT Pro-tier ToS (commercial use; verify at signup)
    license_url:         https://play.ht/terms/
    license_verified:    # FILL

  failover_role:         "Activated when ElevenLabs returns 429 / 5xx three times with exponential backoff (1s / 4s / 16s) per ADR-0004. Single voice covers all tiers (failover does not preserve the 3-voice tier-role distinction; an audible voice change signals the failover to listeners which is acceptable)."

  retirement_procedure:
    triggers:
      - "PlayHT removes the voice"
      - "Editorial decision to switch failover voice"
    cascade:
      - "Set status to 'retired'; update PLAYHT_ROMAS_VOICE_ID in Worker Secrets"
      - "If no alternate PlayHT voice exists, the failover path degrades to 'audio job skipped with skip_reason=tts_failover_exhausted' per Audio Architecture v1.0 §2.1"

  operational_notes:     # FILL
```

---

## 4. Operational checklist — populating an entry

Before flipping `status` to `active` for any voice:

- [ ] Voice ID retrieved from ElevenLabs / PlayHT dashboard
- [ ] Voice name + selection rationale recorded in this file
- [ ] Smoke test passed: `node --env-file=.env tools/audio/smoke-test.mjs` produces ADR-0016 GREEN or AMBER verdict for an article archetype that maps to this tier
- [ ] Voice tested in production-realistic conditions (full 10-beat script not just 1 sentence)
- [ ] Env var populated in Cloudflare Worker Secrets via `wrangler secret put ELEVENLABS_VOICE_ID_BRIEF` (or equivalent)
- [ ] ElevenLabs / PlayHT ToS verified for commercial use on the active tier; `license_verified` field updated
- [ ] Alternate voice ID identified for the retirement cascade

---

## 5. Day-1 launch readiness gate

Before Day 1 (per Launch Arc Plan):

- [ ] All 3 ElevenLabs voices selected + smoke-tested + `status: active` in this file
- [ ] PlayHT failover voice selected + smoke-tested + `status: active` in this file
- [ ] ElevenLabs Creator-tier subscription confirmed active (rotation reminder per SECRETS.md §3)
- [ ] PlayHT Pro-tier subscription confirmed active
- [ ] All 4 env vars populated in production Worker Secrets
- [ ] At least one audio episode produced with each voice (pre-launch backlog per Launch Arc Plan §3)

---

## 6. Cross-references

- `Docs/ROMAS-Brief-Audio-Architecture.md` §2.1 — 3-voice tier-role architecture (canonical)
- `Docs/build/decision-log.md` D-031 — ElevenLabs free-tier API empirical finding
- `Docs/build/decision-log.md` D-032 — 3-voice tier-role architecture decision
- `Docs/specs/adr/0004-tts-elevenlabs-primary-playht-failover.md` — TTS engine selection (still current; voice-clone-specific language updated by D-032)
- `.claude/agents/audio-producer.md` — agent that reads this registry; needs update to consume tier-role env var pattern (R-201 / M2)
- `SECRETS.md` §2 — env var inventory + rotation policy
- `tools/audio/smoke-test.mjs` — uses `pickVoiceEnv(archetype)` to select the tier-appropriate env var

---

## 7. Revision history

| Version | Date | Change |
|---|---|---|
| 1.0.0-template | 2026-05-22 (morning) | Initial template assuming single Kimal voice clone + per-donor signed instrument pattern. |
| 2.0.0 | 2026-05-22 (afternoon) | D-032 restructure: 3 ElevenLabs Creator-tier voices by tier role replace single Kimal clone. ElevenLabs ToS reference replaces per-donor signed instruments. Kimal clone deferred to post-launch revisit. PlayHT failover entry preserved with its own ToS reference. |
