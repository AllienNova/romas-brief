---
title: ROMAS Brief — Voice Consent Registry
version: 1.0.0-template
date: 2026-05-22 (template authored; entries to be executed by Kimal)
status: TEMPLATE — placeholders to be filled and signed before any voice-cloned audio publishes
owner: Kimal Honour Djam (president@aliennova.com)
authority_chain: SSOT v1.2.0 §2 inviolable rule 6 (no audio without QA) · ADR-0004 (TTS engines) · Docs/ROMAS-Brief-Audio-Architecture.md §2.2 (voice consent) · R-110 (remediation-plan M1) · R-213 (audio-producer reads this registry; consent withdrawal cascades to voice ID disable + fallback)
supersedes: implicit pre-launch gate (no formal instrument prior to this file existing)
---

# Voice Consent Registry — ROMAS Brief

## 0. Purpose

This registry is the **canonical record of voice-cloning consent for every voice ID used in ROMAS Brief audio production**. It is a legal instrument — fillable but BINDING once signed by all parties named in §3 of each entry.

The `audio-producer` agent (per `.claude/agents/audio-producer.md` + R-213) reads this registry at start-of-pipeline. If a voice ID listed in the environment variables (`ELEVENLABS_ROMAS_VOICE_ID`, `PLAYHT_ROMAS_VOICE_ID`) is marked **WITHDRAWN** in this registry, the agent MUST:

1. Refuse to use that voice ID for new audio generation.
2. Fall back to the designated fallback voice ID (see §4 of each entry).
3. Log the substitution with `voice_engine_used` set to whichever vendor handled the fallback.
4. Continue the publish workflow without interruption — the article still ships using the fallback.
5. Trigger the revocation cascade for any **already-published** audio that used the withdrawn voice ID (see §5 of each entry).

This file does NOT replace the executed legal instrument (e.g., a signed PDF held by Kimal in 1Password or with legal counsel). This file IS the operational record the audio-producer agent reads. Both must agree.

---

## 1. Active voice IDs (template — fill before first use)

For each voice ID in production use, complete the entry below. Add a new entry per voice ID. Never delete entries — mark withdrawn instead (§3 status field).

### Entry template

```yaml
voice_id_entry:
  vendor:                # "elevenlabs" | "playht"
  voice_id:              # the vendor-specific voice identifier (e.g. "abc123def456")
  env_var_name:          # which env var holds this ID (e.g. "ELEVENLABS_ROMAS_VOICE_ID")
  status:                # "active" | "withdrawn" | "expired"
  status_updated:        # ISO 8601 date of last status change

  donor:
    legal_name:          # voice donor's legal name as it appears on their government ID
    role:                # voice donor's role at AllienNova (e.g. "Founder", "Editor-in-Chief", "Contractor")
    contact_email:       # donor's primary contact email
    contact_phone:       # donor's primary contact phone (E.164 format)

  recording:
    session_date:        # ISO 8601 date of recording session
    session_location:    # physical location or "remote"
    sample_minutes:      # total minutes of audio recorded for the clone
    sample_storage:      # where the raw recording is archived (e.g. "R2 romas-audio-archive/voice-source/{voice_id}.wav")

  commercial_use_scope:
    duration:            # "indefinite" | ISO 8601 end date
    geographic:          # "worldwide" | comma-separated ISO 3166-1 alpha-2 codes
    tier_scope:          # which audio tiers may use this voice — comma-separated from Audio Architecture v1.0 §1 (e.g. "audio_brief, daily_brief, podcast, conference_brief, video_podcast")
    revenue_share:       # "none" | percentage (e.g. "0.5%") | flat-fee description
    attribution_required: # "yes" | "no" — does ROMAS Brief credit the donor in episode metadata?

  withdrawal_procedure:
    notice_period:       # how much advance notice the donor must give before withdrawal takes effect (e.g. "7 days", "immediate")
    withdrawal_method:   # how the donor formally withdraws (e.g. "signed email to president@aliennova.com")
    cascade:
      - "Set status to 'withdrawn' in this file with status_updated = withdrawal date"
      - "Disable voice ID in vendor dashboard (ElevenLabs UI → Voice Library → Delete; PlayHT UI → Clones → Archive)"
      - "Trigger revocation cascade for all audio_jobs rows where voice_engine_used = this vendor AND voice_id = this id AND audio_status = 'published'"
      - "Switch audio-producer pipeline to fallback voice ID (see fallback section below)"
      - "Audit log: revocations table entry per article + cdn-purge-watchdog confirmation within 60s SLA"

  fallback_voice_id:     # the voice ID the audio-producer falls back to if THIS voice is withdrawn
                         # (typically a standard ElevenLabs voice; see ADR-0004 for the standard library)

  signatures:
    donor_signature:     # donor's signature (typed name + date or paste signed-PDF reference)
    signed_at:           # ISO 8601 timestamp
    aliennova_signer:    # ROMAS Brief authorized signer (legal_name + role)
    aliennova_signed_at: # ISO 8601 timestamp
    witness:             # optional — third-party witness if required by jurisdiction
    witness_signed_at:   # optional
    instrument_storage:  # where the signed PDF lives (e.g. "1Password vault 'ROMAS legal' → item 'voice-consent-{donor.legal_name}'")
```

