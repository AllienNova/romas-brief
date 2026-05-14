---
description: Run a single conference day during ASTRO / ESTRO / AAPM / JASTRO / RANZCR / ESMO / ASCO — Conference Brief episode production with strict embargo discipline.
---

Run today's Conference Brief production cycle.

1. Invoke `conference-mode-operator`.
2. Read `conference_schedule.json` for today's sessions and embargo lift times (in local TZ).
3. Ingest overnight published abstracts and press releases.
4. After each session's embargo lifts, promote items into the daily pipeline with `tier = conference`.
5. Draft today's Conference Brief episode (15–30 min target):
   - 3–6 segment blocks, each 3–6 min.
   - Each block: what was presented, numbers, why it matters, limitations, ROMAS Take, primary-source citation.
6. Hand off audio to `audio-producer` → `audio-qa-reviewer`.
7. After QA pass, `rss-publisher` regenerates `conference-brief.xml` with embargo lint applied.
8. Surface to Kimal for sign-off before publish.

Reminder: embargo is absolute. Default to hold when ambiguous.
