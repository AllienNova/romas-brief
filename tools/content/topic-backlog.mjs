#!/usr/bin/env node
// =====================================================================
// topic-backlog.mjs — CORPUS-3 topic-discovery from the docira-out index.
//
// HONEST SCOPE: the extracted titles are OCR-noisy (leaked extraction prompts,
// "Figure 4 …", mislabeled doc_types). So this does NOT auto-seed article rows —
// Rule 1 needs a verified PRIMARY-SOURCE URL per topic, which noisy titles can't
// supply. Instead it produces the reliable signal:
//   1. Coverage map: ROMAS article-category → corpus depth (docs + word volume)
//      → RAG-grounding strength. Tells editors which topics the corpus grounds well.
//   2. Candidate grounding anchors per strong cluster (longest, noise-filtered
//      docs) — flagged "verify title/source", as leads for the editorial pipeline.
// Polished topic→article creation stays a Stage-5 pipeline job (find + verify the
// primary source). The corpus's primary value is RAG grounding (CORPUS-2).
//
// Read-only over the index. Writes Docs/content/corpus/topic-backlog.md. No DB, no cost.
// Usage: node tools/content/topic-backlog.mjs
// =====================================================================
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX = resolve(__dirname, "../../Docs/content/corpus/docira-index.ndjson");
const OUT = resolve(__dirname, "../../Docs/content/corpus/topic-backlog.md");

// corpus category (or prefix) → ROMAS article category (the 11-enum).
const MAP = [
  [/^01_Reference-Reports|^06_QA|^Commissioning|Small Field|Uncertainties/i, "physics"],
  [/^04_Treatment-Planning|Treatment Planning|Advanced Treatment|^RO Model/i, "physics"],
  [/^05_Brachytherapy|Brachytherapy/i, "clinical_rt"],
  [/^07_Clinical-Workflows|^Lung|motion management|Respiratory Motion/i, "clinical_rt"],
  [/^08_Imaging/i, "physics"],
  [/^09_Radiobiology/i, "future_rt"],
  [/^SRS/i, "clinical_rt"],
  [/^02_Textbooks|^03_Lectures|^10_Education|Resident_Physics|Rotation/i, "resident_education"],
  [/^11_Research/i, "clinical_rt"],
  [/^12_Software/i, "ai"],
];
const toArticleCat = (c) => (MAP.find(([re]) => re.test(c)) ?? [, "resident_education"])[1];

// Title noise filter — drop OCR artifacts so anchors read as real topics.
const NOISE = [
  /^figure\b/i, /^appendix\b/i, /^table\b/i, /^select\b/i, /^\d+[.)]/, /convert the image/i,
  /^reminder/i, /control console/i, /^see figure/i, /developer mode/i, /^step\b/i,
  /worksheet/i, /^page\b/i, /shutdown|power.?up/i, /^[^a-z]{0,3}$/i,
];
const noisy = (t) => !t || t.length < 10 || NOISE.some((re) => re.test(t));

const rows = readFileSync(INDEX, "utf8").trim().split("\n").map((l) => JSON.parse(l)).filter((r) => !r.duplicate_of);

// 1. Coverage by ROMAS article category.
const cov = {};
for (const r of rows) {
  const cat = toArticleCat(r.category);
  (cov[cat] ??= { docs: 0, words: 0, papers: 0, textbooks: 0, reports: 0 });
  cov[cat].docs++; cov[cat].words += r.word_count || 0;
  if (r.doc_type === "academic_paper") cov[cat].papers++;
  if (r.doc_type === "textbook") cov[cat].textbooks++;
  if (r.doc_type === "report_manual") cov[cat].reports++;
}
const strength = (words) => words > 3_000_000 ? "deep" : words > 500_000 ? "moderate" : "thin";
const fmt = (n) => n.toLocaleString("en-US");
const covRows = Object.entries(cov).sort((a, b) => b[1].words - a[1].words)
  .map(([c, v]) => `| ${c} | ${v.docs} | ${fmt(v.words)} | ${v.papers} | ${v.textbooks} | ${v.reports} | **${strength(v.words)}** |`).join("\n");

// 2. Candidate grounding anchors: per article-category, longest noise-filtered docs.
const anchorsByCat = {};
for (const r of rows) {
  if (noisy(r.title)) continue;
  const cat = toArticleCat(r.category);
  (anchorsByCat[cat] ??= []).push(r);
}
const anchorBlocks = Object.entries(anchorsByCat).sort((a, b) => b[1].length - a[1].length).map(([cat, list]) => {
  const top = list.sort((a, b) => b.word_count - a.word_count).slice(0, 12);
  const items = top.map((r) => {
    const citable = r.doc_type === "academic_paper" ? "paper→find DOI" : /tg[- ]?\d|aapm/i.test(r.title) ? "TG/AAPM→find URL" : "RAG-only";
    return `  - **${r.title.slice(0, 80)}** (${fmt(r.word_count)} w, ${r.doc_type}) — _${citable}_ · \`${r.path}\``;
  }).join("\n");
  return `### ${cat}\n${items}`;
}).join("\n\n");

const md = `---
title: ROMAS Wire — Corpus Topic-Discovery Backlog (CORPUS-3)
generated: ${"2026-06-04"}
generator: tools/content/topic-backlog.mjs
source: Docs/content/corpus/docira-index.ndjson (${fmt(rows.length)} unique docs)
status: editorial signal — NOT auto-seeded article rows (Rule 1 needs verified primary URLs per topic)
---

# Corpus Topic-Discovery Backlog

> **What this is / isn't.** The corpus's extracted titles are OCR-noisy and doc-type
> detection is unreliable, so this does **not** auto-create article rows. It is the
> reliable signal — *where the corpus can RAG-ground articles well* (coverage) plus
> *candidate leads* (longest, noise-filtered docs). Turning a lead into an article is a
> Stage-5 pipeline job: find + verify the **primary source URL** (Rule 1), then draft.
> The corpus's main value is **RAG grounding** (CORPUS-2 \`reference_chunks\`), not a
> publish feed.

## 1. Coverage by ROMAS article category
How deeply the corpus can ground each category (more words = stronger retrieval grounding).

| Article category | Docs | Words | Papers | Textbooks | Manuals | Grounding |
|---|---:|---:|---:|---:|---:|---|
${covRows}

**Read:** the corpus is **deep on physics + resident_education** — exactly ROMAS Wire's
moat (the landscape brief's Themes 6/9). It grounds clinical_rt moderately. It is thin on
ai / regulatory / reimbursement — those stay sourced from live discovery (cron-ingest),
not this corpus.

## 2. Candidate grounding anchors (leads, by category)
Longest noise-filtered docs per category. **Titles may still be imperfect — verify before
use.** Citability tag: \`paper→find DOI\` / \`TG/AAPM→find URL\` = a public primary source
likely exists (pipeline finds + verifies it); \`RAG-only\` = internal reference, grounds
drafts but is not itself a citable article source.

${anchorBlocks}

---
*Next: the editorial pipeline (or an agent) picks a lead → finds the verified primary source
→ drafts → fact-checks against both the source and the RAG-grounded \`reference_chunks\`.
Re-run after each corpus drop: \`node tools/content/topic-backlog.mjs\`.*
`;

writeFileSync(OUT, md, "utf8");
console.log(`Wrote topic backlog → ${OUT}`);
console.log("Coverage:", JSON.stringify(Object.fromEntries(Object.entries(cov).map(([c, v]) => [c, { docs: v.docs, words: v.words, grounding: strength(v.words) }])), null, 0));
