---
adr: 0012
title: Video Podcast Tier 5 — hosting vendor (PLACEHOLDER, author Day 30)
status: Placeholder (Q6 in SSOT §10; author by Day 30 of 8-week ramp = 2026-06-11)
date: 2026-05-14 (stub authored M0 per QA-critic condition 6)
confidence: low (decision deferred)
supersedes: none
---

# ADR-0012: Video Podcast Tier 5 — hosting vendor (PLACEHOLDER)

## Status

This is a **stub ADR** authored during M0 doc reconciliation per QA-critic condition 6. The actual decision is deferred to **Day 30 of the 8-week pre-launch ramp** (≈ 2026-06-11, mid-M5) per SSOT §10 Q6.

Reason for deferral: Tier 5 Video Podcast (per SSOT §3 row 6, cycle-3 lock) launches Day 60 (≈ 2026-09-05). The video-hosting decision is not on the M0/M1/M2/M3 critical path; first studio recording is Day 56–58 per delivery-plan §3.6.5 R-18 mitigation; ADR-0012 must land by Day 30 to give 30 days of vendor onboarding + capability testing before first recording.

## Context (placeholder)

Tier 5 ROMAS Video Podcast invites human guests for 30–60 min weekly or bi-weekly recordings. Distribution surfaces:
- `video-podcast.xml` RSS feed (video enclosure type)
- Reader site `/watch` page
- Optional cross-post to YouTube (unlisted or public — decision pending)
- Optional cross-post to Apple Podcasts (video podcast namespace) + Spotify Video

Constraints:
- Editorial control: ROMAS Brief brand identity preserved (no third-party branding on hosted player)
- Voice + face consent: guest signs a consent form pre-recording (separate consent registry from ElevenLabs/PlayHT TTS consent)
- Sponsor firewall: 32px isolation rule (SSOT §3 row 8) applies to video frames too
- Accessibility: closed captions mandatory; Whisper-generated CC acceptable per ADR-0011 patterns

## Decision (PLACEHOLDER — Day 30 author)

To be decided by 2026-06-11. Candidate vendors:

| Vendor | Editorial control | Cost | Native RSS video | Reader-site embed quality |
|---|---|---|---|---|
| **Cloudflare Stream** | High (own player, no third-party branding) | $1/1000 min + $5/1000 min delivered | Yes (HLS) | Strong (Cloudflare-native, fast) |
| **YouTube unlisted** | Low (YouTube player + suggestions sidebar) | Free | No (custom-built RSS needed) | Embed shows YouTube branding |
| **Bunny Stream** | High (similar to Cloudflare) | Similar price | Yes | Good |
| **Mux** | High | $0.005/min stored + delivery | Yes | Excellent (industry standard) |
| **Self-hosted on R2 + Cloudflare** | Highest | R2 cost only | Manual playlist | Requires custom player |

Day-30 author rubric: pick the option that minimizes vendor branding on `/watch` page, supports video-podcast RSS native, and integrates with the existing Cloudflare Workers + R2 + Pages stack with the lowest operational overhead.

## Alternatives (placeholder)

Filled at Day 30.

## Consequences (placeholder)

Filled at Day 30.

## Revisit triggers (placeholder)

Filled at Day 30.

## Pre-Day-30 work

- Video studio setup (camera, mic, lighting) — owner TBD
- Guest booking workflow + outreach calendar
- Consent form template + signature workflow (separate from voice-clone consent)
- Recording → editing → upload pipeline definition

These are not blocked by this ADR; they proceed under the placeholder.

*Placeholder authored 2026-05-14. Decision author due 2026-06-11. SSOT §10 Q6 cross-reference.*
