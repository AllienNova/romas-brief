---
title: ROMAS Wire — Podcast Generation + Presentation-Video Pipeline
version: 0.1.0 (design)
date: 2026-06-03
owner: Kimal Honour Djam (president@aliennova.com)
status: Design / research — implementation deferred (Tier 3 audio is live-path; video is Tier 5 Day-60 per ADR-0012)
authority: CLAUDE.md §5 (audio tiers) · ADR-0005 (RSS) · ADR-0011 (Whisper transcription) · ADR-0012 (video hosting) · Audio-Architecture.md
sources_read: jellypod.com/docs/api + /ai-podcast-generator (2026-06-03 via WebFetch)
---

# Podcast Generation + Presentation-Video Pipeline

Two decoupled stages. **Jellypod generates the audio; ROMAS Wire builds the video.**
Jellypod's API is audio-only — there is no video export endpoint — so the
"presentation podcast" for YouTube (16:9) and Reels/Shorts (9:16) is composed by us
from the audio + our transcript + our data-viz, then published.

```
 ┌─ STAGE 1: AUDIO (Jellypod API) ──────────────┐   ┌─ STAGE 2: VIDEO (ROMAS composer) ─────────────┐
 │ 10-beat script  → /episodes/generate (script)│   │ MP3 + word-timed captions + chapters + signal │
 │ chapters+segments→ poll /episodes/{id}       │──▶│ data-viz → Remotion compose → MP4             │
 │ → MP3 (master) + transcript                  │   │   • 16:9 long  → YouTube + /watch + RSS       │
 └──────────────────────────────────────────────┘   │   • 9:16 clips → Reels / Shorts / TikTok      │
                                                     └────────────────────────────────────────────────┘
```

---

## 1. Stage 1 — Jellypod audio generation (grounded against docs, 2026-06-03)

**API:** base `https://api.jellypod.com/v1`; auth `Authorization: Bearer sk_…`
(organization-scoped key from the Jellypod dashboard → Settings → API Keys).

### 1.1 Endpoints we use

| Endpoint | Use |
|---|---|
| `POST /podcasts` | one-time: create the "ROMAS Wire Podcast" show |
| `GET /voices` / `GET /hosts` | resolve `voice_id` / `host_id` for our tier voices (maps to ADR-0004 voice strategy) |
| `POST /episodes/generate` | **primary** — submit our deterministic script (chapters → segments) |
| `GET /episodes/{id}` | **poll** until complete; response then carries the audio download URL(s) |
| `POST /episodes/{id}/publish` | optional managed publish to Spotify/Apple/YouTube (we may bypass and self-publish via our RSS) |

No webhooks are documented → **poll** `GET /episodes/{id}` (same pattern the audio-producer
already uses for long jobs). Billing is a **credit system, charged by rendered audio
duration**; long scripts are preflight-validated for sufficient credits.

### 1.2 Script mode (we own the script — do NOT use prompt mode)

We submit a structured script so editorial controls the content verbatim (Rule 1: every
claim traces to a source; no LLM free-generation in the published feed):

```jsonc
POST /episodes/generate
{
  "podcast_id": "<romas-wire-podcast>",
  "script": {
    "chapters": [                       // ≤ 50 chapters
      { "title": "Opening headline",    // ← maps to the 10-beat structure (Audio-Arch §3.1)
        "segments": [                   // ≤ 200 / chapter, ≤ 600 total, ≤ 75,000 chars total
          { "host_id": "<narrator>", "text": "…", "speed": 1.0 }  // text ≤ 5,000 chars/segment
        ] }
    ]
  }
}
```

The existing **10-beat Audio Brief structure** (headline → background → what happened → …
→ ROMAS Take → source attribution) maps cleanly to Jellypod chapters. The 30–60 min
Tier-3 Podcast is the multi-segment, multi-host expansion of that spine.

### 1.3 Voice strategy reuse

