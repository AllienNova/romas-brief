---
title: ROMAS Wire — Audio Architecture
version: 1.0.0
date: 2026-05-21
status: Canonical sibling to Master-Strategy v2.1 + Daily-Production-Runbook v1.1 + Launch-Plan v1.1
owner: Kimal Honour Djam (president@aliennova.com)
authority_chain: SSOT v1.2.0 §4 + §7 — verbatim. ADR-0004 (TTS), ADR-0005 (RSS four-tier feeds), ADR-0006 (QA state machine), ADR-0011 (Whisper transcription), ADR-0012 (video podcast placeholder), ADR-0016 (loudness band widen). On conflict with this doc, SSOT + ADRs win — flag drift back into this file.
supersedes: implicit reference target in CLAUDE.md §6 + AGENT.md §12 prior to this file existing (R-006-A close)
sibling_docs: Docs/ROMAS-Brief-Master-Strategy.md, Docs/ROMAS-Brief-Daily-Production-Runbook.md, Docs/ROMAS-Brief-500-Article-Launch-Plan.md, Docs/ROMAS-Brief-Design-Specification.md (when R-005 lands)
---

# ROMAS Wire — Audio Architecture v1.0

## 0. Purpose

This document is the canonical reference for **how ROMAS Wire produces, masters, validates, distributes, and revokes audio**. It synthesises the audio-related decisions scattered across SSOT, the ADRs, the runtime skills, and the agent definitions into a single sibling-doc to the Master-Strategy + Runbook. When `audio-producer` or `audio-qa-reviewer` agents load context, they should refer here for the operational model and to the ADRs for the underlying decisions.

This file does NOT introduce new decisions. Every numeric, every threshold, every state-machine value is sourced from SSOT or an ADR.

---

## 1. Tier overview

ROMAS Wire ships **four audio tiers Day 1** and **one video tier Day 60** (SSOT §3 row 6, Kimal-locked 2026-05-14; ADR-0005 cycle-3).

| Tier | Name | Length | Cadence | RSS feed | Voice engine | Launch | Reference |
|---|---|---|---|---|---|---|---|
| 1 | ROMAS Audio Brief | 5 / 7 / 10 min | Per article | `audio-brief.xml` | ElevenLabs primary, PlayHT failover | **Day 1** | CLAUDE.md §5, ADR-0005 |
| 2 | ROMAS Daily Brief | 10–15 min | Daily roundup | `daily-brief.xml` | Same | **Day 1** | CLAUDE.md §5 |
| 3 | The ROMAS Podcast | 30–60 min | Weekly deep-dive | `podcast.xml` | Same | **Day 1 (ep 001 pre-mastered)** | ADR-0005 cycle-3 Q2-A |
| 4 | ROMAS Conference Brief | 15–30 min | During ASTRO / ESTRO / AAPM / JASTRO / RANZCR | `conference-brief.xml` | Same | **Day 1 (activates per conference)** | ADR-0005 |
| 5 | Video Podcast (with invited guest) | 20–40 min | Bi-weekly post-launch | `video-podcast.xml` (placeholder) | Human voice + video | **Day 60** | ADR-0012 placeholder; vendor decision Day 30 |

**Article archetype → Audio Brief length mapping** (CLAUDE.md §1):

| Archetype | Word count | Audio Brief length | Spoken word target |
|---|---|---|---|
| Short brief | 600–900 | 5 min | 700–850 |
| Standard analysis | 1,000–1,500 | 7 min | 1,000–1,150 |
| Deep report | 2,000–3,500 | 10 min | 1,400–1,600 |

Pace: **145–160 wpm** (SSOT §3 row 13).

---

## 2. Voice strategy

### 2.1 Engines (ADR-0004)

**Primary**: ElevenLabs Multilingual v2, **3 Creator-tier voices selected by tier role** per D-032 (2026-05-22). Replaces the single ROMAS Clinical Narrator (Kimal clone) path; Kimal clone deferred to post-launch revisit.

