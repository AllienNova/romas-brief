# ROMAS NoticeBoard — Production Spec v2 (Final Product)

> **For:** Claude Code (and engineers) building the complete, production NoticeBoard.
> **Product:** ROMAS (Radiation Oncology Multi-Agentic System) — homepage module + supporting backend, admin, and archive.
> **Supersedes:** Spec v1 (polish pass). v1's "Phase 2+ / out of scope" items are now **in scope** for the final product. Phases below are a **build order**, not a scope wall.
> **Assumed stack:** Next.js (App Router, React Server Components) + TypeScript + Tailwind on the frontend; Postgres + an ORM (Prisma assumed) on the backend; edge/CDN caching with on-demand revalidation. Swap equivalents if the repo differs, but keep the contracts in §6–§9 stable.

---

## 0. What "final product" means here

A self-serving, DB-driven, scheduled, monetizable, accessible professional billboard that:

1. **Informs** clinicians/physicists/dosimetrists/admins in 5–10 seconds.
2. **Signals liveness** so ROMAS feels active and professionally managed.
3. **Monetizes** through clearly firewalled partner inventory.
4. **Operates without code changes** — editors schedule notices, sponsors are approved, the homepage selects and renders the right mix automatically, content expires on time, and the board fails gracefully.

The single invariant across everything: **trust is the product.** Sponsored content must look and behave differently from editorial even if the label is never read — enforced by the type system *and* the database *and* the API.

---

## 1. Locked design decisions (carry forward from v1 — do not relitigate)

| Decision | Verdict |
|---|---|
| Card-based layout, asymmetric grid | **Keep** (asymmetry is intentional) |
| Card **flipping** | **Permanently rejected** — never build it |
| Sponsored quarantine (muted bg, dashed border, no rail, no pulse, no hover lift, disclosure) | **Keep exactly** |
| Featured card reads as the lead story | **Yes**, modest emphasis, premium not noisy |
| Distinct "billboard" section identity | **Yes** |
| Full-width band | **Default contained; full-width is a feature-flagged mode + A/B**, and the default for Conference Mode |
| Auto-rotation | **Allowed but controlled** — secondary slot only, manual controls, pause-on-hover, reduced-motion aware, one-cycle auto-stop, volume-gated. Never the featured card, never sponsored, never urgent notices. |

---

## 2. System architecture (high level)

```
┌─────────────────────────────────────────────────────────────────┐
│ Homepage (Next.js RSC)                                            │
│   <NoticeBoard/>  ──fetch──►  GET /api/notices/board  (cached)    │
│                                                                   │
│ /notices archive page  ──►  GET /api/notices?filter&search&page   │
│                                                                   │
│ Admin (/admin/notices)  ──►  CRUD + approval + schedule + preview │
└─────────────────────────────────────────────────────────────────┘
        │  on publish/expire/approve → on-demand revalidate (tag)
        ▼
┌─────────────────────────────────────────────────────────────────┐
│ API layer (route handlers / tRPC)                                 │
│   - board selection engine (§9)  - sponsor validation (§11)       │
│   - telemetry ingest (§12)       - RBAC guard (§14)               │
└─────────────────────────────────────────────────────────────────┘
        ▼
┌─────────────────────────────────────────────────────────────────┐
│ Postgres                                                          │
│   notices · sponsors · inventory_slots · notice_events (telemetry)│
│   scheduled status transitions via cron/edge function (§10)       │
└─────────────────────────────────────────────────────────────────┘
```

### Rendering & caching strategy (this is the part the design review missed)
Notices **expire**, so the board can't be pure-static and can't be naively long-cached.

