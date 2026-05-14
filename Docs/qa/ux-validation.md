---
title: UX / Design Conformance Validation — plan-level
version: 1.0.0
date: 2026-05-14
scope: Design-system + reader-flow conformance plan for /team-build. No reader UI yet — this validates the plan that the design surface is buildable.
---

# UX / Design Validation — Plan Level

## Critical missing artifacts (P0)

| Artifact | Required by | Status |
|---|---|---|
| `Docs/ROMAS-Brief-Design-Specification.md` v1.1 | CLAUDE.md §6, README, FR-019 sponsor firewall, FR-028 8-module homepage | **MISSING** — R-005 in M1, design-system-keeper to author |
| `Docs/ROMAS-Brief-Audio-Architecture.md` v1.0 | CLAUDE.md §6, FR-007..FR-010, audio-producer skill | **MISSING** — R-006-A in M1 |
| `docs/design/wireframes.md` | This QA's UX check; team-design output | **MISSING** — never produced (Kimal had me sketch in chat, but it's not committed to repo) |
| `docs/design/user-flows.md` | Critical-path testing per team-qa skill | **MISSING** |
| `docs/design/components/*.md` | Per-component spec for AudioPlayer Variant A/B, SponsorBlock, ROMASRead, IssueHeader, ArticleHeader, AudioStatusBadge | **MISSING** |
| `docs/design/tokens.md` | Currently lives in `.claude/skills/design-tokens.md` v1.1 (locked tokens for audio-published/pending/skipped) + chat-only cycle-1 proposal for category color tokens (--rb-cat-*) | **PARTIAL** — formal handoff doc not yet authored |
| `docs/design/accessibility.md` | WCAG 2.2 AA per design-system-keeper | **MISSING** |

## Designed surfaces (per SSOT §12.4 + Launch Plan §4)

The reader site needs the following routes Day 1. None are designed at the wireframe-spec level:

| Route | Module / template | Wireframe? | Component spec? |
|---|---|---|---|
| `/` (homepage) | 8 modules per SSOT §12.3 | No | No |
| `/issues/{YYYY-MM-DD}` | IssueHeader + ArticleList + AudioPlayer Variant B sticky | No | No |
| `/articles/{slug}` | ArticleHeader + body + AudioPlayer Variant A inline + Source pill + ROMAS Take label + Comments-off | No | No |
| `/categories/{slug}` (11 pages) | CategoryHeader + sub-category nav + ArticleList + filter chips | No | No |
| `/regions/{slug}` (8 pages, rebalanced to 7 per cycle-5) | RegionHeader + ArticleList | No | No |
| `/for/{audience}` (5+ pages) | AudienceFilter + ArticleList | No | No |
| `/listen` (4-tier audio grid) | TierGrid + per-tier episode list + AudioPlayer Variant B sticky | No | No |
| `/watch` (Tier 5 placeholder Day 1, populated Day 60) | VideoPodcastPlaceholder | No | No |
| `/topics/{slug}` (modality + disease-site + AI-impact) | TopicHeader + ArticleList | No | No |
| `/papers` (100 paper-critique archive) | PaperArchive + JournalFilter | No | No |
| `/search` | SearchInput + ResultList (FTS+pgvector) | No | No |
| `/sponsor` (dedicated page, no nav until Day 90) | SponsorPage | No | No |

## Designed components (from `.claude/skills/component-library.md` v1.1)

Read-only inspection of the skill file: lists AudioPlayer Variant A + Variant B, SponsorBlock, ROMASRead, IssueHeader, ArticleHeader, AudioStatusBadge, ListenPage as required components. The skill is operational guidance, not a wireframe/spec set.

**5-state coverage** (loading / empty / error / success / partial) not yet documented for any component.

## A11y plan

| Check | Tooling | When |
|---|---|---|
| WCAG 2.2 AA conformance | axe-core via Playwright; pa11y | Per-PR (advisory) + main-merge (blocking ≥serious per cycle-1 F-P2-06 fix) |
| Keyboard nav (Tab / Esc / Enter) | Manual + Playwright | Per-PR for reader-surface changes |
| Reduced-motion suppression | CSS `prefers-reduced-motion` check | Per-PR |
| 200% text-size layout | Playwright viewport overrides | Per-PR for reader-surface changes |
| Color contrast ≥4.5:1 (body) / ≥3:1 (UI) | axe-core | Per-PR |
| Screen-reader landmarks + ARIA | Manual + axe | M3 sign-off |
| Lighthouse a11y ≥95 per page | Chrome DevTools MCP `lighthouse_audit` | Pre-launch + per-PR for reader changes |

## Three-edition publish UX impact (cycle-5 lock)

The three-edition strategy raises new UX questions not yet answered:

1. **Edition indicator**: Does the homepage show "APAC Edition" / "EU Edition" / "Americas Edition" badge? Reader expectation per Imaging Wire inspiration: implicit, no badge.
2. **Region toggle**: When a reader changes region preference, does the homepage re-render from the active edition's ranking, or do they always see "their" region's edition? **Not specified.**
3. **Cross-region article visibility**: An Americas-edition-anchored Hero from CMS publishes globally but ranks differently per edition. Reader switching from Americas to APAC view should see consistent article URLs. **Verified by URL canonicalization at `/articles/{slug}`** — but not tested.
4. **Issue archive**: `/issues/{YYYY-MM-DD}` — is the date the calendar date in UTC, in the reader's locale, or in the edition's locale? **Not specified.**
5. **Time-of-publish display**: Article timestamp — UTC, edition-local, or reader-local? Per FR-034 (locale-aware formatting) → reader-local via `Intl.DateTimeFormat`. **Confirmed in spec.**

## LATAM editorial UX (cycle-6 lock)

The footer attribution "Source originally in {Portuguese|Spanish}; translated with editorial review." (ADR-0013) needs:

1. **Component spec**: where in the article template, what styling, what i18n keys for Portuguese vs Spanish source-language labels
2. **Verbatim quote rendering**: italic + parens for original-language text — needs component-library entry
3. **A11y**: footer attribution has `lang="pt"` or `lang="es"` attribute on the original-language quote span to honor screen-reader pronunciation

None of these are specced.

## Sponsor firewall enforcement

FR-019: ≥32px isolation. R-303 in M3 to ESLint-rule `<SponsorBlock>` component. Component spec missing.

## Subscriber count display

FR-020 + cycle-1 F-S-002 R-015 (cycle-2 closed): app-layer guard returns qualitative string < 2,500; numeric ≥ 2,500. Component spec missing.

## Verdict

**RED.** Design-system handoff to /team-build cannot proceed cleanly without `Docs/ROMAS-Brief-Design-Specification.md v1.1` + `Docs/ROMAS-Brief-Audio-Architecture.md v1.0` (R-005 + R-006-A) and ideally a `/team-design` pass producing concrete wireframes, component specs, and 5-state coverage. **M1 must close R-005 + R-006-A before M3 reader work starts**; recommend `/team-design` invocation before /team-build M3.
