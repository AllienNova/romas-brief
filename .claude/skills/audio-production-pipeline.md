---
name: audio-production-pipeline
description: Full TTS audio production pipeline for ROMAS Audio Brief, Daily Brief, Podcast, and Conference Brief. Covers voice selection, script prep, 10-beat structure, ElevenLabs + PlayHT failover, loudness mastering to -16 LUFS, R2 storage, transcript generation, and QA gate handoff. Load before any audio job.
---

# ROMAS Wire — Audio Production Pipeline

## Voice: ROMAS Clinical Narrator

- **Primary**: ElevenLabs custom voice. Env: `ELEVENLABS_ROMAS_VOICE_ID`.
- **Failover**: PlayHT cloned voice. Env: `PLAYHT_ROMAS_VOICE_ID`.
- **Pace**: 145–160 wpm.
- **Loudness target**: **-16 LUFS integrated, -1 dBTP true peak**.
- **Sample rate**: 48 kHz master (WAV) → 128 kbps stereo MP3 for CDN.

## Article → audio length mapping

| Archetype | Article words | Audio length | Spoken words |
|---|---|---|---|
| Short brief | 600–900 | 5 min | 700–850 |
| Standard analysis | 1,000–1,500 | 7 min | 1,000–1,150 |
| Deep report | 2,000–3,500 | 10 min | 1,400–1,600 |

## Audio Brief 10-beat structure (mandatory)

Every Audio Brief script follows this exact order:

1. **Opening headline** — restated for audio (≤ 12s)
2. **Background context** — who / what / where
3. **What happened** — the news event
4. **Key details** — numbers, dose, sample size, primary endpoint
5. **Why it matters clinically** — patient-level impact
6. **Physics / dosimetry / workflow implications** — operational
7. **AI / tech implications** — model / algorithm / automation
8. **Limitations** — what the source did NOT establish
9. **ROMAS Take** — one-line interpretation, labeled in-script
10. **Source attribution** — primary source named in-script

**Skipping a beat requires explicit `editorial-director` override + note in `audio_jobs.notes`.**

## Mandatory pre-roll / post-roll

- **Audio Brief pre-roll** (every episode): *"From ROMAS Intelligence — clinical intelligence for modern radiation oncology."*
- **Podcast post-roll** (Tier 3 only): *"Not headlines. Clinical intelligence."* — never used elsewhere.

## Pipeline phases

```
1. Script draft          (audio-producer drafts from article + 10-beat template)
2. Lexicon application   (pronunciation-lexicon skill — see below)
3. TTS generation        (ElevenLabs → fallback PlayHT on error)
4. Master                (loudness normalize to -16 LUFS / -1 dBTP)
5. Encode                (WAV → MP3 128k stereo)
6. Upload                (WAV → romas-audio-archive R2 bucket [private])
                         (MP3 → romas-audio-cdn R2 bucket [public via CDN])
7. Transcript            (Whisper large-v3 → TXT + SRT, store with audio)
8. QA handoff            (audio_status set to in_review, notify audio-qa-reviewer)
9. QA outcome            (published | skipped — owned by audio-qa-reviewer)
```

## State machine

```
queued → generating → in_review → (published | skipped)
published → revoked   (post-publish kill switch only)
```

**Publish requires** (schema-enforced):
- `clinical_claims_checked = true`
- `qa_reviewer IS NOT NULL`
- `loudness_lufs BETWEEN -18 AND -14` (ADR-0016 DB gate). Pipeline targets `-16 ±0.5 LUFS` on first pass; tolerates `±1 LUFS` (`[-17, -15]`) without re-master; re-masters once if outside `[-17, -15]`; marks `skipped` if outside `[-18, -14]` after re-master. The tight `±0.5` target is the pipeline's job; reviewer sees only the post-retry result.
- `true_peak_dbtp <= -1`
- `transcript_url IS NOT NULL`

## Loudness verification

Use `ffmpeg` with `loudnorm` filter, two-pass:

