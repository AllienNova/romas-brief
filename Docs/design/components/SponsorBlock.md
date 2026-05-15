---
component: SponsorBlock
source-of-truth: .claude/skills/component-library.md §SponsorBlock
version: 1.0.0
firewall: 32px (locked, Master-Strategy §3 ledger row 3)
---

# SponsorBlock

Sponsor surface with strict 32px firewall from the ROMAS Brief wordmark. Never inside the masthead, never inside the article body, never above the hero.

## Props

```ts
type SponsorMode = 'sponsored_by' | 'partner_message';
type Props = {
  mode: SponsorMode;
  sponsor: { name: string; logoUrl?: string; cta: { label: string; href: string } };
};
```

Full TSX in `.claude/skills/component-library.md §SponsorBlock`.

## Label patterns (locked)

| mode | Label string |
|---|---|
| `sponsored_by` | "Sponsored by {Company}." |
| `partner_message` | "Partner message from {Company}." |

Banned: "Together with X", "Brought to you by X", "Powered by X". design-system-keeper PR-blocks any of these.

## States

| State | Render |
|---|---|
| Default | Aside with sponsor label + logo (32px height max) + CTA link |
| Logo missing | Same minus logo image |
| CTA href external | `target="_blank"`, `rel="noopener noreferrer sponsored"` |

## Firewall (the inviolable rule)

```
<header>...ROMAS BR[•]EF...</header>
↓ 32px minimum (--rb-sponsor-firewall) ↓
<SponsorBlock />
```

Implemented as:
- `data-firewall="32"` attribute on the SponsorBlock root `<aside>`.
- Layout test in Storybook asserts DOM-position distance between the wordmark and the firewall attribute is ≥ 32px on every viewport tested (320 / 390 / 768 / 1024 / 1440).
- design-system-keeper agent reviews every UI PR for this rule; blocks merge on violation.

## Accessibility

- `role="aside"` or `<aside>` element with `aria-label="Sponsored content"`.
- CTA link is `<a>` with descriptive text (never icon-only).
- Sponsor logo `<img>` with `alt="{Company name}"`.

## Tokens

- Background: `--rb-bg-elevated`
- Border: `1px solid --rb-rule` (hairline; no shadow)
- Padding: `--rb-space-6` (24px)
- Radius: `--rb-radius-lg` (12px)
- Outer margin: `mx-[max(2rem,var(--rb-sponsor-firewall))]` — at least 32px from any parent edge
- Label text: `--rb-text-xs uppercase tracking-wide --rb-ink-subtle`
- CTA: `--rb-text-sm font-medium --rb-accent` with hover underline

## Anti-patterns blocked

- Sponsor block within 32px of wordmark → BLOCK.
- Sponsor block inside `<main>` → BLOCK (must be `<aside>` outside main).
- Sponsor block above the hero → BLOCK.
- Co-branded masthead (sponsor logo inside `<header>`) → BLOCK (locked Day 1–90).
- Animated sponsor block → BLOCK (visually quiet by spec).
- Shadow on sponsor block → BLOCK (hairline border only).