- Render `<NoticeBoard/>` as a **React Server Component** that calls `GET /api/notices/board`.
- Cache the board response with a **short TTL** (e.g. 60s) **plus a cache tag** (`notices-board`).
- On any editor action that changes what's live (publish, expire, approve, unpublish, schedule-into-now), call **on-demand revalidation** of the `notices-board` tag so the homepage updates within seconds, not on the next TTL.
- A **scheduled job** (cron / edge function, every 1–5 min) flips `scheduled→published` and `published→expired` based on `publishAt`/`expiresAt`, then revalidates the tag. This is what makes scheduling work without an editor present.
- Compute `isNew` and any "live"/"happening now" state **at render time** from timestamps, never store a stale boolean.
- **Resilience:** if the fetch fails or returns empty, render a curated **static fallback** board (a small set of evergreen first-party notices bundled in code). The homepage must never show a broken or empty board. Wrap in an error boundary.

### Time & timezone handling (also missed by the review — and the screenshot demands it)
- Store all timestamps in **UTC**.
- Display dates in the **viewer's local timezone** by default.
- **Events** carry an explicit IANA `timezone` (e.g. `Europe/Vienna` for ESTRO). Render the event's date/time in **its own timezone** with a tz label, and optionally a "(your time: …)" hint. Conference Mode shows session times in **conference local time** per the screenshot.
- "Happening now" / "live" badges are derived from `startsAt`/`endsAt` vs `Date.now()`, computed at render.

---

## 3. Homepage placement & layout

Render below the hero, above deeper editorial modules. Default container is **contained** (not full-width). A `fullWidth` feature flag promotes it to a full-width "billboard band" for A/B testing and for Conference Mode.

Preserve asymmetry. Mobile is stacked, no hover/rotation/flip. (Same responsive layout as Spec v1 §5 — desktop 12-col asymmetric, tablet 2-col, mobile single-column with tap targets ≥44px.)

Homepage display budget (enforced by the selection engine, §9):
```
featured            : exactly 1
editorial/news/event: 3–4 visible
sponsored (partner) : 1–2 visible
inventory slot       : 0–1
```
Everything beyond budget routes to the `/notices` archive.

---

## 4. Frontend component architecture

Split so the sponsor firewall is enforced by the type system, not editor discipline. No single mega-card.

```
components/notice-board/
  NoticeBoard.tsx              // RSC shell: fetch, backdrop, error boundary, fullWidth flag
  NoticeBoardHeader.tsx        // label + live dot + taxonomy + Advertise link
  NoticeGrid.tsx               // responsive grid + stagger-reveal orchestration
  RotatingSlot.tsx             // controlled rotation for ONE secondary slot (§10)
  cards/
    FeaturedNoticeCard.tsx     // exactly 1; strongest hierarchy
    EditorialNoticeCard.tsx    // announcement/news
    EventNoticeCard.tsx        // event variant (tz-aware date)
    SponsoredNoticeCard.tsx    // SEPARATE; quarantined styling; accepts ONLY SponsoredNotice
    InventorySlotCard.tsx      // data-driven state machine (§11)
    ConferenceLeadCard.tsx     // featured replacement in Conference Mode (§13)
  primitives/
    NoticeTypeBadge.tsx
    NewIndicator.tsx           // dot-only pulse; editorial only
    LiveDot.tsx                // header status dot; aria-hidden
    NoticeCTA.tsx              // the ONLY anchor in a card (§16)
  notice-board.types.ts
  notice-board.styles.css      // reduced-motion media queries live here
app/notices/
  page.tsx                     // archive: filters + search + pagination (§17)
app/admin/notices/
  ...                          // editor/admin CRUD + approval + preview (§14)
```

**Hard rule:** `SponsoredNoticeCard` / `InventorySlotCard` must not import the editorial accent-rail, hover-lift, or pulse styles. Separate style module. A developer must be *unable* to give a partner card editorial styling.

---

## 5. Data model — Postgres schema

