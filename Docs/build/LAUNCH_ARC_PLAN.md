---
title: ROMAS Brief — Launch Arc Plan (W-7 → Day 1)
version: 1.0.0
date: 2026-05-15
window: 2026-05-15 (prep weekend) → 2026-07-07 (Day 1 target)
authority: synthesizes SSOT §12 Launch Posture + delivery-plan.md + MASTER_IMPLEMENTATION_PLAN.md + ADRs 0001–0014
status: Draft (Kimal review pending)
supersedes: none (new artifact)
---

# Launch Arc Plan — 8-week execution choreography

> This is the **operational reference** for the W-7 → Day-1 window. It does not replace SSOT, ADRs, contracts, or `delivery-plan.md`; it sequences them. When a /team-X skill needs to know *when* to run and *what artifact* to produce, this file is the answer. On conflict with SSOT, SSOT wins; flag the drift back into this plan.

---

## 1. Calendar at a glance

Today: **Friday 2026-05-15**. Day 1: **Tuesday 2026-07-07** (53 calendar days; 38 working days).

| Window | Dates | Track A — Build | Track B — Design | Track C — Editorial | Track D — Kimal (legal/vendor) |
|---|---|---|---|---|---|
| **Prep weekend** | Fri-Sun 2026-05-15..17 | M0 cycle-2 close (doc-only; 16 deferred items) | — | 5 article seeds | AllienNova casing patch (SSOT §3 row 19 + ADR-0014); Beehiiv DPA kickoff |
| **W-7** | Mon-Sun 2026-05-19..25 | `/team-build M1` foundation start (monorepo + migrations 0001–0010 + first cron worker) | `/team-design` dispatch — wireframes + tokens + copy | 30 articles cum | Beehiiv DPA in flight; voice-consent registry drafted |
| **W-6** | 2026-05-26..06-01 | M1 completion (CI green, all migrations applied, source-ingest cron live) | Design plan-approve gate; component specs (7) | 90 cum (+60) | DeepL Pro account; ElevenLabs voice cloning paperwork |
| **W-5** | 2026-06-02..08 | `/team-build M2` audio pipeline (ElevenLabs/PlayHT + loudness + audio_jobs state machine + RSS for 4 tiers) | Tokens.json locked; AudioPlayer + SponsorBlock specs | 170 cum (+80) | Beehiiv DPA + SCC executed; voice consent recorded |
| **W-4** | 2026-06-09..15 | M2 completion (CDN purge watchdog + Whisper transcription + Tier 5 video-podcast.xml stub) | A11y audit; design conformance checklist | 260 cum (+90); 10 audio episodes mastered | Resend domain DNS; secret-store rotation policy |
| **W-3** | 2026-06-16..22 | `/team-build M3` reader (Next.js on Cloudflare Pages + 8-module homepage + AudioPlayer Variant A/B + ROMASRead + ListenPage) | Design hand-off final; assets manifest delivered | 350 cum (+90); 25 audio episodes mastered | Plausible analytics provisioning; Beehiiv segment custom field deployed |
| **W-2** | 2026-06-23..29 | M3 completion (Beehiiv subscriber sync + region segmentation + 3-edition publish wiring) | Visual QA pass | 430 cum (+80); 40 audio episodes mastered; Audio Podcast episode 001 produced (30–60 min) | Day-1 communications draft; sponsor outreach |
| **W-1** | 2026-06-30..07-06 | `/team-qa` cycle-3 full readiness audit + Day-1 readiness gate (18-item) | — | 500 cum (+70); 50 audio episodes mastered | Dry-run launch rehearsal Wed; final go/no-go Sun |
| **Day 1** | Tue 2026-07-07 | Three-edition publish: APAC 22:00 UTC (prior-day Mon 17:00 ET) → EU 06:00 UTC (Tue 01:00 ET) → Americas 11:00 UTC (Tue 06:00 ET) | — | — | Press / social distribution |

Editorial ramp = parallel **and asynchronous** — owned by Kimal at the morning editorial slot 06:30–07:00 ET. Build tracks do not block editorial; editorial does not block build.

