---
description: Run the audio QA gate on a queued audio_job — clinical accuracy, pronunciation, audio quality, structure, brand. Only this command can flip audio_status to published.
---

Run audio QA on `$ARGUMENTS` (an audio_job id, or "next" to pull the oldest in_review).

1. Invoke `audio-qa-reviewer`.
2. Load the audio_jobs row + linked article + transcript.
3. Run Section A (Clinical), B (Pronunciation), C (Audio quality), D (Structure), E (Brand).
4. Outcome:
   - PASS → set `audio_status = published`, `clinical_claims_checked = true`, `qa_reviewer`, `published_at`. Trigger `rss-publisher` for the affected tier.
   - SOFT REJECT → leave in `in_review`, write `qa_notes` with specific fixes; send back to `audio-producer`.
   - HARD REJECT → set `audio_status = skipped`, write `skip_reason`. Article ships without audio.
   - REVOKE (post-publish only) → set `audio_status = revoked`, trigger CDN purge (60s SLA) and feed regen.
5. Write QA log entry.
6. Report outcome and queue status.

Reminder: no bulk approvals. One audio = one review.