```sql
-- Enums
CREATE TYPE notice_type     AS ENUM ('announcement','news','event','partner','advertise','system','trial','conference');
CREATE TYPE notice_priority AS ENUM ('featured','high','normal','low');
CREATE TYPE notice_status   AS ENUM ('draft','pending_review','scheduled','published','expired','archived');

CREATE TABLE sponsors (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  contact_email text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notices (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type             notice_type NOT NULL,
  title            text NOT NULL CHECK (char_length(title)  BETWEEN 1 AND 90),
  summary          text NOT NULL CHECK (char_length(summary) BETWEEN 1 AND 220),
  cta_label        text CHECK (cta_label IS NULL OR char_length(cta_label) <= 24),
  cta_url          text,
  date_label       text,                 -- optional display override, e.g. "Sep 27–30"
  starts_at        timestamptz,          -- events
  ends_at          timestamptz,
  timezone         text,                 -- IANA, required when type='event'/'conference'
  publish_at       timestamptz NOT NULL,
  expires_at       timestamptz,
  priority         notice_priority NOT NULL DEFAULT 'normal',
  status           notice_status   NOT NULL DEFAULT 'draft',
  pinned           boolean NOT NULL DEFAULT false,
  audience         text[],               -- e.g. {physicist,dosimetrist,admin}; empty = all
  region           text[],               -- e.g. {US,EU}; empty = global
  conference_key   text,                 -- groups notices under a conference (e.g. 'ASTRO-2026')
  -- sponsorship (nullable for editorial)
  is_sponsored     boolean NOT NULL DEFAULT false,
  sponsor_id       uuid REFERENCES sponsors(id),
  sponsor_disclosure text,
  created_by       uuid NOT NULL,        -- editor user id
  approved_by      uuid,                 -- required before a sponsored notice publishes
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  -- FIREWALL ENFORCED AT THE DB LEVEL:
  CONSTRAINT sponsored_requires_partner_type
    CHECK (is_sponsored = false OR type = 'partner'),
  CONSTRAINT sponsored_requires_disclosure
    CHECK (is_sponsored = false OR (sponsor_id IS NOT NULL AND sponsor_disclosure IS NOT NULL)),
  CONSTRAINT partner_is_sponsored
    CHECK (type <> 'partner' OR is_sponsored = true),
  CONSTRAINT sponsored_cannot_be_featured
    CHECK (is_sponsored = false OR priority <> 'featured'),
  CONSTRAINT event_requires_timezone
    CHECK (type NOT IN ('event','conference') OR timezone IS NOT NULL)
);

-- Only one featured notice may be live at a time:
CREATE UNIQUE INDEX one_live_featured
  ON notices ((true))
  WHERE priority = 'featured' AND status = 'published';

CREATE INDEX notices_board_lookup ON notices (status, publish_at, expires_at, priority);
CREATE INDEX notices_conference   ON notices (conference_key) WHERE conference_key IS NOT NULL;

-- Inventory slots (sellable positions on the board)
CREATE TYPE slot_kind AS ENUM ('homepage_partner','conference_partner','newsletter_companion','workflow_message','vendor_event');

CREATE TABLE inventory_slots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        slot_kind NOT NULL,
  notice_id   uuid REFERENCES notices(id),  -- null = unsold/empty
  starts_at   timestamptz,
  ends_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Telemetry (no PII; see §12)
CREATE TYPE notice_event_kind AS ENUM ('impression','click');
CREATE TABLE notice_events (
  id          bigserial PRIMARY KEY,
  notice_id   uuid NOT NULL REFERENCES notices(id),
  kind        notice_event_kind NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  surface     text                          -- 'homepage' | 'archive' | 'conference'
);
CREATE INDEX notice_events_rollup ON notice_events (notice_id, kind, occurred_at);
```

The DB-level CHECK constraints make the firewall **physically impossible to violate** even if the API and frontend have a bug. That redundancy is deliberate: defense in depth for the thing that protects your brand and ad revenue.

---

## 6. TypeScript contracts (shared, source of truth)

