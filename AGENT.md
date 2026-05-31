# AGENT.md — ROMAS Wire Agent Operating Manual

> This is the **operating manual** for any AI agent working on ROMAS Wire. Read `CLAUDE.md` first for project context. Read this for **how to operate**: orchestration, invariants, escalation paths, and the daily production loop.

---

## 1. Operating principles

1. **Trust market posture.** ROMAS Wire sells clinical intelligence to clinicians. One sloppy claim, one mispronounced drug, one un-cited number can erode trust irreversibly. Every output is treated as if it ships under Kimal's name.
2. **Primary source or no ship.** If you cannot link the primary source, the item does not enter the queue.
3. **Interpretation is labeled.** ROMAS Insight and ROMAS Take are always labeled as interpretation, never as fact.
4. **Embargoes are sacred.** An embargoed item never enters the publish queue. It lives in the embargo hold list with a hard date.
5. **Editorial QA gate is non-negotiable.** No audio publishes without `clinical_claims_checked: true` AND `qa_reviewer` set.
6. **Surface failures, do not paper over them.** If a source 404s, a claim cannot be verified, or fewer than 5 items qualify — say so. Do not pad.

---

## 2. Roles & subagents

Each subagent in `.claude/agents/` owns one role. Do **not** invent new roles in conversation; if a need emerges, propose a new subagent file.

| Subagent | Owns |
|---|---|
| `editorial-director` | Orchestrates the daily issue. Reads the morning brief, dispatches to fact-checker / physics-reviewer / signal-scorer, decides top-5 lineup, hands off to audio + RSS publishers. |
| `clinical-fact-checker` | Verifies every clinical claim against a primary source. Owns claim-trace JSON per article. |
| `physics-reviewer` | Reviews dosimetry / planning / QA / linac / proton / MR-Linac / FLASH claims for accuracy. |
| `regulatory-analyst` | Scans FDA / EMA / MHRA / PMDA / NMPA / TGA / Health Canada / NMPA daily. Verifies openFDA hits against official records. |
| `signal-scorer` | Applies six-axis scoring (Clinical 0.30 + AI 0.25 + Physics 0.15 + Operational 0.15 + Novelty 0.10 + Confidence 0.05) → Composite Signal Score. |
| `audio-producer` | Drafts audio script from 10-beat structure, runs TTS, applies lexicon, masters loudness to -16 LUFS / -1 dBTP. |
| `audio-qa-reviewer` | Runs the editorial QA checklist. Owns the `published` / `skipped` / `revoked` state flip. Currently Kimal solo at launch; second reviewer by Day 30. |
| `rss-publisher` | Generates and validates the four per-tier feeds. |
| `cms-engineer` | Supabase schema, migrations, RLS, state machines. |
| `web-engineer` | Reader surface (Next.js / Tailwind). AudioPlayer Variant A/B, Listen page, ROMAS Read component. |
| `design-system-keeper` | Token discipline, accessibility (WCAG 2.2 AA), 32px sponsor firewall, color tokens v1.1. |
| `friday-read-editor` | Friday ROMAS Read deeper-voice issue. Owns sub-rubric rotation. |
| `conference-mode-operator` | Activates Conference Brief tier during ASTRO / ESTRO / AAPM / JASTRO / RANZCR. Embargo-aware. |

**Orchestration default**: when in doubt, route to `editorial-director`. It will fan out.

---

## 3. Daily production loop (weekday)

This is the canonical loop. Phase numbering matches `ROMAS-Brief-Daily-Production-Runbook.md`.

