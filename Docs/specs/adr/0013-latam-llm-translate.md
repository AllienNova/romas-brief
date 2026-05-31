---
adr: 0013
title: LATAM editorial via LLM-translate (DeepL primary + Claude/GPT-4 verification)
status: Accepted (locked 2026-05-14 by Kimal — Q11)
date: 2026-05-14
confidence: medium-high
supersedes: none
---

# ADR-0013: LATAM editorial via LLM-translate

## Context

Cycle-5 region rebalance grew LATAM from 2% → 8% (Launch Plan §2.2 supersession: 40 LATAM articles at Day 1 + ~1–2/day ongoing). Source records are predominantly Portuguese (ANVISA, Brazilian Society of Radiation Oncology / SBR, ALATRO) and Spanish (COFEPRIS, ANMAT, SLAGO, ALATRO mixed). ROMAS Wire publishes in English. Three options were considered:

1. **Hire** Spanish/Portuguese contributor — adds payroll line; takes weeks to onboard; misaligns with 1-person ops org at launch.
2. **LLM-translate** — DeepL/Claude/GPT-4 translation pipeline; near-zero ongoing cost; risk on medical-term accuracy.
3. **ALATRO partnership** — editorial trade with the Latin American Association of Radiation Oncology; high signal but slow handshake.

Kimal locked **option 2 (LLM-translate) on 2026-05-14.**

## Decision

**Two-stage translation pipeline** for non-English LATAM source records:

1. **Primary translation: DeepL Pro API** (`POST /v2/translate`).
   - Best BLEU on ES↔EN and PT↔EN; documented for medical/scientific corpora.
   - Cost: ~$0.020/1k chars; 40 launch + 1–2/day ongoing → well within free tier (500k chars/mo).
2. **Verification pass: Claude 3.5 Sonnet** (or GPT-4 Turbo) called via the **`packages/llm-orchestrator/`** package authored fresh inside the ROMAS Wire monorepo (TypeScript; not imported from parent ROMAS COS — see ADR-0014).
   - Prompt: "You are a radiation oncology editor. Verify this DeepL translation against the original Spanish/Portuguese source. Flag any technical-term mistranslation. Return JSON `{verified: bool, mistranslations: [...], suggested_fixes: [...]}`."
   - Runs only on articles with `composite_score >= 70` (Strong-band + Hero); Standard/Quick-Hit/Reference articles ship with DeepL alone (cost + latency control).
3. **Article footer attribution (mandatory)**: every LLM-translated article carries `Source originally in {Spanish|Portuguese}; translated with editorial review.` Visible to readers; non-removable.

## Citation discipline (Rule 1 preserved)

- `articles.primary_source_url` cites the **original-language source** (e.g., ANVISA Portuguese record URL, not the DeepL translation).
- `articles.body_md` is in English (the ROMAS Wire editorial language).
- Quoting verbatim from a non-English source uses the LLM-translated text **with the original-language quote shown in italics inside parentheses** for transparency.
- `claims` table: every clinical claim still requires a source URL (the original-language one) per cycle-1 Rule 1 schema enforcement.

## Schema delta (M1)

Add three columns to `articles`:

```sql
alter table articles add column source_language text not null default 'en'
  check (source_language in ('en','es','pt','ja','zh','ko','de','fr','it','other'));
alter table articles add column translation_provider text
  check (translation_provider is null or translation_provider in ('deepl','claude','gpt4','human'));
alter table articles add column translation_verified boolean default false;
```

CHECK constraint: if `source_language != 'en'` then `translation_provider IS NOT NULL`. Article footer-attribution renderer reads these fields.

## Alternatives considered

| Option | Rejection reason |
|---|---|
| **Hire Spanish/Portuguese contributor** (Q11 option a) | Payroll + onboarding overhead; misaligned with 1-person ops at launch |
| **ALATRO partnership** (Q11 option c) | High signal but slow handshake; LATAM articles delayed pre-launch; revisit Day 90 for editorial trade |
| **DeepL alone (no verification pass)** | Faster + cheaper but risks medical-term mistranslation on Hero/Strong articles; trust cost > savings |
| **GPT-4 / Claude alone** | Higher BLEU variance than DeepL on ES/PT direct translation; better as verification layer than primary |
| **AWS Translate / Google Translate** | Worse on medical-domain Spanish/Portuguese than DeepL per benchmarks (BLEU 38–42 vs DeepL 50–55) |

## Consequences

**Positive**:
- Near-zero ongoing translation cost (DeepL free tier covers expected volume).
- Verification pass on Hero/Strong items catches the high-risk mistranslations where reader-trust is most exposed.
- Article footer attribution makes the workflow auditable for readers — no hidden translation.
- Original-language source URL preserved per Rule 1.

**Negative**:
- Quick-Hit + Reference LATAM articles ship with DeepL-only (no verification pass) — accepted risk, controlled by signal-score gating.
- DeepL has occasional weak spots on Portuguese clinical-specialty terms; lexicon-style override file (`packages/audio/translation-overrides.json`) is M1 deliverable for any term DeepL persistently mistranslates.
- Two API vendors added: DeepL + the existing LLM (Claude/GPT-4 via the new ROMAS-Brief-internal `packages/llm-orchestrator/`). One new DPA (DeepL).

**Neutral**:
- Spanish/Portuguese institution names + vendor names + conference names still flow through the audio lexicon expansion (FR-037, 30 → ~80 entries) regardless of translation provider.

## Revisit triggers

- Two or more reader-reported translation errors per month → re-evaluate: tighten verification pass to Standard tier, or escalate to native-speaker QA for Hero items
- DeepL monthly cost > $100 → revisit (probably stays under)
- DeepL deprecates language pair OR has a breaking API change without 6-month notice
- LATAM subscriber count > 500 (audience large enough to warrant native-speaker editorial)
- ALATRO partnership becomes viable (re-evaluate Day 90)

## Action items

- `contracts/deepl.yaml` authored (this cycle)
- Schema migration `0012_translation_tracking.sql` adds the three columns (M1)
- `regulatory-analyst` skill updated (M0 doc-only) with dispatch logic: detect non-English source → DeepL primary → if score ≥ 70 then Claude verification → footer attribution
- `editorial-style-guide` skill updated (M0 doc-only) with the article footer attribution rule
- `lexicon` skill extended (W-7) to include Spanish/Portuguese institution + vendor + conference pronunciations for audio
- `Docs/DPA-inventory.md` (M1) adds DeepL
- `.env.example` (R-111) adds `DEEPL_API_KEY`
- `delivery-plan.md` R-21 closed (LLM-translate locked); residual risk note added
- `product-spec.md` FR-038 added

*Locked 2026-05-14 by Kimal verbal decision (Q11).*

## Revision history

- **2026-05-14 (cycle-6 author)** — initial.
- **2026-05-14 (M0 cycle-2 repo separation)** — REL-010 closed. The `llm-orchestrator` reference no longer points at the parent ROMAS COS Python package. ROMAS Wire now contains its own TypeScript `packages/llm-orchestrator/` per ADR-0014 (repo separation). No cross-monorepo import required. Verification-pass code path: TypeScript Node 20+ Worker calling Anthropic/OpenAI SDKs directly through the new internal package.