| Env var | Tier(s) | Editorial register |
|---|---|---|
| `ELEVENLABS_VOICE_ID_BRIEF` | Audio Brief (tier 1) + Daily Brief (tier 2) | Crisp, calm narrator for short-form daily content. ~70% of production volume. |
| `ELEVENLABS_VOICE_ID_PODCAST` | The ROMAS Podcast (tier 3) | Deeper voice for 30-60 min weekly deep-dives. ~10% of production volume but highest per-episode minutes. |
| `ELEVENLABS_VOICE_ID_CONFERENCE` | Conference Brief (tier 4) + Video Podcast (tier 5) | Event-paced voice for conference + future Day-60 video coverage. |

The audio-producer agent picks the voice by `audio_jobs.audio_tier` enum value (see migration `0002_create_audio_jobs.sql` for the canonical 5-value enum). When a new audio job arrives, the producer reads its `audio_tier` field, selects the matching env var, and uses that voice ID for the synthesis call. Tier→voice mapping is the operational contract.

**Failover**: PlayHT Play3.0 mini, voice ID held in `PLAYHT_ROMAS_VOICE_ID`. Activated when ElevenLabs returns 429 / 5xx three times with exponential backoff (1s / 4s / 16s).

**Never silently swap voices.** If both fail, the audio job is marked `skipped` with `error` populated and `skip_reason = 'tts_failover_exhausted'`. The article still ships without audio (`reader` UI surfaces "no audio for this brief").

#### 2.1.2 Cloudflare Worker sync limit — Queued Consumer required (B-16, empirical 2026-05-22)

ElevenLabs TTS latency measured at **34.13 s for 2.7 min audio** (Aria, default voice settings) in smoke test attempt #3. Cloudflare Workers have a **30 s sync wall-clock limit** on `fetch()`. Synchronous TTS from a CF Worker times out on most ROMAS Wire audio:

| Tier | Typical audio length | TTS latency estimate (linear extrapolation) | Worker sync? |
|---|---|---|---|
| Audio Brief (tier 1) | 5-7 min | ~60-90s | **NO** |
| Daily Brief (tier 2) | 10-15 min | ~130-190s | **NO** |
| The ROMAS Podcast (tier 3) | 30-60 min | ~6-13min | **NO** |
| Conference Brief (tier 4) | 15-30 min | ~190-380s | **NO** |
| Video Podcast (tier 5) | 20-40 min | ~250-510s | **NO** |

**Architectural constraint**: the audio-producer Worker (R-201, M2) MUST use **Cloudflare Queues + Queued Consumer pattern** — same pattern as ADR-0011 specifies for Whisper transcription. The publish event enqueues an audio synthesis job; a separate Queued Consumer worker (no wall-clock limit) handles the TTS call + loudnorm + R2 upload + transcript + `audio_jobs` row update.

This is a P0 design constraint for M2. The cron-ingest worker (running synchronously per `wrangler.toml`) does NOT call ElevenLabs directly — it enqueues, then returns. The Queue + Consumer architecture also lets us retry transient failures (ElevenLabs 429/5xx) without burning the cron's 30s budget on backoff sleeps.

See `Docs/build/decision-log.md` D-032 smoke test attempt #3 + risk-register B-16 for the empirical trail.

#### 2.1.1 ElevenLabs tier + permission requirements (D-031, empirical 2026-05-22)

Production deployment requires **one of**:

- (a) ElevenLabs **paid tier** (Creator plan or higher) for the operating account. Free-tier API calls receive HTTP 402 `paid_plan_required` for ALL library voices including the 9 default voices (Aria / Roger / Sarah / Laura / Charlie / George / Callum / River / Liam). This was verified empirically against `voice_id 9BWtsMINqrJLrRacOk9x` (Aria, default) on 2026-05-22 — same 402 response as for library voices.
- (b) Kimal's **personal voice clone** trained in the operating account. Personal voices bypass the library-voice restriction even on free tier. This is the ROMAS Clinical Narrator path per CLAUDE.md §6 + voice-consent-registry §2 anyway, so the path (b) requirement aligns with the existing plan.

