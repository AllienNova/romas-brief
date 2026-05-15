---
name: editorial-style-guide
description: ROMAS Brief editorial voice, headline rules, ROMAS Insight format, sign-off, banned vocabulary, archetype length specs. Load before drafting any article, headline, insight line, or editorial copy.
---

# ROMAS Brief — Editorial Style Guide

## Voice

- **Mon–Thu**: direct, operational, scannable. Lead with what changed and what it means at the bedside / treatment console.
- **Friday (The ROMAS Read)**: deeper voice of authority. Pattern-spot. Connect the week. Make a call.
- Always: **clinician-to-clinician**. Never marketing-to-clinician.

## Banned vocabulary

Never use unless quoting a primary source:

- "revolutionary", "groundbreaking", "game-changer", "paradigm-shifting"
- "AI-powered" as a substitute for actually describing the model
- "scrape" / "scraping" / "crawl" / "crawling" — use **collect / extract / gather / fetch**
- "delve into", "dive deep", "unpack", "in the world of"
- Emojis. Anywhere. Ever.

## Headlines

- **≤ 90 characters**, hard cap.
- Lead with the change, not the actor: "Varian clears [thing]" not "FDA gives green light to..."
- No question headlines. No "this changes everything" framing.
- Use the **drug / device / trial name** in the headline when possible.

Good: `Elekta wins CE-mark for cone-beam adaptive workflow on Unity`
Bad: `Big news for MR-Linac users — you won't believe what just dropped`

## ROMAS Insight / ROMAS Take

- **One line, ≤ 240 characters.**
- Always labeled: `— ROMAS Insight (interpretation)` or `— ROMAS Take (interpretation)`.
- Says **what the news means**, not what it says. Restate-of-fact is not an insight.
- Names the operational, clinical, or economic stake.

Good: `— ROMAS Insight (interpretation): This is the third online-adaptive clearance in 6 months. Adaptive is no longer the differentiator — workflow integration is.`
Bad: `— ROMAS Insight: Elekta got CE-mark for adaptive RT.` (restate-of-fact)

## Article archetypes

| Archetype | Words | Use for |
|---|---|---|
| Short brief | 600–900 | Single clearance, single trial result, single vendor news |
| Standard analysis | 1,000–1,500 | Multi-angle, comparative, single-modality deep look |
| Deep report | 2,000–3,500 | Friday Read, conference wrap, multi-source synthesis |

## Article structure (Mon–Thu)

```
[Headline ≤ 90 chars]
[Standfirst / dek — 1–2 sentences, sets the stakes]

[Section: What happened]   — factual, primary-source-cited
[Section: Why it matters]   — clinical / operational / economic
[Section: The numbers]      — when relevant: dose, sample, endpoint
[Section: What we don't know yet]   — limitations, embargoes, open questions
[ROMAS Insight (labeled)]
[Source attribution block — primary URL + identifier]
```

## The ROMAS Read (Friday only)

Choose one rotating sub-rubric:

- **The Week in Receipts** — week's biggest signals re-scored against last week's predictions
- **Five Things That Shifted** — five second-order moves nobody else flagged
- **What I Got Wrong** — honest correction / re-frame of a prior take
- **Watch Next Week** — operational forecast for the coming week

Length: deep report (2,000–3,500 words). Voice: Kimal-signed. Sign-off: `— Kimal`.

## Sign-offs

- Daily issues: no sign-off (issue letter only).
- Friday ROMAS Read: `— Kimal` (em-dash + first name).
- Editor's notes / corrections: `— Kimal`.

## Source citation discipline

- **Primary source URL on every clinical claim.** No exceptions.
- Use inline markdown links with the source name as anchor text, never "source" / "link" / a raw URL.
- For trials: include NCT identifier. For FDA: 510(k) / De Novo / PMA number. For journal: DOI.
- openFDA is a discovery layer, not a primary citation. Cite the official FDA record.

## Subscriber-count copy

- **< 2,500 subscribers**: qualitative — *"Built for radiation oncologists, physicists, dosimetrists, therapists, and oncology leaders."*
- **≥ 2,500**: show count with current milestone band (2.5k / 5k / 10k / 25k).

## Sponsor copy

Allowed at launch (first 60–90 days):

- `Sponsored by [Sponsor].`
- `Partner message from [Sponsor].`

Forbidden until Day 90 re-evaluation:

- Co-branded masthead.
- Sponsor logo within 32px of ROMAS Brief wordmark.
- "Together with [Sponsor]" — explicitly removed in v1.1.

## Tone calibration examples

**Reject (marketing voice):**
> The future of radiation oncology is here. With the launch of [Product], clinicians can finally...

**Accept (clinician voice):**
> [Product] received 510(k) clearance Tuesday for online adaptive replanning on [linac]. Initial dose-recalculation latency is reported at under 90 seconds for prostate plans.

---

## Footer attribution rule for LLM-translated articles (cycle-6 Q11 lock — ADR-0013)

Every article whose `articles.source_language != 'en'` MUST carry a non-removable footer line, rendered by the reader template **after the byline / source-attribution block and before the audio player**, in the form:

```
Source originally in {Portuguese|Spanish|{other}}; translated with editorial review.
```

Rules:
- The string is **mandatory and non-removable**. Editor cannot delete it; the reader component reads `articles.source_language` and `articles.translation_provider` and renders the footer when `source_language != 'en'`.
- Languages currently in scope: Portuguese (`pt`), Spanish (`es`). Other languages added as launch expands; the schema CHECK constraint enumerates the allowed values per `Docs/specs/contracts/supabase-schema.sql`.
- Translation provider name is NOT exposed to readers in the v1 footer copy — the phrase "translated with editorial review" covers the workflow without surfacing vendor names. Provider name lives in `articles.translation_provider` for internal audit only.
- **Verbatim quote handling**: when an article quotes the original-language source verbatim, the English translation appears in the article body and the original-language text appears in italic parentheses immediately after the English: `"The 30-day adverse event rate was 4.2%"` *(Spanish: "La tasa de eventos adversos a 30 días fue del 4,2%")*.
- The footer rule applies to **every reader surface**: web article, RSS body, email body, and audio script (the script reads "Source originally in Spanish, translated with editorial review" as the closing line of the source-attribution beat 10).

This rule operationalizes Rule 1 (primary source URL) under LLM-translate: `primary_source_url` cites the original-language record; the body is in English; the footer makes the translation workflow transparent to the reader.

---

*Load this skill before any editorial work. Update only when Kimal locks a new style decision in `AGENT.md` §13.*