---

## 2. Dispatch sequence — when to invoke which skill

| Trigger | Date / Condition | Skill | Scope |
|---|---|---|---|
| 1 | Today (Fri 2026-05-15) | (no skill — interactive edits) | M0 cycle-2 close in this session: gitignore fix done · AllienNova casing patch · migration 0009 trigger ordering fix · T-NEW renumbering · A-NNN catalog +16 tests · CLAUDE.md/AGENT.md Q-lock propagation · skill file syncs (cms-schema, regulatory-analyst, editorial-style-guide) · test-coverage Tables refresh · risk-register dedup · build artifact reconstruction |
| 2 | Mon 2026-05-19 AM | `/team-design` | 12 wireframes (Listen, Article, Issue, Homepage, Friday Read, Conference, Search, Subscribe, About, Sponsor, Audio QA admin, 404) + 7 components (AudioPlayer A/B, SponsorBlock, ROMASRead, IssueHeader, ArticleHeader, AudioStatusBadge, ListenPage) + `tokens.json` + `copy.md` + `a11y-audit.md` + `assets/manifest.md` |
| 3 | Mon 2026-05-19 PM (after /team-design plan-approve) | `/team-build M1` | pnpm-workspace.yaml · turbo.json · wrangler.toml · packages/db skeleton · packages/shared skeleton · packages/llm-orchestrator skeleton (TypeScript, not parent-ROMAS Python) · 10 supabase migrations 0001-0010 · pgTAP suite for 6 inviolable rules · GitHub Actions CI · first cron worker (10:30 UTC global source ingest) |
| 4 | Mon 2026-06-02 (W-5 start, after M1 critic gate passes) | `/team-build M2` | ElevenLabs primary + PlayHT failover · audio_jobs state machine + 5-condition CHECK · ffmpeg/ebur128 loudness measurement · audio QA gate flip handler · CDN purge watchdog (60s SLA + alert at >90s) · RSS publisher per-tier · Whisper transcription |
| 5 | Mon 2026-06-16 (W-3 start, after M2 critic gate passes AND design hand-off) | `/team-build M3` | Next.js reader on Cloudflare Pages · 8-module homepage · all wireframed routes · all 7 components · 3-region edition publish · Beehiiv subscriber sync + region segmentation · Resend transactional flow |
| 6 | Mon 2026-06-30 (W-1 start) | `/team-qa` cycle-3 | Full production readiness audit · 18-item Day-1 gate verification · dry-run launch on staging Wed 2026-07-02 |
| 7 | Sun 2026-07-05 | Manual go/no-go review | All 18 Day-1 gate items GREEN → proceed; any RED → defer Day 1 by 1 week |
| 8 | Mon-Tue 2026-07-06..07 | Three-edition publish wave | APAC → EU → Americas in chronological order; cron-driven |

---

## 3. Critical-path dependencies (what blocks what)

```
M0c2 close [Fri-Sun]
   ├─→ /team-design dispatch [Mon W-7]
   │      └─→ design plan-approve [W-6]
   │             └─→ M3 reader execution [W-3..W-2]
   │
   └─→ /team-build M1 dispatch [Mon W-7]
          └─→ M1 critic-gate pass [W-6]
                 └─→ /team-build M2 dispatch [W-5]
                        └─→ M2 critic-gate pass [W-4]
                               └─→ M3 reader execution [W-3..W-2]
                                      └─→ /team-qa cycle-3 [W-1]
                                             └─→ Day-1 gate [Sun 2026-07-05]
                                                    └─→ Launch [Tue 2026-07-07]
```

