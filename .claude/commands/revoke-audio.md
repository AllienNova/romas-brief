---
description: Post-publish kill switch — revoke a published audio episode and purge from CDN within 60s.
---

Revoke published audio for `$ARGUMENTS` (audio_job id).

1. Invoke `audio-qa-reviewer`.
2. Confirm the audio_job is currently `published`.
3. Capture a `revoke_reason` (must be non-null).
4. Flip `audio_status = revoked`, set `revoked_at = now()`.
5. Trigger CDN purge on the MP3 + transcript URLs (60s SLA).
6. Trigger `rss-publisher` to regenerate the affected tier feed without the revoked item.
7. Write a row to `revocations` table.
8. Surface the revocation in the next morning brief under "Audio revocations".