```ts
export type NoticeType =
  | "announcement" | "news" | "event" | "partner"
  | "advertise" | "system" | "trial" | "conference";
export type NoticePriority = "featured" | "high" | "normal" | "low";
export type NoticeStatus =
  | "draft" | "pending_review" | "scheduled" | "published" | "expired" | "archived";

interface NoticeBase {
  id: string;
  title: string;          // ≤90
  summary: string;        // ≤220
  ctaLabel?: string;      // ≤24
  ctaUrl?: string;
  dateLabel?: string;
  startsAt?: string;      // ISO UTC
  endsAt?: string;        // ISO UTC
  timezone?: string;      // IANA
  publishAt: string;      // ISO UTC
  expiresAt?: string;     // ISO UTC
  priority: NoticePriority;
  status: NoticeStatus;
  pinned: boolean;
  audience?: string[];
  region?: string[];
  conferenceKey?: string;
  isNew: boolean;         // DERIVED at render (publishAt within NEW window)
}

export interface EditorialNotice extends NoticeBase {
  type: "announcement" | "news" | "event" | "system" | "trial" | "conference";
  isSponsored: false;
}

export interface SponsoredNotice extends NoticeBase {
  type: "partner";
  isSponsored: true;            // literal — required
  sponsorName: string;          // required
  sponsorDisclosure: string;    // required
}

export type Notice = EditorialNotice | SponsoredNotice;

export type InventorySlotState =
  | { state: "unsold" }                              // "Advertise on the Board →"
  | { state: "internal"; notice: EditorialNotice }   // first-party ROMAS promo
  | { state: "sold"; notice: SponsoredNotice }       // render SponsoredNoticeCard
  | { state: "empty" };                              // render null, grid collapses

export interface BoardPayload {
  featured: EditorialNotice | null;
  editorial: EditorialNotice[];   // news/announcement/event/trial
  sponsored: SponsoredNotice[];
  inventory: InventorySlotState;
  rotatingSecondary?: EditorialNotice[]; // optional pool for RotatingSlot (§10)
  conferenceMode?: ConferenceContext | null;
  fullWidth: boolean;             // feature flag resolved server-side
}

export interface ConferenceContext {
  key: string;            // 'ASTRO-2026'
  label: string;          // 'ASTRO 2026'
  timezone: string;       // IANA conference local tz
  lead: EditorialNotice;  // conference lead card
}
```

The discriminated union means `EditorialNoticeCard` cannot accept a `SponsoredNotice` and vice versa — a compile error. Add a `@ts-expect-error` fixture in tests to prove it.

---

## 7. API contracts

```
GET  /api/notices/board
     → BoardPayload  (cached 60s, tag: notices-board; runs the selection engine §9)

GET  /api/notices?type=&conference=&q=&page=&pageSize=
     → { items: Notice[]; total: number; page: number }   (archive §17)

POST /api/notices/events            (telemetry ingest §12; batched, beacon-friendly)
     body: { events: { noticeId: string; kind: 'impression'|'click'; surface: string }[] }
     → 204

-- Admin (RBAC-guarded §14) --
POST   /api/admin/notices           create (draft)
PATCH  /api/admin/notices/:id       update / schedule / publish / unpublish
POST   /api/admin/notices/:id/approve   approve sponsored (admin/sponsor-manager only)
DELETE /api/admin/notices/:id       archive
GET    /api/admin/notices/:id/preview   render-as-it-would-appear

POST /api/internal/revalidate-board  (called by publish actions + scheduler; tag invalidation)
POST /api/internal/run-schedule      (cron: scheduled→published, published→expired, then revalidate)
```

All write endpoints validate against the §6 contracts **server-side** and reject sponsored notices missing disclosure/approval (§11). Sanitize `title`/`summary`/`ctaUrl` (no script, allowlist URL schemes `https:` only for external CTAs).

---

## 8. Selection / slotting engine (pure, testable)

`selectBoard(notices, slots, now, viewer): BoardPayload`

Deterministic algorithm:
1. Filter to `status = 'published'` AND `publishAt ≤ now` AND (`expiresAt` is null OR `expiresAt > now`).
2. Apply audience/region targeting against `viewer` (empty arrays = match all).
3. If a `conferenceKey` is active (a conference notice is live and within its window) → build `ConferenceContext`, promote conference lead, raise event cards (§13).
4. Pick **featured**: the single `priority='featured'` editorial notice (guaranteed unique by DB index); else the highest-priority pinned editorial.
5. Fill **editorial** up to budget (3–4) ordered by: `pinned` desc, `priority` desc, `publishAt` desc.
6. Fill **sponsored** up to budget (1–2) — sold inventory slots first.
7. Resolve **inventory slot** state machine (§11).
8. Overflow editorial beyond budget → `rotatingSecondary` pool (only used if rotation flag on, §10) and the rest is reachable via archive.

