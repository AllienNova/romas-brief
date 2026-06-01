---
title: ROMAS Wire — Single Source of Truth
version: 1.4.0
date: 2026-05-31
owner: Kimal Honour Djam (president@aliennova.com)
supersedes: v1.0.0 (initial); v1.1.0 (cycle-3 Q1/Q2/Q3 locks)
audience: every Claude session, every team-build / team-qa run, every human contributor
cycles: 1 (initial) → 2 (critic fixes) → 3 (Kimal Q1/Q2/Q3 + email split + Tier 5 video) → 4 (launch posture §12) → 5 (worldwide rebalance + 3-edition + China) → 6 (LATAM LLM-translate)
---

# ROMAS Wire — Single Source of Truth

> When two documents disagree, **this file wins**. Update this file before resolving the conflict in any other doc. All decisions in this SSOT are either *Locked* (Kimal-approved) or *Hypothesis* (proposed default awaiting Kimal confirmation — flagged inline).

---

## 1. Identity

| Field | Value |
|---|---|
| Product name | **ROMAS Wire** *(renamed from `ROMAS Brief` on 2026-05-31 — reverting to the original Wire name; brand/display done, code identifiers + `romasbrief.com` domain + repo = gated phase-2. A "RADONC WIRE" variant was floated earlier — NOT adopted; confirm with Kimal before any further name change.)* |
| Position in ecosystem | Public media surface of **ROMAS Intelligence**, sitting under **ROMAS** (the parent ecosystem whose clinical OS is **ROMAS COS**) |
| Primary tagline | **"Radiation oncology, decoded daily."** *(locked — CLAUDE.md §2, AGENT.md §13 line 205)* |
| Secondary tagline | "Clinical intelligence for modern radiation oncology." *(use in pre-roll + about pages only — never as homepage)* |
| Podcast post-roll only | "Not headlines. Clinical intelligence." *(Tier 3 podcast post-roll exclusively — never homepage, never Audio Brief)* |
| Owner | Kimal Honour Djam · president@aliennova.com · America/New_York |
| Sign-off | `— Kimal` (em-dash + first name, no surname) |
| Audience | Radiation oncologists, medical physicists, dosimetrists, RT therapists, residents, oncology operators, RT industry |
| Cadence | **Twice weekly** (decision 20, 2026-05-31) — Tue (brief) + Fri (The ROMAS Read). Launch ships the 500-article scaffold; 2×/week governs ongoing publishing. *(Supersedes "Mon–Fri daily.")* |
| Retired brand | **"ROMAS Brief"** — reverted to ROMAS Wire 2026-05-31; **do not use "ROMAS Brief" in any new asset**. (The original `ROMAS-Wire-*` strategy files in `Docs/ARCHIVE/` are the predecessor — ROMAS Wire is now the canonical name again.) |

---

## 2. The six inviolable rules (canonical wording)

These six are inviolable. CLAUDE.md §4, AGENT.md §5, this file, and every operational doc must list **all six** in this exact wording. Master-Strategy and Runbook lists with fewer than six are wrong and must be updated (Finding H-08, addressed in M0).

1. **No primary source URL → no publish.** Every clinical claim traces to a primary source.
2. **Embargoed items never enter the publish queue.** Surface in the embargo hold list only.
3. **ROMAS Insight / ROMAS Take is always labeled as interpretation**, never as fact.
4. **Verify openFDA discoveries against the official FDA 510(k) / De Novo / PMA record before drafting.** openFDA is discovery only.
5. **If a source fails to fetch, surface it in source health.** Do not silently drop.
6. **No audio goes live without editorial QA pass.** Requires `clinical_claims_checked = true` AND `qa_reviewer` set; schema-enforced.

---

## 3. Locked decisions ledger v2.1 (canonical)