ADR-0004 / CLAUDE.md §5 already define tier voices via ElevenLabs (`ELEVENLABS_VOICE_ID_PODCAST`).
Jellypod has its own 100+ voice / cloning catalog. **Decision needed (D-POD-1):** either
(a) generate the podcast audio entirely in Jellypod using its voices, or (b) keep ElevenLabs
as the canonical ROMAS voice and use Jellypod only for multi-host conversational episodes.
Recommendation: use Jellypod for the conversational Tier-3 Podcast (its strength), keep
ElevenLabs for Tier-1/2 single-narrator briefs (voice-consent continuity). Two engines,
clear tier split.

### 1.4 QA gate still applies

Jellypod audio is **not exempt from inviolable Rule 6**. The generated MP3 enters the same
`audio_jobs` state machine (`in_review → published`) with `clinical_claims_checked` +
`qa_reviewer`. Jellypod is a generation engine, not a publish bypass.

---

## 2. Stage 2 — Presentation video (the part we build)

Jellypod gives audio. The presentation video adds the visual layer. Inputs:

| Input | Source |
|---|---|
| Audio (MP3 master) | Jellypod episode download URL → R2 |
| Word-level caption timing | **Whisper** (ADR-0011) on the MP3 — already in the audio-producer pipeline |
| Chapter / beat boundaries | the script chapters we submitted to Jellypod |
| Signal data-viz | **reuse WEB-4 components** (`SignalScoreRadar`, `SignalBar`, `CompositeScoreRing`) as render components — same React |
| Brand + sponsor block | design tokens; 32px sponsor-firewall applies to frames too (ADR / SSOT §3 row 8) |

### 2.1 Composition layers (both aspect ratios)

1. **Background** — ROMAS brand (subtle mesh/gradient, dark-mode parity).
2. **Audio-reactive waveform** — bar/line viz driven by the MP3 amplitude.
3. **Word-synced captions** — from Whisper word timings; mandatory for a11y (ADR-0011
   already produces `.txt` + `.srt`). Large, high-contrast.
4. **Chapter title cards** — animated card per 10-beat chapter ("Why it matters clinically",
   "ROMAS Take", etc.).
5. **Data slides** — the six-axis signal radar / key stats / a figure, rendered from the
   WEB-4 components for the relevant article.
6. **Lower-third** — episode title, date, ROMAS wordmark; speaker label in multi-host.
7. **Sponsor block** — "Partner Message · Sponsored", ≥32px from the wordmark, never on a
   clinical-claim frame.

### 2.2 Two render targets

| Target | Aspect | Length | Content |
|---|---|---|---|
| **YouTube / `/watch` / `video-podcast.xml`** | 16:9 | full episode (30–60 min) | full composition above |
| **Reels / Shorts / TikTok** | 9:16 | 30–90 s clips (2–4 per episode) | auto-extracted highlight + big captions + hook title + vertical waveform |

**Highlight extraction for Reels:** pick 2–4 hook moments — candidates: (a) the "ROMAS Take"
beat, (b) the highest-signal claim (we already compute six-axis scores), (c) a
surprising-stat sentence flagged by an LLM pass over the transcript. Clip the audio to the
chosen [start,end] from Whisper timings, render 9:16 with oversized captions.

---

## 3. Render tooling — options + recommendation

> Per rule 11, the chosen tool's docs get verified before implementation. This section is
> the decision frame, not yet a locked integration.

| Option | Fit | Runs on | Trade-off |
|---|---|---|---|
| **Remotion** (React → MP4) | **Recommended** — reuses the WEB-4 React data-viz + design tokens verbatim; programmatic, deterministic, version-controlled compositions | Remotion Lambda **or** a container (Modal/Fly) — **NOT** a Cloudflare Worker (needs Chromium + ffmpeg) | infra to run the renderer; render minutes cost |
| **ffmpeg** (showwaves + drawtext + overlays) | lightweight waveform + caption + static slides | any container / GH Action | weaker for rich animated slides; no React reuse |
| **Shotstack / Creatomate** (JSON → MP4 API) | zero render infra, managed | their cloud | per-render cost; brand fidelity via their template model; less control |

**Recommendation: Remotion**, because the signal data-viz already exists as React (WEB-4)
and brand fidelity + a11y captions matter for a clinical audience. The renderer is a
container job (Remotion Lambda or Modal), triggered after audio QA passes — **not** a
Cloudflare Worker (Workers cannot run Chromium/ffmpeg; this is the same constraint that
keeps audio mastering in a container, Audio-Arch §3.3).