The production `ELEVENLABS_API_KEY` MUST carry **both** `voices_read` AND `text_to_speech` permissions. TTS-only keys can call `/v1/text-to-speech/{voice}` but cannot enumerate `/v1/voices` — required for the audio-producer's start-of-pipeline voice-availability health check + the operations dashboard.

See `Docs/build/decision-log.md` D-031 for the empirical smoke-test trail.

### 2.2 Voice consent

Voice usage is gated on a signed consent registry (`Docs/voice-consent-registry.md`, R-110, Kimal legal track). The audio-producer agent reads the consent registry at start-of-pipeline; if the voice ID listed in the env vars is disabled (consent withdrawn), the agent falls back to a standard ElevenLabs voice ID + logs the substitution. PlayHT consent is tracked separately because the donor identity differs (R-213, M2).

### 2.3 Lexicon

The audio-producer agent applies the pronunciation lexicon (`lexicon` table) before TTS request. The lexicon stores per-term IPA + SSML for ElevenLabs and a plain-English spoken re-spelling for PlayHT (which does not honour SSML). Eight term types: vendor / drug / device / modality / acronym / person / institution / site.

**Seed**: 30 entries land via `supabase/seed.sql` (T-201 / A-201 in M2). Expansion target: ~80 entries by Day 1 (per cycle-5 H-11 risk register).

**Unknown terms**: when the audio-producer encounters a medical or physics term not present in the lexicon during script generation, it inserts a row into `lexicon_proposals` (status `pending`). The CMS lexicon admin UI (M2 T-201/T-202) lists pending proposals for `audio_qa` or `editor_in_chief` to approve into the canonical lexicon.

---

## 3. Production pipeline

### 3.1 Ten-beat script structure (mandatory)

Every Audio Brief and Conference Brief script follows the 10-beat structure (CLAUDE.md §5):

1. Opening headline
2. Background context
3. What happened
4. Key details
5. Why it matters clinically
6. Physics / dosimetry / workflow implications
7. AI / tech implications
8. Limitations
9. ROMAS Take
10. Source attribution

Beat detection runs at script-validation time (A-020 in `test-qa-plan.md`); fewer than 10 beats fails unless `audio_jobs.notes` contains `override:beat-skip`.

Daily Brief (10–15 min roundup) and Podcast (30–60 min) follow longer, free-form structures with their own templates — see `friday-read-format` and podcast script templates (T-501 in M5 → folded into M2 per cycle-2 lock).

### 3.2 Pre-roll and post-roll (locked)

- **Audio Brief pre-roll** (every episode): *"From ROMAS Intelligence — clinical intelligence for modern radiation oncology."*
- **Audio Podcast post-roll** (Tier 3 only): *"Not headlines. Clinical intelligence."*

Pre-roll injection runs in T-206 (M2). Post-roll injection runs in T-502 (M5, folded into M2 per cycle-2 lock). Neither tier-1 Audio Brief nor Tier-2 Daily Brief carry the post-roll. Tier-4 Conference Brief carries the pre-roll only.

### 3.3 Loudness mastering (ADR-0016 layered defense)

**Production target**: `-16 ±0.5 LUFS` integrated, `-1 dBTP` true peak, LRA 11 (broadcast speech standard). Achieved via two-pass `ffmpeg loudnorm`:

```bash
# Pass 1 — measure
ffmpeg -i input.wav -af loudnorm=I=-16:TP=-1:LRA=11:print_format=json -f null -

# Pass 2 — apply with measured values
ffmpeg -i input.wav -af loudnorm=I=-16:TP=-1:LRA=11:\
measured_I=...:measured_LRA=...:measured_TP=...:measured_thresh=...:offset=... \
-ar 48000 -y mastered.wav
```

