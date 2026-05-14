---
description: Verify every clinical claim in an article body against primary sources. Blocks publish until all claims are verified.
---

Verify claims for article `$ARGUMENTS` (slug or id).

1. Invoke `clinical-fact-checker`.
2. Read `articles.body_md`.
3. Extract every clinical / regulatory / quantitative / attributed claim → one `claims` row per claim.
4. For each claim:
   - Fetch the source URL.
   - Search content for the claim text or close paraphrase.
   - Match → set `verified_by`, `verified_at`, `confidence`.
   - Miss → mark UNVERIFIED.
5. If ANY claim is unverified, block article from moving to `ready_to_publish`.
6. Return a verification report:
   - Claims extracted / verified / unverified.
   - For each unverified: claim text, source checked, issue, suggested rewrite.
