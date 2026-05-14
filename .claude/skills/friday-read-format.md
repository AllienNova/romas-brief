---
name: friday-read-format
description: The Friday ROMAS Read deeper-voice issue — sub-rubric rotation, structure, length, voice calibration, sign-off, audio handoff. Load every Thursday / Friday when producing the Friday issue.
---

# ROMAS Brief — The Friday ROMAS Read

## Purpose

The Friday issue is **the deeper voice-of-authority** issue. Mon–Thu are sharp + operational. Friday connects the week, pattern-spots, makes calls, owns errors.

Per Kimal's lock: *"Daily issues should be sharp and operational. Friday becomes the deeper voice-of-authority issue."*

---

## When

- **Drafts**: Thursday 17:00 ET.
- **Lock**: Friday 06:00 ET.
- **Publish**: Friday 07:00 ET (same as daily window).
- **Audio (Day 14+)**: Friday Audio Brief or Podcast in afternoon slot.

---

## Sub-rubric rotation (one per week)

Cycle in order; do not repeat back-to-back unless explicitly approved:

1. **The Week in Receipts** — re-score the week's biggest signals against last week's predictions. Did the call hold? Where did it bend?
2. **Five Things That Shifted** — five second-order moves nobody else flagged. Vendor positioning, regulatory tone, society-meeting reads, reimbursement signals.
3. **What I Got Wrong** — honest correction or re-frame of a prior take. Specific. Sourced. No equivocation.
4. **Watch Next Week** — operational forecast: what to put on calendar, what readouts expect, what to expect from regulators.

Track which rubric ran which week in `friday_read_history.json`.

---

## Structure

Length: deep report (2,000–3,500 words).

```
[Headline — sub-rubric name + week-of date]
[Standfirst — 1–2 sentence framing]

[Lead — the through-line of the week, 200–300 words]

[Three to five sections, each:]
  - Section title (operational, not cute)
  - 300–600 words
  - Primary source links on every claim
  - One mini-ROMAS Take per section (labeled)

[The Bottom Line — 150–250 words, what the operator does Monday]

— Kimal
```

---

## Voice calibration

- **First person allowed** in Friday Read only. "I" / "we" used sparingly and deliberately. Never on Mon–Thu.
- **Stronger claims allowed** — but only if backed by the week's primary sources. The Friday voice is not louder, it is **more concentrated**.
- **Pattern statements** are the Friday voice's signature: *"Three online-adaptive clearances in six months. The differentiator is no longer adaptive — it's the workflow surrounding it."*
- **Self-correction welcome**: "What I Got Wrong" weeks specifically. But also a paragraph in other Friday rubrics where useful.

---

## What the Friday Read is NOT

- ❌ A roundup. (Daily issues already roundup.)
- ❌ A take-fest of unsourced opinion.
- ❌ A vendor profile.
- ❌ Cheerleading or hype.
- ❌ Long for length's sake — if 2,000 words says it, don't push to 3,000.

---

## ROMAS Take in Friday Read

- One per major section (3–5 total in an issue).
- Same labeling rule: `— ROMAS Take (interpretation)`.
- Friday Takes are **operational forecasts or interpretive claims**, not restate-of-fact.
- The Bottom Line section closes with a final synthesis Take.

---

## Sign-off

Every Friday Read ends with:

```
— Kimal
```

Em-dash + first name only. No title, no link, no plug.

---

## Audio handoff (Day 14+)

Friday Read becomes either:

- A **Friday Audio Brief** (10 min) for a tighter week, or
- A **ROMAS Podcast episode** (30–60 min) for a deeper week.

Decision is `friday-read-editor`'s, with Kimal sign-off Thursday 18:00 ET.

If podcast: episode pre-roll uses the standard Audio Brief pre-roll. **Podcast-only post-roll** applies: *"Not headlines. Clinical intelligence."*

---

## Cross-week dependencies

- "The Week in Receipts" references last week's "Watch Next Week" predictions.
- Maintain `friday_read_predictions.json` so receipts week can compare cleanly.
- If "Watch Next Week" makes a hard prediction (e.g., a regulatory clearance by Friday), receipts week MUST score the call honestly.

---

## Quality bar

The Friday Read is the most-shared issue of the week. Treat every claim as:

- Defensible to a hostile reader on the same specialty.
- Citable to a primary source.
- Useful to a clinical or operational decision in the next 7 days.

If it fails any of those, kill the section.

---

*Friday Read is the brand's voice when it gets to speak in paragraphs instead of bullets.*
