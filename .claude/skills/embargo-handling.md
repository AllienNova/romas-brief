---
name: embargo-handling
description: Embargo discipline for ROMAS Wire — detection, hold list management, release workflow, conference-mode posture. Load any time an item carries an embargo or might.
---

# ROMAS Wire — Embargo Handling

## Posture

**Embargoes are absolute.** An embargoed item never enters the publish queue. There is no "but it leaked" exception, no "everyone else is reporting it" exception.

Violating an embargo:

- Burns publisher / society / vendor relationships.
- Risks ASCO / ASTRO / ESTRO press credential revocation.
- Triggers reputational damage in a trust market we are still building.

---

## Detection (input side)

An item is embargoed if **any** of:

1. **Publisher field** sets `embargo`, `embargoUntil`, or `embargoDate` in the future.
2. **Conference portal** flags the abstract as embargoed (ASCO, ASTRO, ESTRO, AAPM, RANZCR, JASTRO, ESMO all do this).
3. **URL pattern** — known embargo prefixes (e.g., `*/abstract/.*?embargoed=1`).
4. **Press release** explicitly contains "EMBARGOED UNTIL" or "Hold for release until".
5. **Manual flag** from `editorial-director`, `regulatory-analyst`, or `conference-mode-operator`.

When any trigger fires → **default to embargo hold**. Verify before release.

---

## Storage

Embargoed items go to `embargo_holds`, NOT `articles`:

```sql
embargo_holds (
  candidate_title text,
  source_url text,
  source_id text,
  embargo_until timestamptz not null,
  region text[],
  notes text,
  released_at timestamptz,
  released_to_article_id uuid references articles(id),
  created_at timestamptz
)
```

`released_at` stays null until embargo lifts and we promote.

---

## Daily morning brief surfacing

Every morning brief includes an **embargo hold list** section, separate from the top-5 publish queue:

```
=== EMBARGO HOLD LIST ===
- {Title} — embargo until {ISO date} — {publisher}
- {Title} — embargo until {ISO date} — {publisher}
...
```

This list is for Kimal's awareness only. **Never published, never linked publicly.**

---

## Release workflow

When an embargo lifts (i.e., `embargo_until <= now()`):

1. `editorial-director` cron promotes the row from `embargo_holds` to `articles` (status `draft`).
2. Original `embargo_holds` row stamps `released_at = now()` and `released_to_article_id`.
3. Item enters normal scoring + draft + QA + publish pipeline.
4. The promotion event is logged.

```sql
-- Daily release scan (runs hourly)
with releasable as (
  select * from embargo_holds
  where embargo_until <= now() and released_at is null
)
-- promote each row to articles via editorial-director subagent
```

---

## Promotion gates

Even after embargo lifts, the item still must:

- Pass primary-source URL check.
- Pass relevance filter.
- Score composite ≥ 55.
- Pass clinical fact-check.

Embargo release does **not** auto-publish.

---

## Conference-mode posture

During ASTRO, ESTRO, AAPM, JASTRO, RANZCR, ESMO, ASCO:

- **All abstracts default to embargoed** until the presentation slot's official release time.
- `conference-mode-operator` maintains the embargo schedule per conference day.
- The Conference Brief tier feed has a **pre-publish embargo lint** that blocks any item whose `embargo_until > now()` from entering the RSS regeneration.

---

## Source-side honor list

Maintain a list of publishers we trust for embargo signaling:

- ASCO press portal
- ASTRO press office (`press@astro.org`)
- ESTRO press office
- AAPM media office
- NEJM, Lancet, JAMA, JCO — all flag embargo cleanly
- Society press releases via newswires (BusinessWire, PRNewswire) — check for "EMBARGOED" header
- Vendor press releases — usually unembargoed; double-check anyway

If a publisher's embargo signaling is unclear → contact press office before drafting. Hold the item.

---

## Audit log

Every embargo-related action writes to `embargo_audit_log`:

```json
{
  "action": "detected | held | released | promoted | published | violation_attempt",
  "embargo_hold_id": "...",
  "actor": "subagent_or_user_id",
  "at": "ISO",
  "notes": "..."
}
```

If a "violation_attempt" ever appears: stop, investigate, surface to Kimal.

---

## Anti-patterns

- ❌ Drafting from an embargoed source "to be ready".
- ❌ Posting the title-only as a teaser before embargo lifts.
- ❌ Citing an embargoed abstract in an unrelated article.
- ❌ "Sourcing" around the embargo by paraphrasing leaked content.
- ❌ Including an embargoed item in any RSS feed.

---

## When in doubt

**Default to hold.** It costs nothing to release a day late. It costs trust to violate.

---

*This skill is policy, not just process. Treat it accordingly.*
