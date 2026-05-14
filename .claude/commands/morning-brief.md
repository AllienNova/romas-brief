---
description: Run the full morning ROMAS Brief production loop — ingest, dedupe, score, select top-5, draft, fact-check, audio QA handoff, RSS regen, publish. Use Mon–Fri at 06:30 ET.
---

Run the daily ROMAS Brief production loop.

1. Read the morning cron output for today's date.
2. Invoke `editorial-director` to orchestrate end-to-end:
   - Dispatch `signal-scorer` to rank candidates.
   - Dispatch `regulatory-analyst` to verify any FDA/EMA/MHRA/PMDA hits.
   - Select top-5 (composite ≥ 55, embargoed excluded).
   - Draft each article (short brief / standard / deep report per archetype).
   - Dispatch `clinical-fact-checker` per article.
   - Dispatch `physics-reviewer` for physics-touching items.
   - Hand off to `audio-producer` (only after article passes review).
   - Wait for `audio-qa-reviewer` outcome per audio job.
   - Dispatch `rss-publisher` to regenerate affected tier feeds.
   - Dispatch `web-engineer` to render the issue page.
3. Surface source-health failures and the embargo hold list.
4. Stop before publish. Wait for Kimal final review.
