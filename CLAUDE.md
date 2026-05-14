# CLAUDE.md — ROMAS Brief

> This file is loaded into Claude Code's context for every session in this repo. It is the **single source of truth** for project intent, invariants, and decision lineage. Keep it lean. Detailed playbooks live in `AGENT.md`, `.claude/skills/`, and `.claude/agents/`.
>
> **Repo identity (locked 2026-05-14):** Standalone git repo at `D:\dev\projects\romas-brief\` · GitHub `aliennova/romas-brief` (private) · separate from parent ROMAS COS monorepo. No cross-monorepo imports — `packages/llm-orchestrator/` lives in this repo. See `docs/SSOT.md` §3 row 19 + `Docs/specs/adr/0014-repository-separation.md`.

---

## 1. What ROMAS Brief is

ROMAS Brief is the **public media surface of ROMAS Intelligence**, sitting under the ROMAS ecosystem whose core platform is ROMAS COS — the AI-Native Clinical Operating System for Radiation Oncology.

- **Audience**: radiation oncologists, medical physicists, dosimetrists, RT therapists, residents, oncology operators, industry.
- **Cadence**: Mon–Fri daily issue. Friday issue is **The ROMAS Read** (deeper voice-of-authority).
- **Article archetypes**: Short brief 600–900 words · Standard analysis 1,000–1,500 · Deep report 2,000–3,500.
- **Audio**: every article gets audio **only after editorial QA passes**. Four tiers (see §5).
- **Owner**: Kimal Honour Djam (president@aliennova.com). Sign-off: `— Kimal`.

---

## 2. Brand positioning (do not drift)

**Primary tagline**: *Radiation oncology, decoded daily.*
**Secondary**: *Clinical intelligence for modern radiation oncology.*
**Positioning line (podcast pre-roll close only)**: *Not headlines. Clinical intelligence.*

Never use the positioning line as a homepage tagline. Never use emojis in copy. Never use the word "scrape" — prefer collect / extract / gather / fetch.

---

## 3. Locked decisions ledger (v2.1)

These six decisions are **locked**. Do not propose reversing them without an explicit unlock from Kimal.

| # | Decision | Locked value |
|---|---|---|
| 1 | Tagline | "Radiation oncology, decoded daily." (primary) |
| 2 | Logo | Wordmark only at v1. Chevron-cursor mark deferred. Recommend variant **c** (teal dot under the "i" in BRIEF — doubles as favicon). |
| 3 | Co-branded mastheads | **Killed** for launch. Masthead belongs to ROMAS for first 60–90 days. Only "Sponsored by [X]" or "Partner message from [X]" allowed. Re-evaluate Day 90. |
| 4 | The ROMAS Read | **Fridays only**. Mon–Thu issues stay sharp + operational. |
| 5 | Subscriber count | **Hidden until 2,500**. Milestones: 2.5k / 5k / 10k / 25k. |
| 6 | Podcast | Day 14 with web. Audio-first. No video studio. |

Sponsor firewall: **no sponsor logo within 32px of the ROMAS Brief wordmark**.

---

## 4. The six inviolable rules

1. **No primary source URL → no publish.** Every clinical claim traces to a primary source.
2. **Embargoed items never enter the publish queue.** Surface them in the embargo hold list only.
3. **ROMAS Insight / ROMAS Take is always labeled as interpretation**, never as fact.
4. **Verify openFDA discoveries against the official FDA 510(k) / De Novo / PMA record before drafting.**
5. **If a source fails to fetch, surface it in source health.** Do not silently drop.
6. **No audio goes live without editorial QA pass.** `clinical_claims_checked: true` AND `qa_reviewer` set are required to flip `audio_status` from `in_review` → `published`.

---

## 5. Audio architecture (4 tiers)

| Tier | Name | Length | Cadence | RSS |
|---|---|---|---|---|
| 1 | ROMAS Audio Brief | 5 / 7 / 10 min | Per article | `audio-brief.xml` |
| 2 | ROMAS Daily Brief | 10–15 min | Daily roundup (launches Day 14) | `daily-brief.xml` |
| 3 | The ROMAS Podcast | 30–60 min | Weekly deep-dive (launches Day 30–45) | `podcast.xml` |
| 4 | ROMAS Conference Brief | 15–30 min | During ASTRO / ESTRO / AAPM / JASTRO / RANZCR | `conference-brief.xml` |

**Article → audio length mapping**: Short brief → 5 min (700–850 spoken words) · Standard → 7 min (1,000–1,150) · Deep report → 10 min (1,400–1,600).

**Audio Brief 10-beat content structure (mandatory)**:
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

**Voice**: ROMAS Clinical Narrator. ElevenLabs primary (env: `ELEVENLABS_ROMAS_VOICE_ID`), PlayHT clone failover. Loudness target -16 LUFS / -1 dBTP. Pace 145–160 wpm.

**Audio QA state machine**: `in_review` → (`published` | `skipped`); `published` → `revoked` (post-publish kill switch; 60s CDN withdrawal).

**Audio Brief pre-roll**: "From ROMAS Intelligence — clinical intelligence for modern radiation oncology."
**Podcast post-roll**: "Not headlines. Clinical intelligence."

---

## 6. Companion docs (read before substantive work)

All files live alongside this CLAUDE.md. Load the relevant one(s) before editing related code.

| Doc | When to read |
|---|---|
| `ROMAS-Brief-Design-Specification.md` (v1.1) | Any UI / component / token / color / typography work |
| `ROMAS-Brief-Audio-Architecture.md` (v1.0) | Any audio pipeline / TTS / RSS / lexicon / QA gate work |
| `ROMAS-Brief-Daily-Production-Runbook.md` (v1.1) | Editorial workflow, phase timing, QA gates |
| `ROMAS-Brief-500-Article-Launch-Plan.md` (v1.1) | Audio ramp schedule, readiness gates, launch checklist |
| `ROMAS-Brief-Master-Strategy.md` (v2.1) | Strategy questions, ledger of locked decisions |

---

## 7. Tech stack (defaults — do not invent alternatives)

- **Runtime**: TypeScript (strict). Node 20+ for workers / scripts.
- **DB / auth**: Supabase (Postgres + RLS + Auth). Migrations in `supabase/migrations/`.
- **Edge / CDN**: Cloudflare Workers + R2 + Pages.
- **Storage**: R2 buckets — `romas-audio-archive` (private WAV master) and `romas-audio-cdn` (public MP3 via CDN).
- **TTS**: ElevenLabs (primary) + PlayHT (failover).
- **CMS surface**: Internal Next.js app on Cloudflare Pages.
- **Reader surface**: Next.js + Tailwind on Cloudflare Pages.
- **Search**: Postgres full-text + pgvector for embeddings.
- **Email**: Resend (or Postmark) for issue delivery.
- **Analytics**: Plausible (privacy-first).

Color tokens (added v1.1):
```
--rb-audio-published: #00B4C6;
--rb-audio-pending:   #F59E0B;
--rb-audio-skipped:   #94A3B8;
```

---

## 8. Editorial style invariants

- **Tone**: direct, operational Mon–Thu. Voice-of-authority Friday.
- **ROMAS Insight / ROMAS Take**: one line, ≤ 240 chars, labeled `— ROMAS Insight (interpretation)` or `— ROMAS Take`.
- **Headlines**: ≤ 90 chars.
- **No emojis. No "scrape." No hype words ("revolutionary", "game-changer", "groundbreaking") without primary-source backing.**
- **Sign-off**: `— Kimal` (em-dash + first name only).
- **Friday ROMAS Read sub-rubrics** (rotating): The Week in Receipts · Five Things That Shifted · What I Got Wrong · Watch Next Week.
- **Subscriber count copy**: < 2,500 → qualitative ("Built for radiation oncologists, physicists, dosimetrists, therapists, and oncology leaders."). ≥ 2,500 → show count.

---

## 9. Source domains (canonical scope)

Use the global ROMAS Brief cron source list (Mon–Fri 10:30 UTC). Categories: Literature & Evidence · Regulatory (multi-jurisdiction) · Societies & Guidelines · Reimbursement & Policy · Vendors · Conferences & Embargoes. Full list lives in the active cron task spec — refer to it before adding ingestion endpoints.

---

## 10. Subagent + skill index

Subagents (`.claude/agents/`):

- `editorial-director` — top-level orchestrator for daily issue production
- `clinical-fact-checker` — primary-source verification + claim trace
- `physics-reviewer` — dosimetry / planning / QA claim review
- `regulatory-analyst` — FDA / EMA / MHRA / PMDA / NMPA scanning
- `signal-scorer` — six-axis scoring + composite Signal Score
- `audio-producer` — TTS generation + loudness + lexicon application
- `audio-qa-reviewer` — editorial QA gate operator
- `rss-publisher` — per-tier feed generator
- `cms-engineer` — Supabase schema + migrations
- `web-engineer` — reader surface + AudioPlayer / Listen page
- `design-system-keeper` — token / component / accessibility guard
- `friday-read-editor` — ROMAS Read deeper-voice issue
- `conference-mode-operator` — ASTRO / ESTRO / AAPM live-mode

Skills (`.claude/skills/`):

- `editorial-style-guide` — voice, headlines, ROMAS Insight format
- `audio-production-pipeline` — full TTS pipeline + QA gate operator
- `audio-qa-checklist` — the reviewer form
- `pronunciation-lexicon` — 30-entry seed + expansion rules
- `rss-feed-spec` — per-tier feed structure
- `cms-schema` — Supabase schema for articles + audio_jobs
- `design-tokens` — color / spacing / type tokens (v1.1)
- `component-library` — AudioPlayer, SponsorBlock, ROMAS Read, AudioStatus
- `signal-scoring` — six-axis + composite formula
- `source-ingestion` — global RT source list + dedupe rules
- `embargo-handling` — embargo-hold list discipline
- `friday-read-format` — sub-rubric rotation + structure
- `conference-brief-mode` — embargo-aware live-mode
- `claim-verification` — primary-source citation discipline

---

## 11. How to work in this repo

1. **Read `AGENT.md` next.** It defines orchestration, invariants, escalation.
2. **Then load the relevant skill** from `.claude/skills/` for the task at hand.
3. **Invoke a subagent** from `.claude/agents/` for any task that maps to a defined role. Do not improvise roles.
4. **Never bypass the QA gate.** No audio ships without `audio_qa_reviewer.approve`.
5. **Never ship without a primary source URL.** Period.
6. **When stuck, surface the blocker** — do not pad with weak items or speculation.

---

## 12. Quick reference

- **Owner**: Kimal Honour Djam · president@aliennova.com · Bear, DE · America/New_York
- **Daily content window**: 06:30–07:00 ET (review brief draft)
- **Publish window**: target 07:00 ET on weekdays
- **Cron**: `ROMAS Brief — Global Morning Brief` runs Mon–Fri 10:30 UTC
- **Sign-off**: `— Kimal`

---

*Last updated: 2026-05-12. Version: 1.1.0. Locked decisions: v2.1.*