---

## 2. ROMAS Clinical Narrator — Kimal (TEMPLATE; fill before first audio publish)

This is the **primary voice clone** for ROMAS Brief per CLAUDE.md §6 and Audio Architecture v1.0 §2.1.

```yaml
voice_id_entry:
  vendor:                elevenlabs
  voice_id:              # FILL: ElevenLabs voice ID from your account
  env_var_name:          ELEVENLABS_ROMAS_VOICE_ID
  status:                # FILL: "active" once recorded + cloned + tested
  status_updated:        # FILL: ISO 8601 date

  donor:
    legal_name:          Kimal Honour Djam
    role:                Founder / Editor-in-Chief, AllienNova
    contact_email:       president@aliennova.com
    contact_phone:       # FILL: E.164 format

  recording:
    session_date:        # FILL: ISO 8601
    session_location:    # FILL: e.g. "Home studio, Bear DE" or "remote"
    sample_minutes:      # FILL: total minutes recorded
    sample_storage:      # FILL: R2 path

  commercial_use_scope:
    duration:            indefinite
    geographic:          worldwide
    tier_scope:          audio_brief, daily_brief, podcast, conference_brief, video_podcast
    revenue_share:       none  # Kimal is donor + owner; no separate revenue allocation
    attribution_required: no   # Kimal is the editorial owner; not separately credited

  withdrawal_procedure:
    notice_period:       immediate
    withdrawal_method:   self-administered (Kimal is sole signer for own voice)
    cascade:
      - "Set status to 'withdrawn' in this file"
      - "Disable voice ID in ElevenLabs Voice Library"
      - "Trigger revocation cascade for all currently-published audio using this voice ID"
      - "Switch to fallback_voice_id below"

  fallback_voice_id:     # FILL: ElevenLabs standard voice ID (e.g. "21m00Tcm4TlvDq8ikWAM" Rachel, or your preferred standard)

  signatures:
    donor_signature:     Kimal Honour Djam
    signed_at:           # FILL: ISO 8601 when you sign
    aliennova_signer:    Kimal Honour Djam (acting as authorized signer for AllienNova)
    aliennova_signed_at: # FILL: ISO 8601
    witness:             # optional
    witness_signed_at:   # optional
    instrument_storage:  1Password vault "ROMAS legal" → item "voice-consent-kimal" (FILL when populated)
```

---

## 3. PlayHT failover voice (TEMPLATE; fill before R-201 audio pipeline ships)

ADR-0004 mandates PlayHT as the failover TTS engine. The voice clone donor at PlayHT may differ from the ElevenLabs donor — even if it's the same person (Kimal), the consent is separate because PlayHT is a separate processor under different ToS + DPA.