**Three-layer enforcement** (ADR-0016):

| Layer | Range | Action on out-of-range |
|---|---|---|
| **DB CHECK** (`audio_publish_requires_qa`) | `[-18, -14]` LUFS | Postgres constraint rejects publish; CMS surfaces a user-friendly error. |
| **Pipeline target** (audio-production-pipeline R-202) | `-16 ±0.5` LUFS; tolerate `±1` (`[-17, -15]`) | First pass hits target; if outside `[-17, -15]` re-master once with adjusted parameters; if still outside `[-18, -14]` mark `skipped` with `loudness_out_of_band`. |
| **Reviewer agent** (audio-qa-reviewer) | Green tick inside `[-17, -15]`; amber soft-warn inside `[-18, -14]` but outside the tight target; cannot approve outside DB gate | Human judgment for near-target episodes; DB CHECK is the floor. |

True peak `> -1 dBTP` always re-masters. After re-master, if still above `-1 dBTP`, mark `skipped` with `true_peak_too_hot`.

#### 3.3.1 Empirical validation (2026-05-22 smoke test attempt #3)

The loudnorm parameters above were empirically validated against a real ElevenLabs Multilingual v2 output via `tools/audio/smoke-test.mjs`:

| Measurement | Value | Notes |
|---|---|---|
| Input source | Aria default voice, 405-word 10-beat script (~2.7 min audio) | Pre-roll injected + script.txt captured |
| ElevenLabs raw output (`input_i`) | **-26.04 LUFS** | Roughly 10 LUFS BELOW broadcast spec; confirms loudnorm is mandatory |
| Pass-1 measured `input_tp` | -9.42 dBTP | Very low true peak; lots of headroom |
| Pass-1 `input_lra` | 3.10 LU | Tight dynamic range |
| Pass-2 final `output_i` | **-16.01 LUFS** | Within ADR-0016 tight target `[-17, -15]` |
| Pass-2 final `output_tp` | **-1.0 dBTP** | Exactly at the publish-gate ceiling |
| ADR-0016 verdict | **GREEN** (first-pass; no soft-warn) | DB gate PASS + tight target PASS + true_peak PASS |

**Operational implications for M2 R-202 audio-producer Worker**:
1. ElevenLabs raw output is consistently quiet; the two-pass loudnorm step is non-negotiable.
2. `loudnorm I=-16:TP=-1:LRA=11` with `linear=true` (pass 2) produces first-pass GREEN on this voice's characteristics. Other voices may need per-voice tuning — re-validate when PODCAST + CONFERENCE voices are selected.
3. The pipeline's automatic re-master-on-out-of-target logic was not triggered (first-pass already inside `[-17, -15]`). Validates the re-master semantic but doesn't exercise the failure path; M2 should add a synthetic test with an artificially-loud input to verify re-master behavior end-to-end.

### 3.4 Transcription (ADR-0011)

Every audio episode generates a Whisper large-v3 transcript:
- WAV master → Whisper API → TXT + SRT
- TXT uploaded to R2 `romas-audio-archive`
- `audio_jobs.transcript_url` set to the public TXT path
- The transcript URL must be non-null to satisfy publish gate condition 5 (rule 6 / ADR-0006)

Whisper is invoked as a Cloudflare Queued Consumer or Durable Object because the 30–60-min Podcast tier exceeds the Worker sync 30s limit (REL-009 risk; resolved by Queued Consumer pattern, M2).

### 3.5 R2 storage layout

| Bucket | Visibility | Content |
|---|---|---|
| `romas-audio-archive` | Private (Worker-only) | WAV masters + transcripts (TXT + SRT) |
| `romas-audio-cdn` | Public via Cloudflare CDN | MP3 128 kbps stereo 48 kHz + RSS feed files (`*.xml`) + cover artwork |

WAV master is the source-of-truth artifact; MP3 is derived. On revoke, BOTH copies are removed: WAV via R2 delete + MP3 via R2 delete + CDN purge.

