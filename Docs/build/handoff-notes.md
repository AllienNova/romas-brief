---
title: ROMAS Brief — /team-build M0 cycle-1 + cycle-2 handoff
version: 1.1.0
date: 2026-05-14 (cycle-1) · 2026-05-15 (cycle-2 close)
reconstructed: 2026-05-15 (cycle-1 content recovered from conversation history)
from: /team-build M0 cycle-1 (doc reconciliation) → M0 cycle-2 (deferred items close + repo separation)
to: /team-qa (cycle-3 readiness verification) + /team-design (W-7 dispatch)
---

# Handoff Notes — M0 cycle-1 + cycle-2 → /team-qa cycle-3 and /team-design

## Summary of changes

13 of 21 release-checklist items closed in M0 cycle-1. M0 cycle-2 closes the remaining doc items plus repo separation (ADR-0014) plus 3 P0 bugs surfaced by Build Savage. Together they take M0 to GO state.

### Cycle-1 files modified (2026-05-14)

| File | Lines changed | Why |
|---|---|---|
| `Docs/ROMAS-Brief-Master-Strategy.md` | ~30 | Version bump v2.0→v2.1; tagline lock note; 6-rule §6.1 canonicalization |
| `Docs/ROMAS-Brief-Daily-Production-Runbook.md` | ~20 | Version bump v1.0→v1.1; 6-rule §6 canonicalization; Beehiiv→Beehiiv-newsletter wording |
| `Docs/ROMAS-Brief-500-Article-Launch-Plan.md` | ~10 | Version bump v1.0→v1.1; Sample 5 meddeviceguide.com scrub; §7 source health EU chain |
| `Docs/ARCHIVE/RETIRED-DO-NOT-USE.md` | new file | ROMAS-Wire archive notice |
| `Docs/ARCHIVE/ROMAS-Wire-Master-Strategy{,(1),(2)}.md` | moved | 3 files from `Docs/` root to `Docs/ARCHIVE/` |
| `docs/SSOT.md` | ~5 | Frontmatter v1.0.0→v1.2.0 + cycles enumeration |
| `docs/specs/adr/0005-rss-four-tier-feeds.md` | ~25 | Cycle-3 Day-1 all-tier lock rewrite + Tier 5 row + feed table refresh + supersession note |
| `docs/specs/adr/0012-video-podcast-hosting.md` | new file | Placeholder stub with Day-30 author date and 5-vendor rubric |
| `docs/specs/contracts/supabase-schema.sql` | ~15 | Subscribers schema delta: region + beehiiv_subscription_id + 4 webhook timestamps + 2 indexes + updated_at trigger |
| `docs/specs/delivery-plan.md` | ~7 | /team-design predecessor lock added to §3.4 (M3) |
| `.claude/skills/source-ingestion.md` | ~10 | Canonical-status declaration; SSOT §6 banned-source note; three-edition cron note |
| `.env.example` | new file | 16 named env vars across 6 sections (audio · Supabase · Cloudflare · email · LATAM · observability) |

Total cycle-1 files touched: **14**. Total new files: **6**. Total lines changed: ~120.

### Cycle-2 files modified (2026-05-15)

| File | Why |
|---|---|
| `Docs/specs/contracts/supabase-schema.sql:300-310` | P0 fix — `set_updated_at()` function hoisted before first trigger that references it. Original placement after migration 0010 caused migration 0009 to fail. |
| `Docs/SSOT.md:69` | AllienNova casing patch — `aliennova/romas-brief` → `AllienNova/romas-brief` to match actual GitHub org |
| `Docs/specs/adr/0014-repository-separation.md` | AllienNova casing patch — 3 instances |
| `.gitignore` | `/build/` root-anchored + `apps/*/build/` + `apps/*/dist/` + `workers/*/dist/` + `packages/*/dist/` + `!docs/build/` carve-out (fix swallow bug) |
| `docs/build/LAUNCH_ARC_PLAN.md` | New — 8-week execution choreography reference for /team-design + /team-build + /team-qa dispatches |
| `docs/build/{build-log,handoff-notes,decision-log,critic-review}.md` | Reconstructed from conversation history (gitignore bug had excluded originals from `dcc8389`) |

## Verification status

### Cycle-1

| Check | Result |
|---|---|
| `Master-Strategy.md` v2.1 header in place | PASS |
| `Runbook.md` v1.1 header in place | PASS |
| `Launch-Plan.md` v1.1 header in place | PASS |
| `SSOT.md` v1.2.0 frontmatter in place | PASS |
| All 3 ROMAS-Wire-* files moved to `ARCHIVE/` | PASS |
| `meddeviceguide.com` does not appear as primary-source citation in any live doc | PASS |
| `Subscribers` table has `region` + `beehiiv_subscription_id` | PASS |
| ADR-0012 placeholder authored | PASS |
| 6 inviolable rules in Master-Strategy + Runbook | PASS |
| `.env.example` lists all 16 named env vars | PASS |
| `delivery-plan.md` §3.4 has `/team-design` predecessor | PASS |

### Cycle-2

| Check | Result |
|---|---|
| `supabase-schema.sql` migration 0009 trigger applies clean against fresh DB | Pending pgTAP test (M1 deliverable) |
| `SSOT.md:69` row 19 reads `AllienNova/romas-brief` | PASS |
| `ADR-0014` no remaining `aliennova/romas-brief` (lowercase) | PASS — `grep -c "aliennova/romas-brief" ADR-0014` = 0 |
| `.gitignore` carve-out for `docs/build/` works | PASS — files listed below now tracked |
| `docs/build/*.md` (4 files) committed and pushed | PASS (this PR) |
| `LAUNCH_ARC_PLAN.md` v1.0.0 committed | PASS (commit `52a162e`) |

