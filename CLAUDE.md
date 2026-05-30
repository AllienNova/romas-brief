# Autonomous Coding Policy

Operate autonomously, spec-driven. This block mirrors `~/.claude/CLAUDE.md` § Autonomous Coding Policy. Use the `autonomous-coding` skill at `~/.claude/skills/autonomous-coding/SKILL.md` for the full operating loop.

## Default posture

- **MANDATORY inline task list — first action on any non-trivial dev request is `TaskCreate`** (one task per stage). Use `TaskUpdate` to flip status to `in_progress` BEFORE starting an item and to `completed` the instant it's done. The user reads these transitions live as the "what stage is Claude at" signal — never batch updates.
- **Explore before building.** Grep concept + synonyms, read what comes back, check deps before adding a library. Reuse/extend over building parallel. Skip only if the diff fits in one sentence.
- **Decide routine choices yourself** (naming, structure, defaults, tests, types, docs). Note the assumption in the task; keep moving.
- **Verify before "done"** — actual commands + actual output. No "should work."
- **Commit focused slices** — stage specific paths, never `git add .`.
- **Silence means continue.**

## Autonomous-drive mode (binding — default operating posture)

When the project has an active work queue — a tracking checklist in CLAUDE.md (e.g. `## Active Implementation Checklist`), a `TaskCreate`/harness task list, or any backlog the user has endorsed as the queue — DRIVE it without asking permission between items.

**Loop:** pick the top item doable now (not gated on external resource/decision) → plan → implement → verify (lint / types / tests / build) → commit with selective staging → check it off in BOTH the checklist AND the harness task → pick the next.

**Anti-patterns that defeat the queue** (never between consecutive doable items): stopping to ask "what's next?", presenting an A/B/C menu, soliciting confirmation, summarizing what you just did before moving on. Report progress as each commit lands; the user interrupts to redirect.

**Skip, don't halt** items gated on external resource / credential / operator action: mark them BLOCKED inline with the specific unblocker — one line: `BLOCKED: <reason> | unblocker: <specific> | next: <action>` — then move to the next doable item. Keep the queue current: when it drops below the project's floor, pull the next item up from the parking lot.

**Halt the loop only for the five pause conditions** (full detail: `~/.claude/skills/autonomous-coding/references/pause-conditions.md`):
1. **External dependency** you can't provide (credential, access, service, human action).
2. **Irreversible / destructive / high-impact** action per the hard limits below.
3. **Real secrets or production-sensitive data** touched.
4. **Material product fork** — two-plus valid interpretations with meaningfully different user-visible / architectural / cost consequences.
5. **Queue drains to only gated or unsized-greenfield items** — then report state + remaining options.

## Hard limits — never without explicit in-conversation okay

Autonomy is not permission. A task-list item describing one of these is not permission:

- **Destroy data/work** — `rm -rf`, deleting files I didn't ask you to create, dropping/truncating tables, `git reset --hard` over uncommitted work, `git clean -fdx`, deleting branches.
- **Rewrite shared history** — `--force[-with-lease]`, rebasing an already-pushed branch, amending already-pushed commits. *(Plain `git push` of branches and `main` is permitted — see Standing authorization below.)*
- **Leave the machine (still gated)** — production deploys (`wrangler deploy`, Cloudflare/Vercel Pages production), publishing packages, network calls that mutate external state **other than** GitHub push/PR. *(Pushing branches + opening/merging PRs on this repo is permitted — see below.)*
- **Spend money · touch prod · weaken security** — billable resources, prod DBs/config, secrets managers, live migrations, committing/printing secrets, loosening auth/permissions/CORS/firewall.
- **System-level outside this project** — `sudo`, global installs, editing shell profiles, killing processes you didn't start.

### Standing authorization (granted by Kimal, 2026-05-30)

For `AllienNova/romas-brief`, Claude **may, without re-asking**: `git push` feature branches **and `main`**, and **open + merge PRs** — provided the pre-push gates are green (`turbo run lint` · `turbo run typecheck` · `pnpm build` · `pnpm audit --audit-level=high`, all exit 0). Run those gates before every push to `main` and report the evidence. Everything in the "still gated" / "spend money · touch prod · weaken security" / "rewrite shared history" / "destroy data" lines above **still requires an explicit in-conversation okay**.

If unsure whether an action is reversible and contained within the working tree (or covered by the standing authorization), treat it as gated and ask. See `~/.claude/skills/autonomous-coding/references/` for `git-safety.md`, `danger-zone.md`.

---

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