---

## 4. Quality gate (inviolable rule 6)

### 4.1 The 5-condition publish CHECK

`audio_status` can only transition to `'published'` when all five hold (SSOT §7, schema-enforced via `audio_publish_requires_qa` in `Docs/specs/contracts/supabase-schema.sql`):

1. `clinical_claims_checked = true`
2. `qa_reviewer IS NOT NULL`
3. `loudness_lufs BETWEEN -18 AND -14` (ADR-0016 widen)
4. `true_peak_dbtp <= -1`
5. `transcript_url IS NOT NULL`

The schema CHECK is the **floor**; the `audio-qa-reviewer` agent enforces the tight production target inside this floor. No application code path can bypass the schema.

### 4.2 State machine (ADR-0006)

```
queued → generating → in_review → (published | skipped)
published → revoked   (post-publish kill switch only; 60s CDN withdrawal SLA)
```

| Transition | Authority | Constraint |
|---|---|---|
| `queued → generating` | audio-producer (Worker) | none |
| `generating → in_review` | audio-producer (Worker) | masters uploaded, transcript generated, loudness measured + written |
| `in_review → published` | audio-qa-reviewer (CMS UI; UPDATE via `audio_qa_flip` RLS policy) | 5-condition CHECK (§4.1) + `audio_qa` role membership |
| `in_review → skipped` | audio-qa-reviewer (CMS UI) OR audio-producer (on retry exhaustion) | `skip_reason IS NOT NULL` |
| `published → revoked` | audio-qa-reviewer or editor_in_chief (CMS UI) | `revoke_reason IS NOT NULL` |

### 4.3 The QA checklist (operator form)

See `.claude/skills/audio-qa-checklist.md` for the full reviewer form. Sections:
- **A — Editorial fidelity**: 10-beat structure, ROMAS Insight labeling, clinical claim trace
- **B — Lexicon**: drug names, vendor names, acronyms, person/institution names
- **C — Audio quality** (block on any FAIL): loudness band, true peak, no artifacts, clean fades, pace, pre-roll, post-roll
- **D — Provenance**: voice engine match, transcript presence, R2 archive checksum

The reviewer's "Approve and publish" button is disabled by the CMS UI when any condition is unmet; clicking it triggers the schema-level INSERT/UPDATE which the DB CHECK validates one more time as the last line of defense.

---

## 5. RSS distribution (ADR-0005)

Four feeds Day 1, one Tier 5 placeholder:

| Feed file | Tier | `audio_jobs.audio_tier` filter (ADR-0017) | Day-1 status |
|---|---|---|---|
| `audio-brief.xml` | ROMAS Audio Brief | `audio_tier = 'audio_brief'` | Live with ~30 episodes |
| `daily-brief.xml` | ROMAS Daily Brief | `audio_tier = 'daily_brief'` | Live with ~5 rehearsal episodes |
| `podcast.xml` | ROMAS Audio Podcast | `audio_tier = 'podcast'` | Live with episode 001 (30–60 min) + ~9 buffer episodes |
| `conference-brief.xml` | ROMAS Conference Brief | `audio_tier = 'conference_brief'` | Live with ~5 historical episodes |
| `video-podcast.xml` | ROMAS Video Podcast — Tier 5 | `audio_tier = 'video_podcast'` | Skeleton-only Day 1; populated Day 60 per ADR-0012 |

Feeds are regenerated by `workers/rss-publisher` on:
- New `audio_status = 'published'` event for any `audio_jobs` row of that tier
- `audio_status = 'revoked'` event (episode removed from feed; feed regenerated)

Feed files live in R2 `romas-audio-cdn` (public via CDN). CDN TTL: **60 seconds** (must reflect revokes promptly to honour the kill-switch SLA).