Keep this a **pure function** with no I/O so it unit-tests in isolation. The whole "board never clutters" guarantee lives here.

---

## 9. NEW indicator, motion, rotation

### NEW
- `isNew` derived: `publishAt` within last **7 days**. Editorial only — **never** sponsored. **Dot-only** pulse.

### Motion
| Element | Motion |
|---|---|
| Editorial | stagger reveal on first scroll-in + subtle hover lift |
| Featured | subtle reveal; slightly stronger (still restrained) hover |
| Sponsored | **none** |
| Inventory unsold/internal | minimal; no lift |

### Controlled rotation (`RotatingSlot`, feature-flag + volume-gated)
Allowed for **one secondary editorial slot only**. Requirements (all mandatory when enabled):
- Interval 8–12s minimum; **auto-stop after one full cycle**.
- Manual prev/next + position indicator; **pause on hover and on focus**.
- Never rotates: featured, sponsored, urgent/`system`, or anything pinned.
- Disabled entirely under `prefers-reduced-motion` and when `rotatingSecondary.length < 2`.
- Crossfade only — **no flip, no slide-bounce**.

### `prefers-reduced-motion: reduce`
Disable all reveal/lift/pulse/rotation via CSS:
```css
@media (prefers-reduced-motion: reduce){
  .notice-card,.notice-card *{animation:none!important;transition:none!important;}
}
```

---

## 10. Scheduling & lifecycle

State machine: `draft → pending_review → scheduled → published → expired → archived`.
- Sponsored notices **must** pass `pending_review → approve` before they can be `scheduled`/`published`.
- The scheduler job (cron/edge) every 1–5 min: promote `scheduled→published` when `publishAt ≤ now`; demote `published→expired` when `expiresAt ≤ now`; then revalidate the board tag.
- Manual publish/unpublish also revalidates immediately.
- `pinned` overrides ordering but not budget; an expired pinned notice still expires.

---

## 11. Inventory & monetization

Inventory slot is a state machine (`InventorySlotState`):

| State | Render | Notes |
|---|---|---|
| `unsold` | Muted card, "Advertise on the Board →" | Restrained copy only |
| `internal` | First-party ROMAS promo (editorial styling allowed — it *is* first-party) | |
| `sold` | `SponsoredNoticeCard` (full quarantine + disclosure) | |
| `empty` | `null` — grid collapses cleanly | No dead box |

**Sellable inventory kinds:** homepage partner slot, conference partner slot, newsletter companion, sponsored workflow message, vendor/webinar event slot.

**Sponsor firewall — enforced in three layers:**
1. **DB**: CHECK constraints (§5) — sponsored ⇒ partner type, disclosure present, never featured.
2. **API**: reject publish of a sponsored notice without `sponsorId`, `sponsorDisclosure`, and `approvedBy`.
3. **Frontend**: discriminated types + separate component + separate styles.

**Banned sponsor CTA copy:** "Get Started Now", "Claim Your Spot", "Limited Time Offer". **Allowed:** "Learn more →", "Advertise on the Board →". Label: `Partner Message · Sponsored`.

**Pricing hooks (data only, no billing UI now):** slot scheduling via `inventory_slots.starts_at/ends_at` enables 7-day / 14-day / conference-week / premium-conference packages later without schema change.

---

## 12. Telemetry & analytics (privacy-first)

- Track **impressions** (IntersectionObserver, ≥50% visible for ≥1s, debounced, once per notice per page view) and **clicks** (on CTA).
- Send via `navigator.sendBeacon` / batched `POST /api/notices/events`. **No PII, no user identifiers, no PHI** — aggregate counts only. This is a medical-audience platform; do not attach session or patient data, ever.
- Derived metrics for the admin: impressions, clicks, CTR, and **fill rate** (sold vs unsold slot-days). These justify pricing and prove the board is a live engagement surface.
- Respect Do-Not-Track / consent settings; gate telemetry behind the site's existing consent mechanism.