```bash
# Pass 1 — measure
ffmpeg -i input.wav -af loudnorm=I=-16:TP=-1:LRA=11:print_format=json -f null -

# Pass 2 — apply with measured values
ffmpeg -i input.wav -af loudnorm=I=-16:TP=-1:LRA=11:\
measured_I=...:measured_LRA=...:measured_TP=...:measured_thresh=...:offset=... \
-ar 48000 -y mastered.wav
```

**Production target window**: re-master if final `integrated_loudness` is outside **-17 to -15 LUFS** (the -16 ±1 production target) or `true_peak > -1 dBTP`. After one re-master, accept any value inside the DB gate **-18 to -14 LUFS** (ADR-0016) — values inside the DB gate but outside the production target surface as an amber soft-warning in the audio-qa-reviewer agent. Outside the DB gate after re-master: mark job `skipped` with reason `loudness_out_of_band`.

## TTS failover logic

```
try ElevenLabs (3 retries, exponential backoff: 1s, 4s, 16s)
  on 429 / 5xx / timeout → fall through to PlayHT
  on PlayHT failure → mark audio_status = skipped, log to audio_jobs.error
```

Never silently swap voices mid-issue. If failover triggers, log `voice_engine_used` in `audio_jobs`.

## R2 storage layout

```
romas-audio-archive/   (private)
  /YYYY/MM/DD/{article_slug}__brief.wav
  /YYYY/MM/DD/{article_slug}__brief.script.md
  /YYYY/MM/DD/daily/{date}__daily.wav
  /YYYY/MM/DD/podcast/{ep_number}__{slug}.wav
  /YYYY/MM/DD/conference/{conf_slug}__{ep_number}.wav

romas-audio-cdn/       (public, CDN-fronted)
  /audio/brief/YYYY/MM/{article_slug}__brief.mp3
  /audio/daily/YYYY/MM/{date}__daily.mp3
  /audio/podcast/{ep_number}__{slug}.mp3
  /audio/conference/{conf_slug}__{ep_number}.mp3
  /transcripts/...__{slug}.{txt|srt}
```

CDN cache TTL: 300s for active episodes, 86400s for episodes older than 24h. **Revoke = purge by tag** (60s SLA).

## Audio revoke workflow

When `audio-qa-reviewer` issues a revoke (post-publish kill switch):

1. Flip `audio_status = revoked`, set `revoke_reason`.
2. Issue CDN purge by tag for the audio + transcript URLs.
3. Regenerate affected RSS feeds (drop revoked item).
4. Surface in next morning brief under "Audio revocations".

**SLA: 60s from revoke command to CDN withdrawal.**

## Pre-roll / post-roll insertion

Templated in `tools/audio/preroll.ts`:

```ts
const PRE_ROLL = "From ROMAS Intelligence — clinical intelligence for modern radiation oncology.";
const PODCAST_POST_ROLL = "Not headlines. Clinical intelligence.";

function wrapBrief(scriptBody: string): string {
  return [PRE_ROLL, "", scriptBody, "", attributionLine()].join("\n");
}
function wrapPodcast(body: string) {
  return [PRE_ROLL, "", body, "", PODCAST_POST_ROLL].join("\n");
}
```

## Failure modes

| Mode | Action |
|---|---|
| ElevenLabs 5xx persistent | Switch to PlayHT; log engine swap |
| PlayHT also failing | Skip article audio; ship article without audio; never block article publish on audio |
| Loudness check fails 2× | `audio_status = skipped`, surface in source health |
| Transcript missing | Block publish — transcript URL is mandatory |
| Lexicon term missing | Producer adds to lexicon proposal queue; ships with default pronunciation only if reviewer approves |

## Required env vars

```
ELEVENLABS_API_KEY
ELEVENLABS_ROMAS_VOICE_ID
PLAYHT_API_KEY
PLAYHT_USER_ID
PLAYHT_ROMAS_VOICE_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_ARCHIVE_BUCKET=romas-audio-archive
R2_CDN_BUCKET=romas-audio-cdn
CLOUDFLARE_ZONE_ID
WHISPER_ENDPOINT
```

---

*Always handoff to `audio-qa-reviewer` after generation. Never auto-publish.*