Feed validity gates (T-309 / A-036..A-042):
- Atom 1.0 well-formed (`xmllint --noout`)
- iTunes Podcast namespace on `podcast.xml` (`itunes:title`, `itunes:duration`, `itunes:explicit` etc.)
- Per-tier item cap of 100 (oldest dropped first)

---

## 6. Revoke kill switch (60s SLA)

The ROMAS Wire revoke pathway is a **post-publish-only kill switch** that withdraws content from the public CDN within 60 seconds p99. This is an operational SLA (NFR-005) and a Rule 4 enforcement mechanism (citation correction).

### 6.1 Flow

```
Reviewer clicks "Revoke" in CMS
  → audio_jobs.audio_status: published → revoked (with revoke_reason)
  → audio_jobs_set_updated trigger fires (updated_at refresh)
  → INSERT into revocations table (audit log)
  → workers/audio-producer revoke handler:
      - Cloudflare cache purge by tag (zone:romasbrief.com, tag:audio-{audio_job_id})
      - On 2xx confirmation: revocations.cdn_purge_at = now()
  → workers/rss-publisher revoke trigger:
      - Regenerate the affected feed (audio-brief / daily-brief / podcast / conference-brief)
      - On feed write success: revocations.rss_regenerated_at = now()
  → workers/cdn-purge-watchdog (cron every minute):
      - Find revocations rows with cdn_purge_at NULL AND created_at < now() - interval '90 seconds'
      - Retry purge
      - If still failing, alert via Sentry + email (R-211 M2)
```

Total wall-clock budget: 60s p99 (NFR-005, A-034).

### 6.2 Revocation audit trail

Every revoke writes a `revocations` row with `reason` (mandatory text), `triggered_by` (qa_reviewer FK), `cdn_purge_at` (filled on confirmation), `rss_regenerated_at` (filled on confirmation). The watchdog reads this table to detect SLA breach.

---

## 7. Embargo handling (inviolable rule 2)

Embargoed items (ASTRO/ESTRO/AAPM/JASTRO/RANZCR/ASCO abstracts pre-conference) **never enter the publish queue** — they live in `embargo_holds` until `embargo_until` lapses. The release worker (T-121, M2) writes both `released_at` AND `released_to_article_id` atomically; the schema CHECK `embargo_release_pair` (A2 from cycle build-2026-05-21) enforces the atomicity at the DB level so a worker crash mid-update cannot leave a half-released hold.

Conference Brief audio tier (T-602, M6) carries an embargo lint: any item in the `conference-brief.xml` feed with `embargo_until > now()` causes feed generation to refuse and alert.

---

## 8. Lexicon discipline

The `lexicon` table is the canonical pronunciation vocabulary. Schema in `0006_create_lexicon.sql`. Eight term types. Audio-producer applies the lexicon before TTS; unknown terms enter `lexicon_proposals` for human approval.

**30-entry seed** lands via `supabase/seed.sql` (T-201/A-201, M2). Expansion to ~80 entries by Day 1 is owned by the audio-producer agent based on production-time discoveries (H-11 risk).

**Auto-proposal logic** (M2 T-202):
- During script generation, scan for medical/physics terms not in the lexicon
- For each unknown term, insert into `lexicon_proposals` (status `pending`) with the audio-producer's best-effort IPA + spoken re-spelling
- CMS lexicon admin UI surfaces pending proposals for `audio_qa` review
- Approved proposals become `lexicon` rows (status flip to `approved`); rejected stay as historical record

---

## 9. Operational reference

### 9.1 Environment variables (per `.env.example`)

