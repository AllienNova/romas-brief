---
name: claim-verification
description: Primary-source citation discipline for every clinical claim in every ROMAS Brief article. Defines what counts as a primary source per claim type, the claim-trace JSON, and the verification workflow owned by clinical-fact-checker. Load before drafting or reviewing any article body.
---

# ROMAS Brief — Claim Verification

## The rule

**Every clinical claim must trace to a primary source.** Schema-enforced (`articles.primary_source_url NOT NULL`). Editorially enforced (`claims` table row per claim).

If a claim cannot be traced, **the claim is rewritten or removed** before publish.

---

## What counts as a primary source

| Claim type | Primary source |
|---|---|
| Drug / device clearance | FDA 510(k) / De Novo / PMA record on `fda.gov`, CE-mark EUDAMED entry, PMDA decision page, NMPA approval page |
| Trial result | Peer-reviewed publication (DOI), or conference abstract page (NCT identifier + DOI when available) |
| Trial enrollment / status | ClinicalTrials.gov / ISRCTN / EU-CTR / jRCT record |
| Guideline change | ASTRO / NCCN / ESTRO / ESMO / ASCO official guideline page (versioned URL) |
| Reimbursement | CMS NCD / LCD page, Federal Register notice, NICE TA page, HAS / IQWiG decision page |
| Vendor announcement | Official vendor press release on vendor domain (not republisher) |
| Society statement | Society's official press / news page |
| Investigator quote | Direct attribution in the primary publication or a society interview |

**openFDA, news aggregators, and republishers are NEVER the primary source.** They can lead to discovery; cite the official record.

---

## Claim extraction

Each article body is scanned post-draft. Every sentence with a clinical / regulatory / quantitative / attributed claim → one `claims` row:

```json
{
  "article_id": "...",
  "claim_text": "Online adaptive replanning latency under 90 seconds for prostate plans.",
  "source_url": "https://www.accessdata.fda.gov/cdrh_docs/...",
  "source_id": "K243XXXXX",
  "source_type": "fda_510k",
  "verified_by": "<reviewer_uuid>",
  "verified_at": "ISO",
  "confidence": 0.95
}
```

A claim is verified when:

- `source_url` resolves and content contains the claim (text match or close paraphrase).
- `verified_by` is a `qa_reviewers` row with role `fact_checker` or `editor_in_chief`.

---

## Verification workflow

```
1. Draft article (writer or editorial-director).
2. clinical-fact-checker extracts claims → claims table rows (verified=false).
3. For each claim:
   a. Fetch source_url (live).
   b. Search source content for claim_text or paraphrase.
   c. If match → set verified_by, verified_at, confidence.
   d. If no match → mark claim as UNVERIFIED, surface to writer.
4. UNVERIFIED claims must be:
   a. Rewritten with the correct source-supported wording, OR
   b. Removed from the article body, OR
   c. Reclassified as opinion → moved into ROMAS Take with (interpretation) label.
5. Article cannot move to ready_to_publish while any claim is unverified.
```

---

## What is NOT a clinical claim (and skips verification)

- Pure narrative (e.g., "The conference's morning plenary opened with...").
- Common-knowledge framing (e.g., "Adaptive radiation therapy adjusts treatment plans during a course of treatment.") — but only when truly common-knowledge in the specialty.
- ROMAS Take / Insight — these are explicitly interpretation, not claims.

Edge case: if "common-knowledge framing" is actually contested in the specialty, treat as a claim. Default to verification when unsure.

---

## Number discipline

When stating a number (dose, sample size, latency, %improvement, p-value):

- The number in the article body MUST match the number in the primary source exactly.
- Round only when the source rounds, with explicit note.
- Never invent precision.

Bad: source says "around 85% local control" → article says "85.4% local control".
Good: article says "around 85% local control".

---

## Attribution mechanics

Use inline markdown links with descriptive anchor text:

✓ `According to the [FDA 510(k) summary](https://...), latency was under 90 seconds.`

✗ `According to the [source](https://...), latency was under 90 seconds.`

✗ `Latency was under 90 seconds (https://...).`

Always include the source name in anchor text. Citations should read naturally even if links were removed.

---

## ROMAS Insight / Take ≠ a claim

These are interpretation:

> — ROMAS Take (interpretation): Three online-adaptive clearances in six months. The differentiator is workflow integration, not adaptive itself.

This does NOT need a claim row. But the **factual basis** ("three online-adaptive clearances in six months") DOES need claim rows for each clearance.

---

## Quote handling

Direct quotes from investigators, regulators, or vendor executives:

- Must trace to the publication or interview source.
- Use the exact words; no paraphrase inside quotation marks.
- Attribute by name, role, and institution.

> "Workflow integration is the bottleneck," said [Investigator Name, MD, of {Institution}], in a [conference Q&A](https://...).

---

## Confidence scoring (claim level)

| Confidence | When |
|---|---|
| 1.00 | Primary source contains exact wording |
| 0.90 | Primary source contains near-paraphrase, no ambiguity |
| 0.75 | Primary source supports claim but requires inference |
| 0.50 | Multiple sources needed; weakest link |
| < 0.50 | Don't ship. Rewrite or remove. |

---

## When primary source is paywalled

- Use abstract / public summary if it supports the claim.
- If abstract doesn't support, do NOT ship.
- Never cite a paywalled source we couldn't actually read.

---

## When primary source goes 404 after publish

- Maintain a `corrections` log.
- If the underlying claim is still supported by another primary source, update the citation, note the change, ship a correction.
- If no longer supported anywhere, retract the article (`status = revoked`), publish correction note.

---

## Anti-patterns

- ❌ Citing openFDA URL as the primary source.
- ❌ Citing a republisher (FierceBiotech, Endpoints News) when the original FDA / journal page exists.
- ❌ Inventing precision in numbers.
- ❌ "According to reports..." without naming the report.
- ❌ Direct quotes paraphrased.
- ❌ Verifying a claim from the same source that originally made it (circular).

---

*Claim verification is not optional. It is the brand.*