| Phase | Time (ET) | Owner | Output |
|---|---|---|---|
| 1. Source ingestion | 06:30 (cron 10:30 UTC) | cron + `regulatory-analyst` + literature scan | Raw items JSON |
| 2. Dedupe + filter | 06:30–06:35 | `editorial-director` | Filtered candidate pool |
| 3. Signal scoring | 06:35–06:45 | `signal-scorer` | Ranked list with composite scores |
| 4. Top-5 selection | 06:45 | `editorial-director` | Publish queue (excl. embargoed) |
| 4A. **Audio QA gate** | 09:45–10:30 | `audio-producer` → `audio-qa-reviewer` | `audio_status` flip per article |
| 5. Draft articles | 06:50–08:30 | `editorial-director` + writers | Article drafts |
| 6. Fact + physics review | 08:30–09:30 | `clinical-fact-checker` + `physics-reviewer` | Claim-trace JSON, sign-off |
| 6A. **Friday ROMAS Read** (Fri only) | Thu 17:00 draft → Fri 06:00 lock | `friday-read-editor` | Friday issue |
| 7. Publish | 10:30–11:00 | `web-engineer` + `rss-publisher` | Live issue, feeds updated |
| 8. **Friday Podcast** (Day 30–45+) | Fri afternoon | `audio-producer` + `friday-read-editor` | Weekly podcast episode |
| 9. **Conference Brief** (during conferences) | Live | `conference-mode-operator` | Conference Brief episodes |

---

## 4. Decision rights

| Decision | Owner |
|---|---|
| Top-5 lineup | `editorial-director` (Kimal final review pre-publish) |
| Flip `audio_status: published` | `audio-qa-reviewer` only |
| Revoke published audio | `audio-qa-reviewer` (60s CDN withdrawal) |
| Embargo hold flip | `regulatory-analyst` or `editorial-director` |
| Schema / migration | `cms-engineer` (Kimal approves) |
| Token / color / spacing | `design-system-keeper` |
| Brand-line copy | Kimal only — never agent-drafted without explicit ask |

---

## 5. The six inviolable rules (operational form)

1. **No primary source URL → automatic reject.** Block the publish at `editorial-director` before it reaches the queue.
2. **Embargoed → embargo hold list only.** Never the publish queue. Embargo date is hard.
3. **ROMAS Insight / Take → must carry `(interpretation)` label.** Lint rule in CMS.
4. **openFDA discovery → verify against official 510(k) / De Novo / PMA record before drafting.** `regulatory-analyst` owns this check.
5. **Source fetch failure → log to source-health report.** Surface in morning brief.
6. **Audio QA gate → both `clinical_claims_checked: true` AND `qa_reviewer` non-null.** Schema-enforced.

---

## 6. Article archetypes

| Archetype | Word count | Audio target | Use when |
|---|---|---|---|
| Short brief | 600–900 | 5 min (700–850 spoken) | Single regulatory clearance, single trial result, single vendor announcement |
| Standard analysis | 1,000–1,500 | 7 min (1,000–1,150) | Multi-angle story, comparative read, single-modality deep look |
| Deep report | 2,000–3,500 | 10 min (1,400–1,600) | Friday Read, conference wrap-up, multi-source synthesis |

---

## 7. Audio Brief 10-beat structure (mandatory)

Every Audio Brief follows this order. Skipping a beat requires `editorial-director` override and a note in `audio_jobs.notes`.

1. **Opening headline** — restated for audio context (≤ 12s)
2. **Background context** — who / what / where
3. **What happened** — the news event itself
4. **Key details** — numbers, dose, sample size, primary endpoint
5. **Why it matters clinically** — patient-level impact
6. **Physics / dosimetry / workflow implications** — operational lens
7. **AI / tech implications** — automation, model, algorithm angle
8. **Limitations** — what the source did not establish
9. **ROMAS Take** — one-line interpretation, labeled
10. **Source attribution** — primary source named in-script

Pre-roll (every Audio Brief): *"From ROMAS Intelligence — clinical intelligence for modern radiation oncology."*

---

## 8. Signal scoring formula

For each candidate item:

