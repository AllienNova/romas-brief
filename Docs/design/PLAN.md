---
title: ROMAS Brief — /team-design Plan
version: 1.0.0
date: 2026-05-15 (M0c2 close · session executes D1-D12 + D15)
authority: docs/specs/product-spec.md FR-001..FR-038 + LAUNCH_ARC_PLAN.md §2 trigger 2
status: Plan-approve self-served (single-session scope locked at invocation)
---

# /team-design Plan — Scope & Sequence

## Inputs already on disk (no need to re-author)

- `Docs/specs/product-spec.md` — 39 MUSTs (FR-001..FR-038) with KPIs and Day-1 distribution
- `Docs/specs/architecture.md` — module table + data model + state machines
- `Docs/ROMAS-Brief-Master-Strategy.md` — brand identity, ROMAS Insight discipline, sponsor firewall
- `.claude/skills/design-tokens.md` — v1.1 (color · type · spacing · motion · radius · shadow · focus ring · logo wordmark) — this is the **executable design system**, NOT being re-litigated
- `.claude/skills/component-library.md` — 7 component specs with full TSX — implementation patterns locked
- `.claude/agents/design-system-keeper.md` — PR-block rules + 32px firewall + token discipline
- `.claude/agents/web-engineer.md` — surface inventory (Homepage / Issue / Article / Friday Read / Listen / Per-tier / Subscribe / About)
- `.claude/skills/editorial-style-guide.md` — voice + banned vocab + LATAM footer rule

## Session scope (D1-D12 + D15)

Doable in this session because no MCP browser/image tooling is required:

| Phase | Output | Status |
|---|---|---|
| D1 Align | This file | In progress |
| D2 Inspect | Existing tokens + component skills read | DONE |
| D3 UX principles | `ux-principles.md` | Pending |
| D4 IA | `information-architecture.md` | Pending |
| D5 User flows | `user-flows.md` (top 10 flows × happy + edge + error paths) | Pending |
| D6 Wireframes | `wireframes.md` (12 routes × 5 states each) | Pending |
| D7 UI spec | `ui-spec.md` + `interaction-patterns.md` | Pending |
| D8 Component specs | `components/*.md` (7 files — defer full TSX to `.claude/skills/component-library.md`) | Pending |
| D9 Tokens | `tokens.json` (JSON export of `design-tokens.md` skill CSS vars) | Pending |
| D10 UX copy | `copy.md` (nav · CTA · audio states · errors · empty · success · footer · locale) | Pending |
| D11 A11y audit | `a11y-audit.md` (WCAG 2.2 AA per route + measured contrast ratios) | Pending |
| D12 Brand application | `brand-application.md` | Pending |
| D15 Self-review | `review-notes.md` | Pending |

## Session DEFERRED (D13 · D14a · D14b · D16 — needs W-6 session with full tooling)

Deferred because this session's MCP servers (playwright · chrome-devtools · filesystem · supabase) are disconnected and image-generation APIs (NanoBanana via Gemini · Imagen via Vertex · fal.ai) are not directly callable from this skill load:

| Phase | Why deferred | Pre-requisite for W-6 dispatch |
|---|---|---|
| D13 Prototype | Requires Next.js dev server + Playwright MCP for live navigation + screenshot capture | Spin up apps/reader Next.js skeleton at /team-build M1; then a focused /team-design W-6 session with Playwright available |
| D14a Asset generation | Requires NanoBanana (Gemini 2.5 Flash Image) for logo/icon/illustration/OG-card generation; Imagen for hero shots; Lottie for animations | Logo variant c is locked (teal dot under 'i' in BRIEF) — generation produces the actual SVG/PNG assets across iOS/Android/web/PWA platform matrix |
| D14b Prototype test | Requires Playwright + chrome-devtools MCP for keyboard nav, focus order, Lighthouse a11y audit | Same as D13 |
| D16 team-design-critic | The 18-dimension scorecard needs the prototype + screenshots + Lighthouse + asset manifest to score against | Run at end of W-6 session after D13/D14a/D14b complete |

## Plan-approve

Single-session scope locked at invocation time: Kimal sent the LAUNCH_ARC_PLAN.md §2 trigger 2 row as args to `/team-design`. That row says: "12 wireframes + 7 components + tokens.json + copy.md + a11y-audit.md + assets/manifest.md".

- The 12 wireframes + 7 components + tokens.json + copy.md + a11y-audit.md = doable this session (D1-D12 + D15)
- The assets/manifest.md = deferred to W-6 (image generation required; will produce assets/manifest.md with empty source/ entries this session as a stub for W-6 to fill)

Proceeding without further plan-approve wait — implicit approval from `/team-design` invocation with explicit scope arguments.

## Output inventory (this session, expected)

```
docs/design/
├── PLAN.md                           (this file)
├── ux-principles.md
├── information-architecture.md
├── user-flows.md
├── wireframes.md                     (12 routes × 5 states)
├── ui-spec.md
├── interaction-patterns.md
├── tokens.json
├── copy.md
├── a11y-audit.md
├── brand-application.md
├── review-notes.md
├── critic-review.md                  (placeholder — W-6 critic dispatch noted)
├── components/
│   ├── AudioPlayer.md
│   ├── AudioStatusBadge.md
│   ├── SponsorBlock.md
│   ├── ROMASRead.md
│   ├── IssueHeader.md
│   ├── ArticleHeader.md
│   └── SubscriberCount.md
└── assets/
    └── manifest.md                   (stub — W-6 fills source/ and platform matrix)
```

Total: 16 files. ~5k–7k lines of canonical design documentation. Engineers (`/team-build M3`) can implement the reader surface from this set against the design-tokens skill + component-library skill.