| Variable | Purpose |
|---|---|
| `ELEVENLABS_API_KEY` | Worker secret; TTS primary (Creator tier; full permissions per D-031) |
| `ELEVENLABS_VOICE_ID_BRIEF` | Voice ID for Audio Brief + Daily Brief (tier 1+2) per D-032 |
| `ELEVENLABS_VOICE_ID_PODCAST` | Voice ID for The ROMAS Podcast (tier 3) per D-032 |
| `ELEVENLABS_VOICE_ID_CONFERENCE` | Voice ID for Conference Brief + Video Podcast (tier 4+5) per D-032 |
| `PLAYHT_API_KEY` | Worker secret; TTS failover |
| `PLAYHT_USER_ID` | PlayHT account scope |
| `PLAYHT_ROMAS_VOICE_ID` | Voice clone identifier (separate from ElevenLabs) |
| `OPENAI_API_KEY` | Whisper transcription |
| `R2_AUDIO_ARCHIVE_BUCKET` | WAV master bucket name |
| `R2_AUDIO_CDN_BUCKET` | MP3 public bucket name |
| `CLOUDFLARE_API_TOKEN` | Zone:Cache Purge (revoke kill switch) |

### 9.2 Worker inventory

| Worker | Responsibility | Milestone |
|---|---|---|
| `workers/cron-ingest` | Source ingestion (Mon-Fri 10:30 UTC) | T-115 / M1 — live |
| `workers/audio-producer` | TTS + loudness + transcript + R2 upload + revoke purge | R-201..R-205 / M2 |
| `workers/rss-publisher` | Per-tier feed generation + revoke regenerate | R-212 / M2 |
| `workers/cdn-purge-watchdog` | Revoke SLA enforcement (60s p99) | R-211 / M2 |
| `workers/beehiiv-webhook` | Subscriber sync (HMAC-SHA256 verify) | T-310C / M3 |
| `workers/email-canary` | Daily Beehiiv ↔ Supabase drift reconciliation | T-310D / M3 |
| `workers/source-health` | Per-source health time-series writes | T-115 / M1 (folded into cron-ingest) |

### 9.3 Agent inventory

| Agent | Loads this doc? | Cross-reference |
|---|---|---|
| `audio-producer` | YES (script + lexicon + loudness + TTS pipeline) | `.claude/agents/audio-producer.md` |
| `audio-qa-reviewer` | YES (5-condition gate + reviewer form) | `.claude/agents/audio-qa-reviewer.md` |
| `editorial-director` | YES (tier selection + 10-beat verification) | `.claude/agents/editorial-director.md` |
| `cms-engineer` | YES (schema + RLS + CMS lexicon admin UI) | `.claude/agents/cms-engineer.md` |
| `friday-read-editor` | YES (Friday ROMAS Read audio path: Audio Brief OR Daily Brief based on word count) | `.claude/agents/friday-read-editor.md` |
| `conference-mode-operator` | YES (Conference Brief embargo lint) | `.claude/agents/conference-mode-operator.md` |

---

## 10. Decision lineage

| ADR | Date | What it locks |
|---|---|---|
| ADR-0004 | 2026-05-14 | TTS engines (ElevenLabs primary + PlayHT failover) |
| ADR-0005 | 2026-05-14 (cycle-3 2026-05-14) | Four-tier RSS feeds, Day-1 all-tier launch |
| ADR-0006 | 2026-05-14 | Audio QA state machine + 5-condition publish CHECK |
| ADR-0011 | 2026-05-14 (cycle-3) | Whisper large-v3 transcription via Queued Consumer |
| ADR-0012 | 2026-05-14 (placeholder; Day-30 decision) | Video podcast vendor TBD (Cloudflare Stream or external) |
| ADR-0016 | 2026-05-21 | Loudness DB gate widen `[-17,-15]` → `[-18,-14]`; 3-layer defense |
| ADR-0017 | 2026-05-21 | `audio_jobs.tier` → `audio_jobs.audio_tier` rename |

---

## 11. Revision history

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-05-21 | Initial canonical doc (R-006-A close, /team-build M1-completion cycle). Formalises content previously scattered across CLAUDE.md §5/§6, SSOT §4/§7, ADR-0004/0005/0006/0011/0012/0016/0017, `.claude/skills/audio-production-pipeline`, `.claude/skills/audio-qa-checklist`, `.claude/skills/pronunciation-lexicon`. |
