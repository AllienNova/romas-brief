---
description: Draft a new Supabase migration following ROMAS Wire schema discipline. Migration is append-only and invariant-preserving.
---

Draft a new Supabase migration for `$ARGUMENTS` (intent description).

1. Invoke `cms-engineer`.
2. Read the relevant skill (`cms-schema`) to understand the existing schema.
3. Choose timestamp filename: `supabase/migrations/YYYYMMDDHHMMSS_descriptive_name.sql`.
4. Draft the migration:
   - One concern only.
   - Preserve all inviolable constraints (primary_source_url NOT NULL, audio_publish_requires_qa, embargo_consistency, insight_labeled).
   - Add indexes for any new query patterns.
   - Add RLS policies for any new table.
   - Add `updated_at` trigger if a mutable table.
5. Test on local Supabase shadow DB:
   - Constraints fire as expected.
   - RLS works.
   - No FK orphans.
6. Surface to Kimal with: migration SQL, test results, intent, invariants affected.
7. **Never apply to prod inside the 06:30–11:00 ET publish window.**