| # | Decision | Locked value | Source |
|---|---|---|---|
| 1 | Tagline | "Radiation oncology, decoded daily." | Master Strategy v2.1, CLAUDE.md §2 |
| 2 | Logo | Wordmark only at v1; chevron-cursor mark deferred; recommend variant **c** (teal dot under "i" in BRIEF, doubles as favicon) | Design Spec v1.1 |
| 3 | Co-branded mastheads | **Killed** for first 60–90 days. Masthead belongs to ROMAS. Only "Sponsored by [X]" or "Partner message from [X]" allowed. Re-evaluate Day 90. | Master Strategy v2.1 |
| 4 | The ROMAS Read | **Fridays only.** Mon–Thu issues stay sharp + operational. | Runbook v1.1 |
| 5 | Subscriber count | **Hidden until 2,500.** Milestones: 2.5k / 5k / 10k / 25k. | Master Strategy v2.1 |
| 6 | Audio tiers + Video tier | **LOCKED 2026-05-14 by Kimal.** **All four audio tiers (Audio Brief / Daily Brief / Audio Podcast / Conference Brief — all via ElevenLabs primary + PlayHT failover) launch Day 1.** First Audio Podcast episode cadence: **TBD pending Kimal Q2-A**. **New Tier 5 — Video Podcast with invited human guest — launches Day 60 (~2 months post-launch).** SUPERSEDES the prior Day-14 / Day-30-45 staggered hypothesis and CLAUDE.md §3 row 6 conflated wording. MASTER_IMPLEMENTATION_PLAN restructures M3/M4/M5/M6 accordingly: M2 expands to cover all 4 audio tiers from Day 1; new M6.5 covers Video Podcast scaffolding (video studio, guest booking, recording, editing, hosting, `video-podcast.xml`); product-spec FR-W-002 "video / livestream out of scope" is reversed for Tier 5 only. | Kimal verbal lock 2026-05-14 |
| 7 | Email platform | **Resend + Beehiiv (split by function), LOCKED 2026-05-14 by Kimal**. Beehiiv = daily issue + Friday Read + podcast notifications (newsletter surface, free tier ≤2,500 subscribers matches SSOT row 5 threshold). Resend = transactional (signup confirmation, unsubscribe receipt, audio-revocation notices, password reset). Supabase `subscribers` table syncs with Beehiiv via webhooks. ADR-0007 restructured cycle-2. | Kimal verbal lock 2026-05-14 |
| 8 | Sponsor firewall | **No sponsor logo within 32px of the ROMAS Wire wordmark.** | Master Strategy v2.1 |
| 9 | Voice | **D-032 (2026-05-22)**: 3 ElevenLabs Creator-tier voices by tier role — `ELEVENLABS_VOICE_ID_BRIEF` (tier 1+2), `ELEVENLABS_VOICE_ID_PODCAST` (tier 3), `ELEVENLABS_VOICE_ID_CONFERENCE` (tier 4+5). PlayHT failover (`PLAYHT_ROMAS_VOICE_ID`). Kimal voice clone deferred post-launch. | Audio Architecture v1.0 §2.1 + D-032 |
| 10 | Audio architecture | 4-tier lock (Audio Brief 5/7/10 min · Daily Brief 10-15 min · Podcast 30-60 min · Conference Brief 15-30 min) | Audio Architecture v1.0 |
| 11 | Audio QA gate | Non-negotiable. Schema-enforced via `audio_publish_requires_qa` CHECK constraint (`.claude/skills/cms-schema.md:96-103`) | Audio Architecture v1.0 |
| 12 | Loudness target | -16 LUFS integrated, -1 dBTP true peak. DB publish gate widened to -18 to -14 LUFS per ADR-0016; -16 ±1 LUFS production target enforced by audio-qa-reviewer agent (not at the DB). | Audio Architecture v1.0 + ADR-0016 |
| 13 | Pace | 145–160 wpm | Audio Architecture v1.0 |
| 14 | HIPAA posture | **Not triggered.** No PHI ingested, processed, or logged anywhere in scope. ToS must carry an explicit "No PHI" clause. | Master Strategy v2.1 §7.1 |
| 15 | **Worldwide positioning (locked 2026-05-14 by Kimal)** | **NA-bias rejected.** Region distribution rebalanced: US 110 (22%) · Canada 20 (4%) · Europe 160 (32%) · APAC 130 (26%) · LATAM 40 (8%) · MENA/Africa 20 (4%) · Global 20 (4%). Supersedes Launch Plan v1.1 §2.2. Top Stories grid quota: max 2 of 6 cards from the same region. Date format honors reader locale via `Intl.DateTimeFormat`. | Kimal verbal 2026-05-14 |
| 16 | **Three-edition publish strategy (locked 2026-05-14 by Kimal)** | Three publish times serving region morning windows: **APAC edition 22:00 UTC (prior-day)** for JST/AEDT/IST/CST · **EU/UK edition 06:00 UTC** for BST/CET/EEST · **Americas edition 11:00 UTC** for ET/CT/PT/BRT. Same canonical article inventory; per-edition homepage re-ranks by region tag. Beehiiv subscriber segmentation by `region` custom field drives delivery time. Audio reuse: same Audio Brief / Daily Brief / Podcast assets across editions (no triple production). | Kimal verbal 2026-05-14 |
| 17 | **China posture (locked 2026-05-14 by Kimal)** | **Read-only NMPA + CSCO-RO ingest only.** No Chinese subscriber acquisition, no Beehiiv list serving China at launch (PIPL data-localization makes it expensive to serve correctly). Revisit at 10k global subscribers. Source citations to NMPA records honored per Rule 4. | Kimal verbal 2026-05-14 |
| 18 | **LATAM editorial workflow (locked 2026-05-14 by Kimal)** | **LLM-translate via DeepL Pro primary + Claude verification on Hero/Strong bands.** Original-language (PT/ES) source URL preserved as `primary_source_url`. Article body in English. Mandatory non-removable footer: "Source originally in {Portuguese\|Spanish}; translated with editorial review." Verbatim quotes show original-language text in italic parens. ADR-0013 + `contracts/deepl.yaml`. | Kimal verbal 2026-05-14 |
| 19 | **Repository separation (locked 2026-05-14 by Kimal)** | ROMAS Wire is its **own standalone git repository** at **`D:\dev\projects\romas-brief\`** (lowercase, hyphen, no spaces — matches `romasbrief.com` canonical). GitHub identity: **`AllienNova/romas-brief` (private)** — note `AllienNova` uses double-L spelling per the actual GitHub org (description "Building Things People Want — AI, Healthcare, Fintech, Education"). Separate from parent ROMAS COS monorepo at `D:\dev\projects\ROMAS\`. No cross-monorepo imports. `llm-orchestrator` lives at **`packages/llm-orchestrator/` inside ROMAS Wire monorepo** (authored fresh, not imported from parent ROMAS) — closes cycle-6 REL-010. ADR-0014. | Kimal verbal 2026-05-14 (`yes all`); casing patched 2026-05-15 M0c2 |
| 20 | **Publishing cadence — TWICE WEEKLY (locked 2026-05-31 by Kimal, cycle-7)** | **SUPERSEDES "Mon–Fri daily."** Two issues per week — the validated vertical-Wire cadence (The Imaging Wire ships Mon + Thu). Recommended days: **Tuesday = operational brief · Friday = The ROMAS Read** (deeper voice-of-authority); days adjustable. **Launch still ships the full 500-article scaffold** (§12) — the 2×/week cadence governs *ongoing* publishing post-launch and roughly halves the editorial treadmill vs daily. Three-edition publish (row 16) fires on the 2 publish days. Updates CLAUDE.md §1, Runbook, Launch Plan §3. | Kimal 2026-05-31 (Imaging Wire template review) |
| 21 | **Audio distribution — EMAIL + PHONE/SMS (locked 2026-05-31 by Kimal, cycle-7)** | Audio is the differentiator (The Imaging Wire has none). Each issue's audio is pushed **to email** (inline/linked player in the Beehiiv issue) **AND to phone via SMS** with a one-tap listen link — the commute use case ("listen on the way to work"). Requires: an **SMS provider** (new — e.g. Twilio; needs ADR + a `P-NN` provisioning item) + an **opt-in `phone` + SMS-consent field on `subscribers`** (TCPA: explicit opt-in, STOP/HELP handling, quiet hours). RSS/podcast feeds (§4) remain. | Kimal 2026-05-31 |
| 22 | **Per-article thumbnail required (locked 2026-05-31 by Kimal, cycle-7)** | Launch parity with The Imaging Wire's thumbnail-per-story scannability: every one of the 500 launch articles ships with a thumbnail. **Content-ramp deliverable** (Launch Plan / P-21) — reader cards + `next/image` (AVIF/WebP) already wired (SHIP-24a); needs the assets + `articles.thumbnail_url` populated. | Kimal 2026-05-31 |
| 23 | **Comms / marketing / customer-ops → agentic framework (DIRECTION set 2026-05-31 by Kimal; framework Q-G pending)** | The site + customer + communications operations layer — **SMS, email, marketing, lifecycle, customer ops** — will be **commissioned on an agent framework: Q-G RESOLVED 2026-05-31 → OpenClaw** (Mastra rejected), NOT bespoke per-channel workers. **Security is a first-class requirement** — OpenClaw must be hardened: least-privilege scoped credentials per channel, no standing secrets in agent context, signed/audited tool calls, PII minimization (TCPA/CAN-SPAM/GDPR), egress allow-listing, and human-approval gates on any send to real subscribers. **Refinement from the 2026-06-01 docs-read (ADR-0020 / threat model §1):** OpenClaw assumes a **single-operator trust boundary per gateway** ("not designed for hostile multi-tenant isolation"), so **customer-ops is operator-mediated** — subscribers never DM the gateway; customer inbound flows through a controlled support queue, the agent drafts, a human approves the send. Not a public-facing bot. Integration is a separate commissioned effort with its own ADR; **per rule 11, read OpenClaw's official docs + threat-model it before wiring** (verify the framework + its security model first). **Operating model:** a **24/7 autonomous marketing + customer-ops team** (OpenClaw agents) running **intelligent multi-LLM routing + cost optimization** — per-task routing across the gateway tiers (**Vercel AI Gateway primary → OpenRouter fallback**, per `~/.claude/AI-PROVIDERS.md`): cheap Tier-1 (Gemini Flash-Lite / DeepSeek) for classification, drafting, list segmentation; escalate to reasoning tiers only when warranted; target **60–70% volume on Tier-1**. Every send to a real subscriber stays behind a human-approval / policy gate (security note above). **Implications:** (a) decision-21 **SMS audio delivery** is owned by this agent layer (the audio pipeline produces the asset + a listen URL; the agent layer handles SMS/email send, consent, scheduling) — do NOT build a bespoke SMS worker yet. (b) The existing `beehiiv-webhook` (SHIP-11) + Resend `email-canary` (SHIP-12) workers become **candidate-subordinate** to / wrapped by the agent layer — keep as the transport primitives, but orchestration moves up. (c) Architecture + security model (S1–S10) + LLM-routing design captured in **ADR-0020** (Status: Proposed pending docs-read; Q-G recorded there). Two findings from framework verification: **SMS + email are NOT native OpenClaw channels** (SMS → Twilio-class tool; email → existing Resend worker), and **OpenClaw does not itself do cost-routing** — so OpenClaw's LLM `base_url` points at the **Vercel AI Gateway**, which owns routing + cost-opt + spend caps. ADR-0020 carries a verification-debt list to clear before integration. **Still bespoke ENG (NOT the agent layer):** content/SEO infra — `thumbnail_url` (dec 22), Google News sitemap + Publisher Center (§12.8). | Kimal 2026-05-31 |

---

## 4. Audio architecture (canonical 4-tier)

| Tier | Name | Length | Cadence | RSS feed | Launch day |
|---|---|---|---|---|---|
| 1 | ROMAS Audio Brief | 5 / 7 / 10 min | Per article | `audio-brief.xml` | **Day 1** (Kimal-locked 2026-05-14) |
| 2 | ROMAS Daily Brief | 10–15 min | Daily roundup | `daily-brief.xml` | **Day 1** (Kimal-locked 2026-05-14) |
| 3 | ROMAS Audio Podcast (ElevenLabs) | 30–60 min | Weekly deep-dive | `podcast.xml` | **Day 1** — full 30–60 min episode 001 + RSS live (Kimal-locked Q2-A option (a), 2026-05-14) |
| 4 | ROMAS Conference Brief | 15–30 min | During ASTRO / ESTRO / AAPM / JASTRO / RANZCR | `conference-brief.xml` | **Day 1** feed live; first activation per conference |
| 5 | ROMAS Video Podcast (with invited guest) | 30–60 min | Weekly or bi-weekly (TBD) | `video-podcast.xml` (new) | **Day 60** (Kimal-locked 2026-05-14) |

**Article → audio length mapping** (canonical, consistent across CLAUDE.md §5, AGENT.md §7, audio-production-pipeline skill):
- Short brief (600–900 words) → 5 min audio (700–850 spoken words)
- Standard analysis (1,000–1,500 words) → 7 min audio (1,000–1,150 spoken words)
- Deep report (2,000–3,500 words) → 10 min audio (1,400–1,600 spoken words)

**Audio Brief 10-beat structure** — mandatory order:
1. Opening headline · 2. Background context · 3. What happened · 4. Key details · 5. Why it matters clinically · 6. Physics / dosimetry / workflow implications · 7. AI / tech implications · 8. Limitations · 9. ROMAS Take · 10. Source attribution.

Skipping a beat requires explicit `editorial-director` override + note in `audio_jobs.notes`.

**Pre-roll** (every Audio Brief): *"From ROMAS Intelligence — clinical intelligence for modern radiation oncology."*
**Podcast post-roll** (Tier 3 only): *"Not headlines. Clinical intelligence."*

**Distribution (cycle-7, decision 21 — audio is the moat):** beyond the RSS feeds above, each issue's audio is delivered **to email** (inline/linked player in the Beehiiv issue) **and to phone via SMS** (one-tap listen link) for the commute use case. Requires an SMS provider (e.g. Twilio; new ADR + `P-NN`) + `subscribers.phone` + SMS-consent (TCPA opt-in / STOP / quiet hours).

---

## 5. Tech stack (locked — do not reopen without an ADR)

| Layer | Choice | ADR |
|---|---|---|
| Language | TypeScript strict, Node 20+ for workers/scripts | — |
| Monorepo | pnpm workspaces + Turborepo *(hypothesis)* | ADR-0001 |
| DB / auth | Supabase (Postgres 15 + RLS + Auth) | ADR-0002 |
| Edge / CDN / storage | Cloudflare Workers + Pages + R2 (2 buckets: `romas-audio-archive` private + `romas-audio-cdn` public) | ADR-0003 |
| TTS | ElevenLabs primary + PlayHT failover | ADR-0004 |
| Transcripts | Whisper large-v3 | — |
| Email | Resend | ADR-0007 *(new)* |
| Reader + CMS surface | Next.js 14 + Tailwind on Cloudflare Pages | — |
| Search | Postgres full-text + pgvector | — |
| Analytics | Plausible (cookieless) | — |
| Observability | Cloudflare Workers Analytics Engine + Sentry *(hypothesis)* | ADR-0008 *(new)* |
| Loudness | ffmpeg `loudnorm` two-pass | — |
| RSS validation | xmllint + iTunes/podcast namespace + custom embargo lint | — |
| Testing | Vitest (unit + integration) + Playwright (E2E + visual) + pgTAP (schema constraints) | ADR-0009 *(new)* |
| CI/CD | GitHub Actions → Cloudflare (OIDC if supported, fallback to short-lived token) + Supabase CLI | ADR-0010 *(new)* |

Rejected alternatives are documented in each ADR.

---

## 6. Source domains (canonical inventory location)

The canonical source list lives at **`.claude/skills/source-ingestion.md`** (promoted by this SSOT — resolves Finding C-07). Categories:

- **Literature**: PubMed, Cochrane Library, IJROBP, Red Journal, Practical Radiation Oncology
- **Regulatory**: FDA 510(k) DB + De Novo + PMA, EMA, MHRA, PMDA, NMPA, TGA, Health Canada
- **Society / guidelines**: ASTRO, ESTRO, AAPM, JASTRO, RANZCR, ASCO, ESMO, NCCN
- **Reimbursement / policy**: CMS, NICE, Cochrane HTA
- **Vendors**: Varian, Elekta, Accuray, RaySearch, ViewRay, IBA, Mevion, Limbus AI, others (press releases as discovery)
- **Conferences**: ASTRO, ESTRO, AAPM, JASTRO, RANZCR (embargo-aware)
- **Preprints**: medRxiv, arXiv (q-bio.NC, physics.med-ph)

**Rule 4 reinforcement**: openFDA is **discovery only**. EUDAMED workaround (Launch Plan §7 listing `meddeviceguide.com` / `MDCG.eu`) is **revoked by this SSOT** — fallback chain must stay official (EUDAMED API → NB-OG register → MDCG official PDF; never secondary sites as primary).

---

## 7. State machines (canonical)

### `articles.status`
```
draft → in_review → ready_to_publish → published → (revoked | corrected)
```

### `audio_jobs.audio_status`
```
queued → generating → in_review → (published | skipped)
published → revoked   (60s CDN withdrawal, post-publish kill switch only)
```

**`in_review → published`** requires (all **five**, schema-enforced per `contracts/supabase-schema.sql:123-130`):
- `clinical_claims_checked = true`
- `qa_reviewer IS NOT NULL`
- `loudness_lufs BETWEEN -18 AND -14` (ADR-0016; the -16 ±1 LUFS production target lives in the audio-qa-reviewer agent, not at the DB)
- `true_peak_dbtp <= -1`
- `transcript_url IS NOT NULL`

(Cycle-1 critic flagged this as F-P1-01: SSOT §7 previously listed four conditions, omitting `true_peak_dbtp`. The SQL CHECK has all five. Five is canonical. ADR-0016, cycle build-2026-05-21, widened the loudness band from `[-17, -15]` to `[-18, -14]` while keeping the 5-condition shape from F-P1-01 intact.)

**`published → revoked`** requires:
- `revoke_reason IS NOT NULL`
- CDN purge job queued
- Watchdog enforces `cdn_purge_at IS NOT NULL` within 90s, else alert (new — Finding C-10, M2 deliverable)

---

## 8. Repository structure (target, post-M1)

```
.
├── apps/
│   ├── cms/                  # Internal Next.js, Cloudflare Access-gated
│   └── reader/               # Public Next.js
├── workers/
│   ├── cron-ingest/          # Mon-Fri 10:30 UTC source ingestion
│   ├── audio-producer/       # TTS + master + upload
│   ├── rss-publisher/        # 4 per-tier feeds
│   └── cdn-purge-watchdog/   # 60s revoke SLA enforcement
├── packages/
│   ├── db/                   # generated Supabase types + Drizzle/Kysely client
│   ├── shared/               # editorial-style-guide types, signal-scoring, lexicon helpers
│   ├── audio/                # ffmpeg loudnorm wrapper, R2 client, lexicon application
│   ├── rss/                  # feed builders + validators
│   └── test-fixtures/        # canonical golden article + factories
├── supabase/
│   ├── migrations/           # 10 ordered SQL files (0001–0010)
│   └── seed.sql              # qa_reviewers seed + lexicon 30 seed
├── tools/
│   └── audio/                # CLI helpers (preroll, loudness verifier)
├── docs/
│   ├── SSOT.md               ← this file
│   ├── MASTER_IMPLEMENTATION_PLAN.md
│   ├── ROMAS-Brief-Master-Strategy.md       (v2.1 after M0)
│   ├── ROMAS-Brief-Daily-Production-Runbook.md (v1.1 after M0)
│   ├── ROMAS-Brief-500-Article-Launch-Plan.md  (v1.1 after M0)
│   ├── ROMAS-Brief-Design-Specification.md  (v1.1 — TO AUTHOR in M1)
│   ├── ROMAS-Brief-Audio-Architecture.md    (v1.0 — TO AUTHOR in M1)
│   ├── ARCHIVE/                              (retired Wire docs after M0)
│   └── specs/
│       ├── product-spec.md
│       ├── architecture.md
│       ├── delivery-plan.md
│       ├── test-qa-plan.md
│       ├── deployment-plan.md
│       ├── gap-analysis.md
│       ├── security-findings.md
│       ├── integration-review.md
│       ├── current-architecture.md
│       ├── codebase-index.md
│       ├── research-notes.md
│       ├── smoke-test-report.md
│       ├── remediation-plan.md
│       ├── critic-review.md             ← team-plan-critic output
│       ├── adr/                          ← Nygard ADRs
│       └── contracts/                    ← OpenAPI / JSON Schema / AsyncAPI
├── .github/workflows/
│   ├── ci.yml
│   ├── deploy-pages.yml
│   ├── deploy-workers.yml
│   └── deploy-migrations.yml
├── .env.example
├── wrangler.toml
├── package.json              # pnpm workspaces root
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── CLAUDE.md
├── AGENT.md
├── README.md
└── SECRETS.md                ← rotation policy (NEW — M1 deliverable)
```

---

## 9. Document precedence order (when in doubt)

1. **`docs/SSOT.md`** (this file) — wins over all
2. `docs/specs/adr/*.md` — wins over plans for the specific decision they cover
3. `docs/MASTER_IMPLEMENTATION_PLAN.md` — wins over `delivery-plan.md` for sequencing
4. `CLAUDE.md` — wins over operational docs
5. `AGENT.md` — wins over individual skill/agent files for orchestration
6. Strategy / Runbook / Launch Plan — domain-narrative; bow to SSOT + ADRs on conflicts
7. Individual skills and agents — operational fidelity

If two documents disagree and neither cites the other, **assume the SSOT is right and fix the divergent doc**. Do not propagate the divergence.

**Consolidation (2026-05-31): this SSOT is THE single planning source of truth.** The planning docs below are **subordinate** — each carries a banner pointing here. Read them for detail, but status/decisions/dates here win:

| Subordinate doc | Owns (detail only) |
|---|---|
| `specs/ship-execution-plan.md` | SHIP-NN backlog + per-task status + critical path |
| `ROMAS-Brief-500-Article-Launch-Plan.md` | content-ramp schedule + 500-article distribution detail |
| `FOUNDERS-BOARD.md` | Kimal provisioning items (P-NN) with steps/links |
| `specs/deployment-plan.md` | deploy/runbook detail |
| `MASTER_IMPLEMENTATION_PLAN.md` · `specs/delivery-plan.md` · `specs/remediation-plan.md` · `specs/test-qa-plan.md` · `tasks.md` | historical/working detail — defer to SSOT + ship-plan |

---

## 10. Open questions awaiting Kimal sign-off (hypothesis resolutions)

| Q | Question | SSOT resolution (binding in this doc; pending Kimal §13 ratification) | Decision needed by |
|---|---|---|---|
| Q1 | Primary tagline (Master Strategy v2.0 contradicts locked ledger) | **LOCKED 2026-05-14 by Kimal**: "Radiation oncology, decoded daily." Re-affirmation of CLAUDE.md §2 locked decision. R-001 updates Master Strategy v2.0 → v2.1 in M0. AGENT.md §13 entry to be appended on next CLAUDE.md/AGENT.md edit pass. | **DONE 2026-05-14** |
| Q2 | Audio tier launch sequencing | **LOCKED 2026-05-14 by Kimal**: All 4 audio tiers (Audio Brief / Daily Brief / Audio Podcast / Conference Brief) launch **Day 1**, all ElevenLabs-generated. New Tier 5 Video Podcast with invited guest launches **Day 60**. MASTER_IMPLEMENTATION_PLAN restructure pending (M3 absorbs Tier 2 + Tier 3 RSS feeds at Day 1; new M6.5 = Video Podcast scaffold). FR-W-002 in product-spec reversed for Tier 5 only. | **DONE 2026-05-14** |
| Q2-A | First Audio Podcast (Tier 3, 30–60 min via ElevenLabs) episode cadence | **LOCKED 2026-05-14 by Kimal — Option (a)**: Day 1 ships a full 30–60 min episode. Production prerequisite: 4,500–9,000 word script written, fact-checked, physics-reviewed (if applicable), lexicon-applied, ElevenLabs-mastered to -16 LUFS, transcript generated, audio-qa-reviewed, and `podcast.xml` valid (iTunes namespace) before Day 1. This becomes a critical-path M2 deliverable. | **DONE 2026-05-14** |
| Q3 | Email platform (Runbook says Beehiiv; CLAUDE.md says Resend/Postmark) | **LOCKED 2026-05-14 by Kimal — split-by-function**: Beehiiv = newsletter (daily issue, Friday Read, podcast notifications) — free up to 2,500 subscribers. Resend = transactional (signup, unsubscribe receipt, audio-revocation notice, password reset). Subscriber sync: Supabase `subscribers` is the local mirror; Beehiiv is canonical for the newsletter list; Beehiiv webhooks update Supabase on subscribe/unsubscribe/bounce. ADR-0007 restructured. R-002 keeps Beehiiv mention in Runbook (it was correct for newsletter), adds Resend reference for transactional path. | **DONE 2026-05-14** |
| Q4 | Voice donor identity + commercial-use consent scope | Voice consent registry file authored by Kimal in M1 | M1 (Day -3) |
| Q5 | Observability — Sentry (paid) vs Logflare (open) vs Workers Analytics Engine only | Workers Analytics Engine + Sentry free tier *(hypothesis)*; revisit at 10k subscribers | M1 |
| Q6 | Two-reviewer rule activation date for audio QA | Day 30 *(hypothesis — per AGENT.md §2 "second reviewer by Day 30")* | M3 |
| Q7 | Auto-publish graduation gate criteria — exact category list | Literature + Guideline only; requires inviolable-rule update before activation | M7 |
| Q8 | Three-edition publish strategy operations | **LOCKED 2026-05-14 by Kimal** — APAC 22:00 UTC · EU 06:00 UTC · Americas 11:00 UTC. Beehiiv segment by `region` custom field. | DONE |
| Q9 | China posture | **LOCKED 2026-05-14 by Kimal** — read-only NMPA/CSCO-RO ingest; no Chinese subscriber hosting until 10k global subscribers re-evaluation. | DONE |
| Q10 | Region distribution rebalancing (Launch Plan §2.2 supersession) | **LOCKED 2026-05-14 by Kimal** — Proposal A applied: NA 26% / EU 32% / APAC 26% / LATAM 8% / MENA-Africa 4% / Global 4%. | DONE |
| Q11 | LATAM editorial language capacity (Spanish/Portuguese sourcing for 40 LATAM articles + 1-2/day ongoing) | **LOCKED 2026-05-14 by Kimal — LLM-translate**. DeepL Pro primary + Claude 3.5 Sonnet verification on Hero/Strong-band articles (composite_score ≥ 70). Article footer attribution mandatory: "Source originally in {Portuguese\|Spanish}; translated with editorial review." Original-language source URL preserved (Rule 1). ADR-0013 + `contracts/deepl.yaml` authored cycle-6. | DONE |

---

## 11. Done means (issue-level, copy of AGENT.md §15)

A daily issue is "done" when:
1. ≤ 5 top items, each with primary source URL, six-axis scores, ROMAS Insight (labeled)
2. Quick-hits backlog of next 10
3. Embargo hold list current
4. Source-health report attached
5. For each top item: audio status is `published` (after QA) or explicitly `skipped`
6. RSS feeds regenerated and validated
7. Email issue queued in Resend
8. Web issue page renders with AudioPlayer in correct state per article
9. Friday issue ships the ROMAS Read with sub-rubric
10. Sign-off: `— Kimal`

---

## 12. Launch posture — Day 1 (canonical, per Launch Plan v1.1 §2–§4)

ROMAS Wire launches with **500 pre-produced, pre-published articles** + **~50 pre-mastered audio episodes** as a credibility scaffold. Pre-launch production ramp: **8 weeks ending Day 1** (Launch Plan §3). Calendar: started 2026-05-12 (W-8); **Day 1 ≈ 2026-07-14** *(Q-A DECIDED 2026-05-31 — Kimal chose the FULL launch and pushed ~1 week from the ~07-07 floor; the 8-week content ramp is the binding pole and may extend to ~07-21)*.

> **Product renamed from `ROMAS Brief` → ROMAS Wire** (2026-05-31) — brand/display done; `@romas-brief` package identifiers + `romasbrief.com` domain + GitHub repo = gated phase-2 (rename at deploy/SHIP-31 with the `romaswire.com` domain decision).
>
> **Engineering status (HEAD 95f6111): Waves 1–4 complete** — reader live on Supabase, six-axis scorer, CMS audio-QA gate, Beehiiv+Resend workers, full WCAG-AA a11y, AudioPlayer, perf/Plausible (see `ship-execution-plan.md §1`). Remaining = Wave-5 **provisioning + the 8-week content ramp** (non-code). CI on `main` has never run (P-00 billing). **The date is gated by content + provisioning, NOT engineering.**

### 12.1 Day-1 content scale

| Surface | Count | Source |
|---|---|---|
| Pre-produced articles | **500** | Launch Plan §2 |
| Pre-mastered audio episodes | **~50** *(see §12.5 for breakdown)* | Kimal verbal 2026-05-14 + Launch Plan §8 |
| First 5 daily issues drafted + queued | 5 | Launch Plan §8 row 13 |
| Beehiiv newsletter archive seed | 500 articles | Launch Plan §8 row 1 |

### 12.2 The 500-article distribution matrix (locked in Launch Plan §2)

| Dimension | Breakdown |
|---|---|
| **11 Categories** | AI 100 (20%) · Medical Physics 70 (14%) · Clinical RT 80 (16%) · Regulatory 50 (10%) · Guidelines 40 (8%) · Reimbursement 30 (6%) · Vendor 50 (10%) · Conferences 30 (6%) · Resident & Education 20 (4%) · Future of RT 15 (3%) · Operations & Workforce 15 (3%) |
| **7 Regions (rebalanced cycle-5)** | US 110 (22%) · Canada 20 (4%) · Europe 160 (32%, includes UK 30) · APAC 130 (26% — Japan 40 / Korea 15 / China 25 read-only / India 15 / Australia-NZ 20 / SE Asia 15) · LATAM 40 (8% — Brazil 20 / Mexico 8 / Argentina 6 / Chile 4 / Other 2) · MENA-Africa 20 (4%) · Global 20 (4%). Supersedes Launch Plan v1.1 §2.2. |
| **8 Audience tags** | Physician 175 · Physicist 140 · Dosimetrist 65 · Therapist 35 · Resident 30 · Industry 35 · Investor 10 · Researcher 10 |
| **8 Content types** | News brief 250 · Paper critique 100 · Practice Delta 40 · FDA/CE-mark brief 35 · Reimbursement explainer 25 · Vendor intel note 25 · Long Take 15 · Primer/Explainer (evergreen) 10 |
| **5 Freshness bands** | Last 30d 150 · 31–90d 150 · 91–180d 100 · 181–365d 70 · Evergreen 30 |
| **5 Signal-score bands** | Hero 85-100: 50 · Strong 70-84: 150 · Standard 55-69: 200 · Quick Hit 40-54: 80 · Reference 25-39: 20 |

### 12.3 Day-1 homepage modules (locked in Launch Plan §4)

8 modules across the page:

1. **Hero story** — 1 article, Signal ≥90, freshness <7d
2. **Top Stories grid** — 6 articles, Signal 75+, mix of AI/Physics/Clinical/Regulatory
3. **Industry moves** — 3 articles, vendor + startup
4. **Paper of the Day** — 1 paper critique card
5. **Quick Hits** — 5 cards
6. **Today's podcast** — 5–10 min Audio Brief or Tier 2 Daily Brief embed
7. **Trending now** — live signal-scored top-10 feed
8. **Top Papers This Week** — 5 cards

### 12.4 Day-1 navigation surfaces

| Surface | What it shows |
|---|---|
| `/categories/{slug}` | 11 category index pages, each pre-populated per §12.2 row 1 (e.g., `/categories/ai` = 100 articles, sortable by 8 AI sub-categories) |
| `/regions/{slug}` | 8 region pages (us/europe/uk/apac/canada/latam/mena-africa/global) |
| `/for/{audience}` | 5+ audience-filter pages (physicists/physicians/dosimetrists/therapists/residents) — resolves to ≥30 articles each |
| `/listen` | 4-tier audio grid (Audio Brief / Daily Brief / Audio Podcast / Conference Brief — all live Day 1) |
| `/watch` | Tier 5 Video Podcast — placeholder Day 1, populated Day 60 |
| `/issues/{YYYY-MM-DD}` | Per-issue canonical URL (each daily Mon–Thu Brief + Friday Read) |
| `/topics/{tag}` | Modality + disease-site + AI-impact tag pages |
| `/papers` | Paper of the Day archive (100 paper-critique articles) |
| `/sponsor` | (No nav slot until Day 90 per SSOT §3 row 3.) Dedicated page only. |

### 12.5 Pre-mastered audio inventory (Day 1, ~50 episodes)

**Pending Kimal confirmation of exact breakdown.** Cross-referencing Launch Plan §8 row 12 ("Top 10 hero stories have podcast audio attached"), SSOT §3 row 6 (all 4 audio tiers live Day 1), and cycle-2 Q2-A lock (full Tier 3 Podcast episode 001 Day 1):

| Tier | Pre-loaded episodes (hypothesis) | Notes |
|---|---|---|
| 1 Audio Brief | ~30 | Top-30 Hero / Strong-band articles each get a 5/7/10-min Audio Brief |
| 2 Daily Brief | ~5 | One pre-recorded rehearsal Daily Brief per pre-launch week (W-4..W-1) |
| 3 Audio Podcast | ~10 | 10 weekly podcast episodes pre-produced (episode 001 mandatory Day 1 per Q2-A) — gives ~10 weeks editorial buffer post-launch |
| 4 Conference Brief | ~5 | ASTRO 2025 recap + ESTRO 2025 recap + AAPM 2025 + 2 historicals |
| **Subtotal** | **~50** | Matches "50+ podcast" Kimal verbal lock 2026-05-14 |

If Kimal intends a different breakdown (e.g., more Tier 3 Podcasts, fewer Tier 1 Audio Briefs, or includes Tier 5 Video pre-records), this table updates and M2 production tasks rescale.

### 12.6 Pre-launch production calendar (Launch Plan §3, calendar-resolved)

| Week | Window | Articles | Cumulative | Focus |
|---|---|---|---|---|
| W-8 | 2026-05-12 → 2026-05-18 (**now**) | 30 | 30 | Build the pipeline; seed AI category; first 5 evergreen primers |
| W-7 | 2026-05-19 → 2026-05-25 | 50 | 80 | Clinical RT modalities + Medical Physics core |
| W-6 | 2026-05-26 → 2026-06-01 | 60 | 140 | Regulatory backfill (last 12 months of FDA AI/ML clearances + EU AI Act explainer) |
| W-5 | 2026-06-02 → 2026-06-08 | 65 | 205 | Guidelines + Practice Deltas (last 24 months of ASTRO/ESTRO/AAPM/NCCN) |
| W-4 | 2026-06-09 → 2026-06-15 | 70 | 275 | Vendor intelligence + Conference recaps (ASTRO 2025, ESTRO 2025, AAPM 2025) |
| W-3 | 2026-06-16 → 2026-06-22 | 75 | 350 | Reimbursement deep-dives + Resident education |
| W-2 | 2026-06-23 → 2026-06-29 | 80 | 430 | International coverage push (APAC + Europe + LATAM/MENA) |
| W-1 | 2026-06-30 → 2026-07-06 | 70 | 500 | Long Takes, hero stories, polish, signal-score recalibration |
| **Day 1** | **2026-07-07** *(hypothesis)* | Daily flow begins | 500 + 5/day | ROMAS Wire goes live with the runbook |

Daily editorial production rate during ramp: **6–14 articles/day** (Launch Plan §3 closing). Achievable because cron + 7 agents do discovery; drafts LLM-generated to 80% complete; human-finished. Editorial approval is the bottleneck.

### 12.7 Code + content parallel tracks

The 8-week pre-launch covers BOTH content production AND code scaffolding:

- **Code track (this plan's M0 → M2)**: doc reconciliation → repo scaffold → audio pipeline + all 4 tier generators + QA gate. Target done state by **W-2 (2026-06-23)** so W-1 is content polish + signal-score recalibration on the production stack, not bug-fixing.
- **Content track**: 8-week ramp per §12.6. Editorial pipeline operates on production stack from W-2 onward (so W-1 articles flow through actual cron + QA gate, smoke-testing the production path on real content before Day 1).

### 12.8 Launch-readiness gate (Launch Plan §8 + cycle-3 additions)

Day 0 (24h before launch) verifies all 13 original Launch-Plan checklist items + 5 cycle-3 additions:

| # | Check | Owner |
|---|---|---|
| 1 | 500 articles approved and queued in Beehiiv + ROMAS Wire web archive | editorial-director |
| 2 | All 11 categories show ≥minimum allocation populated | editorial-director |
| 3 | All 8 regions show non-zero counts | editorial-director |
| 4 | All 5+ audience filters resolve to ≥30 articles each | editorial-director |
| 5 | Signal Score distribution matches §12.2 (50/150/200/80/20) | signal-scorer |
| 6 | Freshness distribution matches §12.2 (≥60% within 90 days) | editorial-director |
| 7 | Every article has primary-source URL inline | Schema-enforced |
| 8 | Every article has audience + region + modality tags | DB constraint TBD M0 |
| 9 | Every interpretation is labeled | Schema-enforced |
| 10 | **Zero `meddeviceguide.com` / `MDCG.eu` as primary source** (cycle-2 R-014) | regulatory-analyst |
| 11 | Zero embargoed-2026-conference items in publish queue | conference-mode-operator |
| 12 | Editorial correction rate from launch-week pilot reads <1% | editorial-director |
| 13 | Top-10 hero stories have audio attached | audio-producer |
| 14 | **Tier 3 Audio Podcast episode 001 (30-60 min) ready** (cycle-2 Q2-A) | audio-producer + Kimal |
| 15 | **All 4 audio RSS feeds valid + Tier 5 `video-podcast.xml` skeleton present** | rss-publisher |
| 16 | **Beehiiv subscriber-list synced + reconciliation job green** (cycle-3 Q3) | web-engineer |
| 17 | **`.env.example` + `SECRETS.md` complete + all Beehiiv/Resend keys provisioned** | DevOps |
| 18 | First issues of ROMAS Wire drafted and queued for live cron handoff (2×/week cadence — decision 20) | editorial-director |
| 19 | **Every launch article has a thumbnail** (`articles.thumbnail_url` populated; decision 22 — Imaging-Wire parity) | editorial-director |
| 20 | **Google News sitemap + Publisher Center submitted & verified**; `NewsArticle` JSON-LD present on article pages | web-engineer |
| 21 | **Audio email-embed + SMS one-tap-listen delivery verified** (decision 21); `subscribers.phone` opt-in + STOP handling live | web-engineer / DevOps |
| 22 | Cadence configured to **twice weekly** (decision 20) across cron, Beehiiv segments, and the 3 regional editions | editorial-director / web-engineer |

---

## 13. Revision history

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-05-14 | 1.0.0 | Initial SSOT. Reconciles 19 audit findings; Q1/Q2/Q3 with hypothesis defaults. | team-planning |
| 2026-05-14 | 1.1.0 | **Cycle-3** Q1/Q2/Q3 locked by Kimal. Email split. Tier 5 Video Podcast added. Q2-A locked. | team-planning + Kimal |
| 2026-05-14 | 1.2.0 | **Cycle-4** §12 Launch Posture added — canonical 500-article + ~50-audio scale, 11×8×8×8 distribution matrix, 8-week pre-launch calendar (W-8 = now), Day-1 readiness gate (18 items). Reflects Kimal's 2026-05-14 correction that the launch posture was under-scoped. | team-planning + Kimal |
| 2026-05-31 | 1.3.0 | **Cycle-7** (a) **Product renamed from `ROMAS Brief` → ROMAS Wire** (brand/display; identifiers + `romasbrief.com` + repo = gated phase-2). (b) **Q-A DECIDED: full launch, Day-1 ≈ 2026-07-14** (June-7 dropped as infeasible; content ramp is binding pole). (c) **Engineering Waves 1–4 complete** (HEAD 95f6111) — reader↔Supabase, scorer, CMS QA gate, workers, a11y/perf/audio. (d) **Consolidation: this SSOT is THE single planning source of truth** — all other planning docs are subordinate (§9) and carry a supersession banner pointing here. | Kimal + Claude |
| 2026-05-31 | 1.4.0 | **Cycle-7b — The Imaging Wire template review (Kimal).** Decisions 20–22 added: **(20)** publishing cadence → **twice weekly** (Tue brief + Fri ROMAS Read), supersedes Mon–Fri daily; launch still ships the 500-article scaffold. **(21)** audio distribution → **email + phone/SMS** (commute listening; new SMS provider + `subscribers.phone` opt-in). **(22)** every launch article ships a **thumbnail** (Imaging-Wire scannability parity). Launch gate (§12.8) extended to 22 rows incl. Google News sitemap + Publisher Center. | Kimal + Claude |

---

*Update this file before resolving any conflict in any other doc.*