---

## 13. Conference Mode

When a conference notice is live within its window (`conferenceKey` active):
- Featured slot becomes the **ConferenceLeadCard** (e.g. "ASTRO 2026 — Daily Briefs").
- Event cards for that `conferenceKey` raise in priority.
- Sponsored slots may be **conference-specific** (`conference_partner` inventory).
- Board copy shifts from general notices to conference intelligence.
- Session times render in **conference local time** (`ConferenceContext.timezone`) with a tz label — matches the screenshot ("Sessions tracked in conference local time").
- Conference Mode may opt into the **full-width band** (the one place full-width is on by default).
- Embargo-aware: notices can be `scheduled` to publish exactly at embargo lift.

---

## 14. Admin / editor controls & RBAC

Roles: `viewer` < `editor` < `sponsor_manager` < `admin`.
- **editor**: create/edit/schedule editorial notices.
- **sponsor_manager**: manage sponsors + approve sponsored notices.
- **admin**: everything, including feature flags (full-width, rotation).
- Sponsored notices require a `sponsor_manager`/`admin` **approval** before publish (`approved_by` set).
- Admin features: CRUD, schedule picker (with tz), live **preview** (renders exactly as it would appear, including quarantine), reorder/priority, pin, audience/region targeting, conference grouping, inventory assignment, telemetry dashboard.
- All admin routes RBAC-guarded server-side; never trust client role claims.

---

## 15. Visual design system