```yaml
voice_id_entry:
  vendor:                playht
  voice_id:              # FILL: PlayHT voice ID from your account
  env_var_name:          PLAYHT_ROMAS_VOICE_ID
  status:                # FILL: "active" once recorded + cloned + tested
  status_updated:        # FILL: ISO 8601 date

  donor:
    legal_name:          # FILL: usually Kimal Honour Djam (same as §2) — but verify independently
    role:                # FILL
    contact_email:       # FILL
    contact_phone:       # FILL

  recording:
    session_date:        # FILL — may differ from ElevenLabs session
    session_location:    # FILL
    sample_minutes:      # FILL — PlayHT typically needs ~30 sec to 2 min
    sample_storage:      # FILL: R2 path

  commercial_use_scope:
    duration:            # FILL — recommend matching ElevenLabs scope
    geographic:          # FILL
    tier_scope:          # FILL — same as §2 unless deliberately scoped narrower
    revenue_share:       # FILL
    attribution_required: # FILL

  withdrawal_procedure:
    notice_period:       # FILL
    withdrawal_method:   # FILL
    cascade:
      - "Set status to 'withdrawn' in this file"
      - "Archive voice ID in PlayHT Clones UI"
      - "Trigger revocation cascade for all currently-published audio where voice_engine_used = 'playht' AND voice_id = this id"
      - "If ElevenLabs voice (§2) is also withdrawn, audio production halts — fall back to standard ElevenLabs voice + log degraded state. If only PlayHT is withdrawn, failover stops being available; ElevenLabs solo with documented risk per cycle-1 H-12."

  fallback_voice_id:     # FILL: standard PlayHT voice OR explicit "halt PlayHT pathway" instruction

  signatures:
    donor_signature:     # FILL
    signed_at:           # FILL
    aliennova_signer:    # FILL
    aliennova_signed_at: # FILL
    witness:             # optional
    witness_signed_at:   # optional
    instrument_storage:  # FILL
```

---

## 4. Future donor entries

Add a new section per donor as additional voice clones are introduced (e.g. guest hosts on the Tier 5 Video Podcast per ADR-0012, Day 60+). Each entry follows the template in §1. Never use a voice clone in production without a completed + signed entry.

---

## 5. Operational checklist for every new donor

Before flipping `status` to `active`:

- [ ] Donor has read and signed the consent instrument (typically PDF; stored in 1Password)
- [ ] Recording session completed; raw sample archived to R2 `romas-audio-archive/voice-source/{voice_id}.wav` (private)
- [ ] Voice clone trained at vendor (ElevenLabs or PlayHT); voice_id retrieved
- [ ] Test sentence generated and listened to for quality (5-condition QA gate fixture)
- [ ] Env var (`ELEVENLABS_ROMAS_VOICE_ID` / `PLAYHT_ROMAS_VOICE_ID` / future per-donor name) populated in Cloudflare Worker Secrets
- [ ] This file updated: entry filled in with all donor + recording + scope + signature fields
- [ ] Fallback voice ID identified and stored (for the cascade when this voice is withdrawn)
- [ ] Audio-producer agent verified to read this registry on next run (smoke test)
- [ ] 1Password instrument storage path recorded in `instrument_storage` field

---

## 6. Cross-references

- `Docs/ROMAS-Brief-Audio-Architecture.md` §2.2 — voice consent operational model
- `Docs/specs/adr/0004-tts-elevenlabs-primary-playht-failover.md` — TTS engine selection
- `Docs/specs/remediation-plan.md` R-110 (this file) + R-213 (audio-producer reads this file)
- `.claude/agents/audio-producer.md` — agent definition; the consumer of this registry
- `SECRETS.md` (when R-112 lands) — env-var → secret-store map; the voice ID env vars live in Cloudflare Worker Secrets

---

## 7. Revision history

| Version | Date | Change |
|---|---|---|
| 1.0.0-template | 2026-05-22 | Initial template (R-110 close as scaffold per Kimal /AskUserQuestion 2026-05-22). All entry fields are placeholders; Kimal fills + signs before first audio publish. |