Hard blockers (Day 1 cannot happen without these):
- M0c2: migration 0009 trigger-ordering fix (P0 — `set_updated_at()` referenced before definition; will fail on apply)
- M1: all 10 migrations apply clean against fresh Supabase; pgTAP green on all 6 inviolable rule constraints
- M2: audio QA gate state-machine enforces 5-condition CHECK (`clinical_claims_checked` + `qa_reviewer` set + `-18 ≤ LUFS ≤ -14` per ADR-0016 + `true_peak_dbtp ≤ -1` + `transcript_url`). Tight -16 ±1 LUFS production target enforced by audio-qa-reviewer agent.
- M3: three-edition publish wired correctly; Beehiiv segment-by-region custom field deployed
- Track D: Beehiiv DPA + SCC signed by W-4 end (else: EU subscriber acquisition blocked — start NA-only and add EU at Day 14)
- Track D: voice consent registry executed by W-5 end (else: PlayHT failover unusable — ElevenLabs solo with documented risk)
- Track D: DeepL Pro provisioned by M2 start (else: LATAM articles ship in English-only with `source_originally_in` footer flagging untranslated state — accepted graceful degradation)

Soft blockers (Day 1 can proceed but degraded):
- Tier 5 Video Podcast (Day 60): ADR-0012 vendor lock decision deferred — no Day-1 dependency
- Auto-publish graduation: 60d post-launch — no Day-1 dependency

---

## 4. Parallel tracks and where they collide

Build (Track A) and Design (Track B) parallelize cleanly during W-7..W-5. They collide in W-3 where M3 reader execution consumes the design hand-off. To prevent collision:
- Design **must** complete plan-approve gate by end of W-6 (Sun 2026-06-01).
- Design **must** complete component specs + tokens.json by end of W-5 (Sun 2026-06-08).
- Design **must** complete final hand-off + assets manifest by end of W-3 (Sun 2026-06-22). M3 cannot start without this.

Editorial (Track C) and Build (Track A) never collide on files. Editorial writes to `articles.body_md` (data, not code). Article seeds drafted during W-7..W-1 land in Supabase via the CMS UI built in M3 — but pre-launch they can be authored as markdown files under `editorial/drafts/{YYYY-MM-DD}/{slug}.md` and imported at M3 completion. Decision deferred to W-7 standup; default = import path.

Kimal-track (Track D) is async. Surface blockers at Monday morning standup. The Track-D items are NOT in `/team-build` scope; they require legal + vendor + business work.

---

## 5. Day-1 readiness gate (18-item checklist — abridged from SSOT §12)

By Sun 2026-07-05 end-of-day, all 18 must be GREEN. Any RED → defer Day 1 by 1 week.

1. All 10 migrations applied clean on production Supabase + pgTAP green
2. All 6 inviolable rules enforced at DB CHECK level
3. Cron `ROMAS Brief — Global Morning Brief` Mon-Fri 10:30 UTC live with last 5 runs green
4. ElevenLabs voice cloning ID resolved + 50 pre-mastered audio episodes in `romas-audio-cdn` R2
5. Audio QA reviewer state machine flip-tested end-to-end (in_review → published → revoked rehearsed)
6. CDN purge watchdog tested + alert wired to PagerDuty / email
7. RSS feeds — all 4 tier feeds + Tier 5 stub published + validated against W3C feedvalidator
8. Beehiiv subscriber list synced + reconciliation job green + region segment custom field deployed
9. Three-edition cron times locked (APAC/EU/Americas) + test publish completed for at least one issue
10. Resend domain DKIM + SPF + DMARC pass + transactional templates rendered
11. `.env.example` + `SECRETS.md` complete + all keys provisioned in Cloudflare Workers secrets + Supabase vault
12. ROMASRead Friday rotation tracker file authored + populated
13. Sponsor firewall 32px enforced + verified at all 3 viewports (390/768/1440)
14. Plausible analytics live + 1 week of pre-launch telemetry captured
15. 500 articles drafted across 11 categories × 7 regions × 8 audiences × 8 content types per SSOT §12 distribution matrix
16. Audio Podcast Episode 001 (30–60 min) mastered + transcript + RSS entry ready
17. /team-qa cycle-3 verdict: GO or GO WITH CONDITIONS
18. First 5 issues of ROMAS Brief drafted and queued for live cron handoff

---