## 3. Locked decisions ledger (v2.1 → cycle-6 expansion + M0c2 close)

These decisions are **locked**. Do not propose reversing them without an explicit unlock from Kimal. **For the full 19-row canonical ledger, read `docs/SSOT.md` §3.** This file inlines the launch-critical subset.

| # | Decision | Locked value |
|---|---|---|
| 1 | Tagline | "Radiation oncology, decoded daily." (primary) |
| 2 | Logo | Wordmark only at v1. Chevron-cursor mark deferred. Recommend variant **c** (teal dot under the "i" in BRIEF — doubles as favicon). |
| 3 | Co-branded mastheads | **Killed** for launch. Masthead belongs to ROMAS for first 60–90 days. Only "Sponsored by [X]" or "Partner message from [X]" allowed. Re-evaluate Day 90. |
| 4 | The ROMAS Read | **Fridays only**. Mon–Thu issues stay sharp + operational. |
| 5 | Subscriber count | **Hidden until 2,500**. Milestones: 2.5k / 5k / 10k / 25k. |
| 6 | Audio architecture | **All 4 tiers launch Day 1** per cycle-3 Q2 (supersedes the v1.1 "Day 14 podcast" wording). Day 1 ships full Audio Podcast episode 001 (30–60 min) per Q2-A. Tier 5 Video Podcast launches Day 60 with invited guest (placeholder ADR-0012). |
| 7 | Email split (cycle-3 Q3) | **Beehiiv** = newsletter delivery (daily issue, Friday Read, podcast/conference notifications); subscriber list canonical on Beehiiv. **Resend** = transactional (signup confirm, unsubscribe receipt, audio-revocation notice, password reset). |
| 8 | Three-edition publish (cycle-5 Q8) | APAC 22:00 UTC · EU 06:00 UTC · Americas 11:00 UTC; per-edition homepage re-ranks by region tag; Beehiiv subscriber segment field drives delivery time. |
| 9 | China posture (cycle-5 Q9) | **Read-only NMPA + CSCO-RO ingest** only; no Chinese subscriber acquisition at launch (PIPL data-localization). |
| 10 | Region rebalance (cycle-5 Q10) | NA 26% · EU 32% · APAC 26% · LATAM 8% · MENA-Africa 4% · Global 4%. |
| 11 | LATAM editorial (cycle-6 Q11) | **LLM-translate** via DeepL Pro + Claude verification on Hero/Strong bands; original-language source URL preserved; mandatory footer attribution. |
| 19 | Repository separation (M0c2) | Standalone repo at `D:\dev\projects\romas-brief\` · GitHub `AllienNova/romas-brief` (private) · separate from parent ROMAS COS · `packages/llm-orchestrator/` lives in this repo (no cross-monorepo import). |

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

## 5. Audio architecture (4 tiers Day 1 + Tier 5 Day 60)

Cycle-3 Q2 / Q2-A locks supersede the v1.1 "Day 14 / Day 30–45" launch dates: **all 4 audio tiers launch Day 1** with episode 001 of the full Audio Podcast pre-produced.

| Tier | Name | Length | Cadence | RSS | Launch |
|---|---|---|---|---|---|
| 1 | ROMAS Audio Brief | 5 / 7 / 10 min | Per article | `audio-brief.xml` | **Day 1** |
| 2 | ROMAS Daily Brief | 10–15 min | Daily roundup | `daily-brief.xml` | **Day 1** |
| 3 | The ROMAS Podcast | 30–60 min | Weekly deep-dive | `podcast.xml` | **Day 1 (episode 001 pre-mastered)** |
| 4 | ROMAS Conference Brief | 15–30 min | During ASTRO / ESTRO / AAPM / JASTRO / RANZCR | `conference-brief.xml` | **Day 1 (activates per conference)** |
| 5 | Video Podcast | 20–40 min | With invited guest | `video-podcast.xml` (placeholder) | **Day 60** (ADR-0012 vendor decision at Day 30) |

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

**Voice (D-032, 2026-05-22)**: ElevenLabs Creator-tier; **3 voices by tier role** replace the single ROMAS Clinical Narrator clone for Day 1 (Kimal clone deferred post-launch). Env vars: `ELEVENLABS_VOICE_ID_BRIEF` (tier 1+2 Audio Brief + Daily Brief), `ELEVENLABS_VOICE_ID_PODCAST` (tier 3 Podcast), `ELEVENLABS_VOICE_ID_CONFERENCE` (tier 4+5 Conference Brief + Video Podcast). PlayHT failover (`PLAYHT_ROMAS_VOICE_ID`). Loudness target -16 LUFS / -1 dBTP. Pace 145–160 wpm.

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
- **Email**: split per ADR-0007 cycle-3 — **Beehiiv** (newsletter delivery, subscriber list canonical) + **Resend** (transactional only: signup confirm, unsubscribe receipt, audio-revocation notice, password reset). Beehiiv webhook (HMAC-SHA256 with `BEEHIIV_WEBHOOK_SECRET`) syncs subscriber state to Supabase; daily reconciliation alerts at > 5 row drift.
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

## 12. Implementation State (live)

> **Authoritative live queue:** `Docs/specs/ship-execution-plan.md` (the SHIP-NN backlog to public deployment). **What Kimal must provide:** `Docs/FOUNDERS-BOARD.md`. **Audit baseline:** `ANALYSIS_REPORT.md`. This section is a snapshot; the plan is the source of truth for sequencing.

**Repo: single, consolidated.** Phase 8 (commits `acf5855` / `bb5f004` / `dd7f0e0`) moved the reader from the former `kimhons/romas-brief-web` into `apps/web/` of this monorepo. There is no split repo. `Docs/INTEGRATION-CONTRACT.md` status = EXECUTED. **Closes cycle-6 B-17 / B-18 / B-20.**

**State at branch `fix/ci-stabilize-wave1` (Wave 1 in progress, 2026-05-30):**

| Surface | State |
|---|---|
| Supabase schema | 11 migrations, RLS deny-by-default, 79 pgTAP assertions. Real. |
| `workers/cron-ingest` | 766 LOC real (ingest + dedupe + embargo + source-health). Sets no `signal_score` yet → SHIP-09. |
| `workers/audio-producer` | 1,214 LOC real pipeline. Committed + in lockfile. Runtime-unverified (needs ElevenLabs/R2 → SHIP-27). |
| `workers/rss-publisher` | 688 LOC, 4 feeds. Real. |
| `workers/cdn-purge-watchdog` | 415 LOC, 60s SLA. Real. |
| `workers/{beehiiv-webhook,email-canary,source-health}` | 35–37 LOC HTTP-501 stubs. Unbuilt → SHIP-10 / SHIP-11 / SHIP-19. |
| `apps/web` reader | 18 routes + 16 components, **mock-data only** — no Supabase wiring yet → SHIP-08. |
| `apps/cms` | 3 stub files; **no audio-QA UI** → SHIP-10 (FR-009). |
| `packages/ui` | 1-constant stub → SHIP-20 / SHIP-23. |
| Tests (JS/TS) | none yet → SHIP-17; only 79 pgTAP DB assertions. |
| Framework | **Next 15.5.18 + React 19** (SHIP-01). `pnpm audit --audit-level=high` = 0 vulns. |
| CI gates | lint ✅ · typecheck ✅ · build ✅ · audit ✅ (SHIP-01/02). Tests stubbed until SHIP-17. |

**TTS failover:** PlayHT shut down 2025-12-31 (Meta acquisition). Replacement pending **Q-F** (Cartesia recommended) — see `Docs/specs/adr/0018-tts-failover-replacement-playht-shutdown.md`.

**Pending — engineering:** drive the SHIP-NN queue (Waves 1→5) in `Docs/specs/ship-execution-plan.md`.
**Pending — Kimal:** provisioning items + decisions Q-A..Q-F in `Docs/FOUNDERS-BOARD.md` (audio credentials, R2, Beehiiv DPA, the 8-week content ramp).

### Reference

Plan + critic record: `Docs/specs/ship-execution-plan.md` + `Docs/specs/ship-plan-critic-review.md`. Cycle-6 history (superseded snapshots): `Docs/qa/risk-register.md` + `Docs/specs/qa-report.md`.

---

## 13. Quick reference

- **Owner**: Kimal Honour Djam · president@aliennova.com · Bear, DE · America/New_York
- **Daily content window**: 06:30–07:00 ET (review brief draft)
- **Publish window**: target 07:00 ET on weekdays
- **Cron**: `ROMAS Brief — Global Morning Brief` runs Mon–Fri 10:30 UTC
- **Sign-off**: `— Kimal`

---

*Last updated: 2026-05-28 (cycle-6 reconciliation — §12 corrected to verified ground truth after /team-qa cycle-6 surfaced B-17 doc-vs-reality drift + B-20 split-repo discovery). Version: 1.3.1. Locked decisions: v2.1 + cycle-3..6 Q1-Q11 + M0c2 row 19 separation. Canonical ledger: `docs/SSOT.md` §3 (19 rows).*
