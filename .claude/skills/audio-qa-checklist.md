---
name: audio-qa-checklist
description: The editorial QA gate checklist that every audio file must pass before flipping audio_status from in_review to published. Owned by audio-qa-reviewer subagent. Load before any QA review session.
---

# ROMAS Wire — Audio QA Checklist

> **Non-negotiable rule (from Kimal):** *"Every article gets audio only after editorial QA passes. No auto-generated clinical audio should go live without review at launch. You are entering a trust market. One sloppy AI audio summary can damage the brand."*

This is the reviewer form. Run it on every audio file before flipping `audio_status: published`.

---

## Identity & access

- Reviewer: must match a row in `qa_reviewers` table.
- At launch: Kimal solo. Second reviewer onboarded by Day 30.
- Reviewer logs `qa_reviewer = <reviewer_id>`, `qa_reviewed_at = now()`.

---

## Section A — Clinical accuracy (block on any FAIL)

| # | Check | Pass criterion |
|---|---|---|
| A1 | Primary source named in-script | Source institution / journal / agency stated by name |
| A2 | Numbers match the source | Dose, sample size, endpoint values verified against primary doc |
| A3 | No invented citations | Every quoted figure traceable; spot-check 2 random |
| A4 | Drug / device / trial names correct | Spelling AND pronunciation verified |
| A5 | No off-label implication | Audio does not extend indication beyond primary source |
| A6 | Limitations explicit | Beat 8 ("Limitations") is present and substantive |
| A7 | ROMAS Take labeled | Audio includes "ROMAS Take — interpretation" verbal label |

**If any A-row fails → reject (`audio_status: skipped`) or send back to producer.**

Set `clinical_claims_checked = true` only when all A-rows pass.

---

## Section B — Pronunciation (block on any FAIL)

| # | Check | Pass criterion |
|---|---|---|
| B1 | Drug names from lexicon | All match `pronunciation-lexicon` skill entries |
| B2 | Device / vendor names | Linac models, vendor names (Elekta, Varian, ViewRay, RaySearch...) correct |
| B3 | Acronyms | SBRT, IMRT, VMAT, MR-Linac, FLASH, OAR, GTV, CTV, PTV pronounced per lexicon |
| B4 | Person / institution names | Spot-check 2 — block on obvious mispronunciation |
| B5 | Numbers spoken naturally | "1.8 gray per fraction" not "one point eight gray per fraction one" |

**Any mispronunciation of a drug, device, modality, or trial name → reject.**

---

## Section C — Audio quality (block on any FAIL)

| # | Check | Pass criterion |
|---|---|---|
| C1 | Integrated loudness | Pass: -18 to -14 LUFS (ADR-0016 DB gate). Tight production target: -16 ±1 LUFS = [-17, -15]. Outside the tight target but inside the DB gate → amber soft-warning, reviewer may still approve. Outside the DB gate → hard reject. |
| C2 | True peak | ≤ -1 dBTP |
| C3 | No audible glitches | No clicks, dropouts, robotic artifacts in spot-check |
| C4 | No abrupt cuts | Clean fade in / fade out |
| C5 | Pace | 145–160 wpm (sanity check, not measured per file) |
| C6 | Pre-roll present | "From ROMAS Intelligence — clinical intelligence for modern radiation oncology." |
| C7 | Source attribution beat | Beat 10 is present and names a primary source |
| C8 | Length within target | ±10% of archetype target (5 / 7 / 10 min) |

---

## Section D — Structural integrity (block on any FAIL)

| # | Check | Pass criterion |
|---|---|---|
| D1 | All 10 beats present | OR explicit override note in `audio_jobs.notes` |
| D2 | Beat order respected | 1 → 10, no reordering |
| D3 | Transcript exists | `transcript_url` populated, transcript matches audio |
| D4 | Episode metadata | Title ≤ 90 chars, description ≤ 240 chars, tags assigned |

---

## Section E — Brand integrity (block on any FAIL)

| # | Check | Pass criterion |
|---|---|---|
| E1 | No banned vocabulary | No "revolutionary" / "groundbreaking" / "scrape" / hype words (unless quoted) |
| E2 | No emojis in metadata | Title, description, alt text — none |
| E3 | Tagline usage | Homepage tagline used only as homepage line. Podcast positioning line ("Not headlines. Clinical intelligence.") used only as podcast post-roll. |
| E4 | Sponsor firewall | If sponsored, no sponsor name within first 30s; no sponsor in pre-roll |
| E5 | Sign-off | Friday Read podcast carries `— Kimal` verbal sign-off |

---

## Outcomes

### PASS → publish
- All A / B / C / D / E rows green.
- Set: `audio_status = published`, `clinical_claims_checked = true`, `qa_reviewer = <id>`, `qa_reviewed_at = now()`, `published_at = now()`.
- Trigger RSS regeneration for the affected tier feed.

### SOFT REJECT → send back to producer
- 1–2 fixable issues (length, single pronunciation, loudness retry).
- Set: `audio_status = in_review` (stays), add `qa_notes` with fixes requested.

### HARD REJECT → skip
- Multiple failures, content fundamentally wrong, source claim invalid.
- Set: `audio_status = skipped`, `skip_reason = <reason>`, `qa_reviewer = <id>`.
- Article ships without audio. Surface to morning brief.

### REVOKE → post-publish kill switch
- For audio already `published` where a defect is found after the fact.
- Set: `audio_status = revoked`, `revoke_reason = <reason>`.
- Trigger CDN purge (60s SLA). Regenerate affected RSS feeds.

---

## QA log entry (every review writes one)

```json
{
  "audio_job_id": "...",
  "reviewer_id": "...",
  "reviewed_at": "...",
  "outcome": "published | skipped | soft_reject | revoked",
  "sections": {
    "A_clinical": "pass | fail",
    "B_pronunciation": "pass | fail",
    "C_audio_quality": "pass | fail",
    "D_structure": "pass | fail",
    "E_brand": "pass | fail"
  },
  "failed_checks": ["A4", "B1"],
  "notes": "..."
}
```

---

## Reviewer time budget

- Short brief (5 min audio) → 8–12 min review.
- Standard (7 min audio) → 12–18 min review.
- Deep / podcast (30–60 min audio) → 30–45 min review with spot-check sampling.

If review queue exceeds owner capacity, hold articles in `in_review` rather than rushing. **Ship article without audio before shipping un-reviewed audio.**

---

*This checklist is the brand. Treat every entry as load-bearing.*