## 6. Risk register (top 7 launch blockers)

| ID | Risk | Severity | Mitigation | Owner |
|---|---|---|---|---|
| R-L01 | Migration 0009 trigger ordering bug not caught in M0c2 close | Critical | Fix this weekend; pgTAP test against fresh Supabase before /team-build M1 dispatch | M0c2 close (this session) |
| R-L02 | Design hand-off slips past W-3 start | Critical | Lock plan-approve gate at end W-6; if at risk by W-5, escalate to Kimal Mon standup | /team-design lead |
| R-L03 | Beehiiv DPA + SCC delayed past W-4 | High | Fallback = NA-only launch + EU deferred to Day 14 (Beehiiv segment held empty until SCC) | Kimal-track |
| R-L04 | Editorial ramp falls behind 500-article target | High | Reduce target to 350; cut LATAM + MENA-Africa to placeholder count; document graceful degradation | Kimal editorial |
| R-L05 | ElevenLabs voice cloning latency / quality issues at 50-episode scale | Medium | PlayHT failover tested + documented; pre-master ALL Day-1 audio (no live TTS on Day 1) | M2 audio-producer |
| R-L06 | CDN purge SLA fails the 60s target | Medium | Watchdog alert + manual purge runbook + reviewer-side "publish ready" warning if `cdn_purge_at` > 90s null | M2 ops |
| R-L07 | Cloudflare Workers + Pages cold-start under three-edition load | Medium | Pre-warm via scheduled hits 5 min before each edition cron; load-test in W-1 dry-run | DevOps |

---

## 7. Drift surfaces (track these; patch before W-7)

| Drift | Where | Fix in |
|---|---|---|
| `aliennova` (SSOT §3 row 19, ADR-0014) vs `AllienNova` (actual GitHub org) | docs/SSOT.md + Docs/specs/adr/0014 | M0c2 close (this weekend) |
| M0 cycle-1 build artifacts (build-log, handoff-notes, decision-log, critic-review) excluded by gitignore `build/` line | Fixed in this session: gitignore corrected with `/build/` root anchor + `!docs/build/` carve-out. Original artifacts unrecoverable from disk; key content survives in conversation history and can be reconstructed in M0c2. | M0c2 close |
| docs/build/ vs Docs/build/ case drift on Windows | New repo uses `docs/build/` lowercase (this file) — eventually unify with Docs/ uppercase or leave both | M0c2 close (optional) |

---

## 8. What comes after Day 1 (Day 1 → Day 90)

Not in scope for this plan but flagged so we don't lose visibility:

- Day 1–14: subscriber acquisition push; first ROMAS Read on Fri 2026-07-10; first weekly Audio Podcast episode 002 on Wed 2026-07-15
- Day 14–30: conference-mode rehearsal for ASTRO 2026 (Sep 21–24) — embargo handling end-to-end on a controlled past-conference dataset
- Day 30: ADR-0012 video podcast vendor decision (5-vendor rubric scoring)
- Day 60: Tier 5 Video Podcast launch with invited guest
- Day 90: review co-branded masthead lock (currently killed for launch per SSOT row 3); review subscriber-count threshold (currently hidden until 2,500 per SSOT row 5); review auto-publish graduation rule (currently human-review at all categories per SSOT row 6 / Rule 6)

---

## 9. Authority + revision

This plan reports on the calendar; SSOT reports on the decisions. Any conflict → SSOT wins, patch the plan.

Update this file in place when:
- A milestone slips by ≥ 3 days → add a "Revision History" row with date + new milestone date + reason
- A Kimal-track item resolves with a non-default outcome → add an entry
- A new risk crosses Medium severity → add to register
- Day 1 moves → restate calendar in §1 and propagate dates downstream

---

*This document is the operational reference for `/team-design`, `/team-build`, and `/team-qa` dispatches during the launch arc. Read this before invoking any of those skills during W-7 → Day 1. Closes user request for "Full launch arc (W-7 → Day 1, 8 weeks)" plan dated 2026-05-15.*