This becomes a formal ADR (proposed **ADR-0021: presentation-video render tooling**) when
Tier-5 work starts; it is distinct from **ADR-0012 (video *hosting* vendor)** — generation
(Jellypod audio) + render (Remotion) + hosting (Cloudflare Stream / Mux / R2 per ADR-0012)
are three separate decisions.

---

## 4. Storage, publishing, distribution

- **R2:** new public bucket **`romas-video-cdn`** (mirrors `romas-audio-cdn`; add to
  `infra/r2` + the provisioning script). WAV/ProRes masters (if any) → private archive.
- **YouTube:** YouTube Data API v3 upload (long 16:9) + Shorts (9:16). Needs a Google/YT
  OAuth app + channel — net-new credential (`YOUTUBE_*`), Founders-Board item.
- **Reels / TikTok:** Instagram Graph API (Reels) + TikTok Content Posting API — each its
  own app + token; or manual upload at launch, automate later.
- **Own surfaces:** `/watch` page (ADR-0012) + `video-podcast.xml` RSS (already a placeholder
  feed in ADR-0005 / rss-publisher).
- **QA + revocation:** video inherits the audio QA gate; the cdn-purge-watchdog pattern
  extends to video URLs for the 60s revoke SLA.

---

## 5. Cross-references & ties to existing work

- **ADR-0011 (Whisper)** — caption timing source; `.srt` already produced.
- **ADR-0012 (video hosting)** — hosting decision (still open, Day 30); this doc is the
  generation+render half it cross-references.
- **ADR-0005 (RSS)** — `video-podcast.xml` enclosure.
- **WEB-4 data-viz** — `SignalScoreRadar` / `SignalBar` / `CompositeScoreRing` reused as
  Remotion slide components.
- **Audio-Architecture §3.1 (10-beat)** — maps to Jellypod chapters + chapter title cards.
- **infra/r2 + Docs/ops/r2-provisioning.md** — extend for `romas-video-cdn`.
- **Rule 6 QA gate** — Jellypod audio + rendered video both pass `audio_jobs` QA before publish.

---

## 6. Build sequence (when Tier-5 work starts)

1. Jellypod: create show, map tier voices, wire `POST /episodes/generate` (script mode) +
   poll + pull MP3 → R2 → `audio_jobs`. (This is the Tier-3 *audio* path — usable now,
   independent of video.)
2. Whisper word-timing already exists → expose word-level JSON for captions.
3. Remotion project: brand template + caption track + chapter cards + WEB-4 data-viz
   components; 16:9 composition.
4. Render job on a container (Remotion Lambda / Modal), triggered post-QA; MP4 → `romas-video-cdn`.
5. 9:16 + highlight-extraction (LLM hook-picker over the transcript) → Reels clips.
6. Publishing connectors: `/watch` + `video-podcast.xml` first; YouTube Data API next;
   Reels/TikTok last (per credential availability).
7. ADR-0021 (render tooling) + update ADR-0012 (hosting) at decision time.

---

## 7. Open decisions (need Kimal / Day-30 ADR window)

- **D-POD-1** — Jellypod voices vs ElevenLabs for the Tier-3 Podcast (see §1.3). Rec: Jellypod for multi-host conversational, ElevenLabs for single-narrator briefs.
- **D-POD-2** — render tool (Remotion rec) → ADR-0021.
- **D-POD-3** — video hosting (ADR-0012, open) — Cloudflare Stream vs Mux vs R2-self-host.
- **D-POD-4** — YouTube/Reels/TikTok credentials + posting automation vs manual at launch (Founders-Board).
- **D-POD-5** — does Jellypod's managed `POST /episodes/{id}/publish` (to Spotify/Apple/YouTube) get used, or do we self-publish via our own RSS to keep brand control + the QA gate authoritative? Rec: self-publish (Rule 6 + brand firewall).

*Design v0.1.0 — Jellypod API grounded against docs 2026-06-03. Implementation deferred to Tier-5 (Day-60) per ADR-0012; the Tier-3 audio path (§6.1) is usable independently and sooner.*