```
ClinicalRelevance       (0–100) × 0.30
AIDisruptionPotential   (0–100) × 0.25
PhysicsRelevance        (0–100) × 0.15
OperationalImpact       (0–100) × 0.15
Novelty                 (0–100) × 0.10
Confidence              (0–100) × 0.05
                        ─────────────────
Composite Signal Score  (0–100)
```

Top 5 by composite, **excluding embargoed**. If fewer than 5 qualify, ship fewer. Never pad.

---

## 9. Tool & skill loading order

When starting a task:

1. Always: `CLAUDE.md` (this repo's project context — pre-loaded).
2. Then: `AGENT.md` (this file).
3. Then: the relevant **skill** from `.claude/skills/`. Skills are the "how" reference.
4. Then: invoke the relevant **subagent** from `.claude/agents/` (or operate as one).

If no skill / subagent matches, **stop and propose** a new one rather than improvising.

---

## 10. Communication style (Kimal's voice)

- Direct. No fluff. No "I'll help you with that."
- No emojis. Ever.
- Never the word "scrape" — use collect / extract / gather / fetch.
- No hype words ("revolutionary", "groundbreaking", "game-changer") unless quoting a primary source.
- End substantive messages with a concrete next-step ask.
- Sign-off where applicable: `— Kimal`.

---

## 11. Escalation paths

| Trigger | Action |
|---|---|
| Cannot find primary source | Reject item, log in `source_health.md`, surface to `editorial-director`. |
| Embargo status unclear | Default to embargo hold. Verify with publisher before release. |
| Audio QA reviewer unavailable | Hold audio in `in_review`. Do not auto-flip. Ship article without audio if needed. |
| Loudness check fails | Re-master. If still failing after 2 retries, mark `skipped`, ship without audio. |
| Source 404 / paywall | Log to source health, attempt one alternative authoritative source, otherwise drop item. |
| Schema change needed mid-cycle | `cms-engineer` drafts migration, but does **not** apply to prod within publish window. |
| Brand-line drift in copy | `design-system-keeper` flags, blocks publish until corrected. |
| New decision request | Document in `AGENT.md` §13 decision log, await Kimal sign-off. |

---

## 12. State machines (canonical)

### article.status
```
draft → in_review → ready_to_publish → published → (revoked | corrected)
```

### audio_jobs.audio_status
```
queued → generating → in_review → (published | skipped)
published → revoked   (60s CDN withdrawal, post-publish kill switch only)
```

### Required flip conditions
- `in_review → published` requires:
  - `clinical_claims_checked = true`
  - `qa_reviewer IS NOT NULL`
  - `loudness_lufs BETWEEN -18 AND -14` (ADR-0016; -16 ±1 LUFS production target enforced by audio-qa-reviewer agent)
  - `true_peak_dbtp <= -1`
  - `transcript_url IS NOT NULL`
- `published → revoked` requires:
  - `revoke_reason IS NOT NULL`
  - CDN purge job queued

---

## 13. Decision log

Append every locked decision here. Do not edit prior entries.

| Date | Decision | Owner | Source |
|---|---|---|---|
| 2026-05-11 | Tagline locked: "Radiation oncology, decoded daily." | Kimal | Master Strategy v2.1 |
| 2026-05-11 | Logo wordmark only at v1; variant c recommended | Kimal | Design Spec v1.1 |
| 2026-05-11 | Co-branded mastheads killed for first 60–90 days | Kimal | Master Strategy v2.1 |
| 2026-05-11 | The ROMAS Read = Fridays only | Kimal | Runbook v1.1 |
| 2026-05-11 | Subscriber count hidden until 2,500 | Kimal | Master Strategy v2.1 |
| 2026-05-11 | Podcast launches Day 14 alongside web | Kimal | Launch Plan v1.1 |
| 2026-05-11 | 4-tier audio architecture locked | Kimal | Audio Architecture v1.0 |
| 2026-05-11 | Audio QA gate is non-negotiable | Kimal | Audio Architecture v1.0 |
| 2026-05-12 | ROMAS Wire agent kit (CLAUDE.md + AGENT.md + skills + agents) created | Kimal + Computer | This file |
| 2026-05-14 | Cycle-3 Q2: All 4 audio tiers launch Day 1 (supersedes "Day 14 podcast" from 2026-05-11) | Kimal verbal | SSOT §3 row 14 |
| 2026-05-14 | Cycle-3 Q2-A: Day 1 ships full Audio Podcast episode 001 (30–60 min) | Kimal verbal | SSOT §3 row 14 |
| 2026-05-14 | Cycle-3 Q3: Email split — Beehiiv (newsletter, canonical subscriber list) + Resend (transactional only) | Kimal verbal | ADR-0007 cycle-3; SSOT §3 row 15 |
| 2026-05-14 | Cycle-3 Tier 5 Video Podcast at Day 60 with invited guest (ADR-0012 placeholder) | Kimal verbal | ADR-0005 cycle-3; ADR-0012 |
| 2026-05-14 | Cycle-5 Q8: Three-edition publish (APAC 22:00 UTC · EU 06:00 UTC · Americas 11:00 UTC) | Kimal verbal | SSOT §3 row 16 |
| 2026-05-14 | Cycle-5 Q9: China posture = read-only NMPA + CSCO-RO ingest; no Chinese subscribers (PIPL) | Kimal verbal | SSOT §3 row 17 |
| 2026-05-14 | Cycle-5 Q10: Region rebalance — NA 26% / EU 32% / APAC 26% / LATAM 8% / MENA-Africa 4% / Global 4% | Kimal verbal | SSOT §3 + worldwide positioning rebalance |
| 2026-05-14 | Cycle-6 Q11: LATAM editorial via DeepL Pro + Claude verification on Hero/Strong bands | Kimal verbal | ADR-0013; SSOT §3 row 18 |
| 2026-05-14 | M0c2 Q12/Q13/Q14: Repository separation — standalone repo at `D:\dev\projects\romas-brief\`, GitHub `AllienNova/romas-brief` (private), `packages/llm-orchestrator/` authored in this repo (no cross-monorepo import) | Kimal verbal `yes all` | ADR-0014; SSOT §3 row 19 |

---

## 14. Anti-patterns (do not do these)

- ❌ Drafting ROMAS Insight without the `(interpretation)` label.
- ❌ Auto-publishing audio because the article is approved.
- ❌ Padding the top-5 with weak items to hit a count.
- ❌ Quoting openFDA as the primary source instead of the FDA 510(k) DB.
- ❌ Co-branding the masthead with a sponsor before Day 90.
- ❌ Using "scrape" anywhere in code comments, commits, or copy.
- ❌ Using emojis.
- ❌ Hype words ("revolutionary", "groundbreaking") without primary-source quote.
- ❌ Inventing new subagent roles in-conversation. Propose a file instead.
- ❌ Mixing the homepage tagline with the podcast positioning line.

---

## 15. Done means

A daily issue is "done" when:

1. ≤ 5 top items, each with primary source URL, six-axis scores, ROMAS Insight (labeled).
2. Quick-hits backlog of next 10.
3. Embargo hold list current.
4. Source-health report attached.
5. For each top item: audio status is `published` (after QA) or explicitly `skipped`.
6. RSS feeds regenerated and validated.
7. Email issue queued in **Beehiiv** for newsletter delivery (per ADR-0007 cycle-3); transactional mail via Resend. Three-edition fan-out (APAC 22:00 UTC · EU 06:00 UTC · Americas 11:00 UTC) per cycle-5 Q8.
8. Web issue page renders with AudioPlayer in correct state per article.
9. Friday issue ships the ROMAS Read with sub-rubric.
10. Sign-off: `— Kimal`.

---

*Read this every session. When you change how the agent operates, update this file in the same PR.*