Carry the blue/violet system. Strengthen the billboard identity (subtle low-opacity radial/mesh or dotted backdrop, tinted section surface distinct from page bg, stronger header, header `LiveDot` with reserved space so it can't cause CLS). Featured card: larger title, taller, `Featured` micro-label, stronger left rail, breathing room — premium not noisy.

Color logic:
```
announcement: blue   news: blue/cyan   event/conference: purple
trial: teal/green    partner: muted neutral gray   system/urgent: amber/red (rare)
```
Icons small & secondary (megaphone/calendar/document/tag/flask/alert). Full dark-mode parity. Full-width mode is a layout variant of the same components, not a fork.

---

## 16. WEB-2 — Nested-anchor hydration fix (do this first)

The "whole card is a link AND the CTA is a link" pattern nests `<a>` in `<a>` → hydration mismatch. Fix with **one real anchor + a stretched-link pseudo-element**:

```tsx
export function NoticeCTA({ href, label, ariaLabel, stretch = true }:{
  href:string; label:string; ariaLabel?:string; stretch?:boolean;
}) {
  return (
    <a href={href} aria-label={ariaLabel ?? label}
       className={stretch ? "notice-cta notice-cta--stretched" : "notice-cta"}>
      {label} <span aria-hidden="true">→</span>
    </a>
  );
}
```
```css
.notice-card{position:relative;}
.notice-cta--stretched::after{content:"";position:absolute;inset:0;z-index:1;}
.notice-card .interactive{position:relative;z-index:2;}
```
Acceptance: zero hydration warnings (dev + prod); **exactly one anchor per card** (asserted in test); whole card clickable; one focus stop per card; right-click/open-in-new-tab works.

---

## 17. Archive page (`/notices`)

- Filters: `All | Announcements | News | Events | Trials | Partner Messages` (+ conference grouping).
- Search over title/summary (Postgres `tsvector` / `ILIKE` for v1, FTS later).
- Pagination or infinite scroll (cursor-based).
- Same card components; sponsored quarantine still enforced; reduced-motion respected.

---

## 18. Performance & resilience

- Board fetch cached 60s + tag revalidation; archive paginated.
- No CLS from `LiveDot` or stagger reveal (reserve space, transform-only animations).
- Lazy-load below-fold archive images; the homepage board is above-fold → no lazy on its first paint.
- Error boundary + static fallback board on fetch failure/empty.
- Telemetry batched + beacon so it never blocks navigation.

---

## 19. Security & compliance

- HTTPS-only external CTA URLs; sanitize all user/editor-entered HTML/text; escape on render.
- RBAC server-side on every write/admin route.
- Sponsor firewall in DB + API + UI (§11).
- No PII/PHI in telemetry (§12); honor consent.
- Audit fields: `created_by`, `approved_by`, `updated_at`.

---

## 20. Testing strategy

**Unit:** `selectBoard()` (featured cardinality, budget caps, sponsored cap, overflow→rotating/archive, audience/region filtering, conference promotion); `isNew` 7-day boundary; inventory state machine; tz/date formatting incl. conference local time; sponsor validation rejects missing disclosure/approval.
**Type:** `@ts-expect-error` proving `SponsoredNotice` can't enter `EditorialNoticeCard`.
**Component/DOM:** exactly one anchor per card; `SponsoredNoticeCard` never emits rail/pulse/lift classes.
**A11y:** jest-axe zero violations (light+dark, contained+full-width); keyboard one-stop-per-card; SR announces sponsorship; `LiveDot` not announced; reduced-motion disables all animation+rotation.
**Integration:** scheduler promotes/expires + revalidates; on-demand revalidation updates homepage; DB CHECK constraints reject illegal sponsored rows; fallback renders on fetch failure.
**E2E (Playwright):** publish→appears, expire→disappears, approve gate for sponsored, rotation controls (pause on hover/focus, one-cycle stop), Conference Mode switch, full-width A/B flag.
**Visual regression:** mobile/tablet/desktop × light/dark × contained/full-width × normal/conference.
**Telemetry:** impression fires once per view ≥50%/1s; click logged; no PII in payload; consent gating.

---

## 21. Definition of Done (final product)

- [ ] DB schema + CHECK constraints + indexes deployed; firewall un-violable at DB level.
- [ ] Board RSC + 60s cache + tag revalidation; scheduler flips statuses on time.
- [ ] `selectBoard()` pure, unit-tested, honors budget + targeting + conference.
- [ ] Featured unique-when-live (DB index) and visually the lead, premium not noisy.
- [ ] Sponsored quarantine enforced in DB + API + UI; banned CTA copy blocked; disclosure required; approval gate works.
- [ ] Inventory slot state machine (4 states); `empty`→null; sellable kinds modeled.
- [ ] Telemetry: impressions/clicks, CTR + fill-rate in admin; **no PII/PHI**; consent-gated.
- [ ] Conference Mode: lead promotion, conference-local-time rendering, optional full-width, embargo scheduling.
- [ ] Archive `/notices` with filters + search + pagination.
- [ ] Admin CRUD + RBAC + schedule (tz) + preview + approval.
- [ ] Controlled rotation meets all §9 requirements; flipping absent.
- [ ] **WEB-2 resolved:** zero hydration warnings; one anchor per card.
- [ ] Full `prefers-reduced-motion` compliance; jest-axe clean; dark-mode parity.
- [ ] Error boundary + static fallback; no CLS from board.
- [ ] Full-width band behind feature flag, ready for A/B.

---

## 22. Build order (sequence, not scope wall)

1. **WEB-2** anchor fix + component split + discriminated types + fixtures (de-risk first).
2. DB schema + constraints + seed; `selectBoard()` pure engine + unit tests.
3. Board API + 60s cache + tag revalidation + static fallback + error boundary.
4. Billboard identity + featured upgrade + sponsored quarantine + inventory state machine (UI).
5. Scheduler job + lifecycle + on-demand revalidation.
6. Telemetry (client beacon + ingest + rollups) with consent gating.
7. Admin CRUD + RBAC + approval + schedule (tz) + preview.
8. Archive page (filters + search + pagination).
9. Conference Mode (lead promotion, conf-local-time, embargo, optional full-width).
10. Controlled rotation (flagged, volume-gated) + full-width A/B flag.
11. A11y + visual-regression + E2E + load testing → meet DoD.

---

*End of spec. Build the whole thing — but when a UI choice is ambiguous, prefer the calmer, more static, more clearly-labeled option. Trust is the product.*