### Known gaps deferred to /team-qa cycle-3 or post-W-7

| Item | Severity | Reason for deferral |
|---|---|---|
| T-NEW renumbering across MASTER + delivery-plan (40 placeholders) | P0 → P1 with plan in place | Large mechanical work (~1.5d); planned in LAUNCH_ARC_PLAN.md as M0c2 work; if not completed by Sun 2026-05-17 EOD, dispatch as W-7 Day 0 task |
| Test-qa-plan A-NNN catalog expansion (A-009 + A-061..A-075) | P1 | Required pre-M1 for traceability; M0c2 close |
| docs/qa/test-coverage.md Tables 1+2 refresh | P1 | Architecture-reviewer re-run; cosmetic |
| CLAUDE.md + AGENT.md propagation of cycle-3..cycle-6 Q-locks | P1 | Largest structural edit set; higher-risk than other M0 work; M0c2 close |
| `.claude/skills/cms-schema.md` cycle-4 + cycle-6 sync | P2 | Skill-vs-canonical drift |
| `.claude/skills/regulatory-analyst.md` LATAM dispatch + EU fallback rewrite | P2 | Required pre-M1 but not pre-W-7 ramp start |
| `.claude/skills/editorial-style-guide.md` footer attribution rule | P2 | Required pre-M3 reader work |
| Risk register dedup re-tally | P3 | Cosmetic |
| ADR-0014 §Implementation step 5 wording update (mv → git clone fallback) | P3 | D-008 in decision-log; doc-only |

## Specific areas for /team-qa cycle-3 focus

1. **Re-verify the meddeviceguide.com scrub** — Sample 5 rewritten with European Commission AI Act page + pre-publish fact-check flag. Replacement honors Rule 4 but specific URL requires regulatory-analyst verification. /team-qa should flag this as "ready-to-verify" rather than "violation present."
2. **Migration 0009 trigger ordering fix** — author pgTAP test that applies migrations 0001..0010 in order against a fresh Supabase branch and asserts no errors. Add to A-NNN catalog as A-009.
3. **AllienNova casing patch coverage** — re-grep the full repo (incl. `.claude/skills/`, `Docs/MASTER_IMPLEMENTATION_PLAN.md`) for any remaining lowercase `aliennova` references (excluding `president@aliennova.com` email which is correct as-is).
4. **ADR-0005 rewrite** — the Day-14/30-45 wording was replaced with cycle-3 Day-1 all-tier lock. New Tier 5 row references ADR-0012 placeholder. Verify cross-references resolve.
5. **Subscribers schema delta** — `region` defaults to `'americas'` (D-002). /team-qa flag if this default differs from product-spec FR-033 intent (states region toggle auto-detected via `cf-ipcountry`).
6. **6-rule canonicalization** — both Master-Strategy §6.1 and Runbook §6 now use SSOT §2 canonical wording. Re-run T-11 mechanical check to confirm zero drift.
7. **`.env.example` inventory** — 16 env vars. Flag any env var referenced in any skill or contract that's missing.
8. **Repo separation drift** — verify all 4 internal docs that reference build paths still point at correct locations after the move.

## Risks not yet mitigated (Kimal-track, parallel)

- **B-09** (Resend webhook signature verification) — contract revision deferred to M1
- **B-10** (Beehiiv DPA + SCC) — legal track, Kimal calendar; W-4 deadline
- **H-12** (voice consent registry Q4) — Kimal legal track; W-5 deadline
- **H-01** (DeepL Pro upgrade) — DevOps + Kimal track; W-5 deadline

These are gated on Kimal-track work, not on /team-build cycle output. Surface at Monday standup.

## Commit / branch summary

| Commit | Date | Description |
|---|---|---|
| `dcc8389` | 2026-05-14 | Baseline (all M0 cycle-1 work) — note: missed docs/build/* due to gitignore bug |
| `dead752` | 2026-05-14 | Path-reference sweep after repo separation |
| `52a162e` | 2026-05-15 | Launch Arc Plan v1.0.0 + gitignore docs/build/ swallow fix |
| (next commit) | 2026-05-15 | M0c2 P0 close: migration 0009 trigger ordering + AllienNova casing + build artifact reconstruction |

## Recommended next invocations

After this commit lands and the remaining M0c2 P1 items close (Sun 2026-05-17 EOD):

- **Mon 2026-05-19 AM** — `/team-design` for 12 wireframes + 7 components + tokens.json + copy.md + a11y-audit.md + assets/manifest.md (per LAUNCH_ARC_PLAN.md §2 trigger 2)
- **Mon 2026-05-19 PM** — `/team-build M1` for foundation scaffold (per LAUNCH_ARC_PLAN.md §2 trigger 3) — must wait for /team-design plan-approve gate
- **Mon 2026-06-30** — `/team-qa cycle-3` for full readiness audit (per LAUNCH_ARC_PLAN.md §2 trigger 6)

In parallel from W-7 start (2026-05-19): editorial pre-launch ramp Mon-Fri at 06:30–07:00 ET, target 500 articles cumulative by Sun 2026-07-06.
