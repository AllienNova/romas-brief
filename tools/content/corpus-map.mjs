#!/usr/bin/env node
// =====================================================================
// corpus-map.mjs — index + manifest a docira-out corpus (read-only).
//
// Walks a docira extraction tree (paired <doc>.md + <doc>.json sidecars),
// reads each JSON sidecar's metadata (NOT the full markdown — cheap), and emits:
//   1. docira-index.ndjson  — one line per doc (the machine index for RAG +
//      topic mining): path, category, subcategory, title, doc_type, pages,
//      hash, word_count, created_at.
//   2. docira-corpus-map.md — human manifest: category table, doc-type spread,
//      dedup stats, total word volume (sizes the embedding job + cost), and
//      high-value item lists.
//
// Read-only over the corpus. Writes two small artifacts into the repo. No DB,
// no network, no cost. Corpus root defaults to E:/docira-out; pass another root
// as argv[2] for the full ~5x corpus. Hash-keyed so re-runs are deterministic.
//
// Usage: node tools/content/corpus-map.mjs [corpusRoot] [--out <dir>]
// =====================================================================
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, relative, basename, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "E:/docira-out");
const outIdx = process.argv.indexOf("--out");
const OUT_DIR = resolve(outIdx > -1 ? process.argv[outIdx + 1] : resolve(__dirname, "../../Docs/content/corpus"));
const NDJSON = resolve(OUT_DIR, "docira-index.ndjson");
const MAP = resolve(OUT_DIR, "docira-corpus-map.md");

// Recursive .json walk (sidecars). Skip node_modules-ish noise (none expected).
function walk(dir, acc = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    const full = resolve(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.isFile() && extname(e.name).toLowerCase() === ".json") acc.push(full);
  }
  return acc;
}

const wordCount = (s) => (s ? s.trim().split(/\s+/).filter(Boolean).length : 0);
const firstHeading = (md) => {
  if (!md) return null;
  const m = md.match(/^#{1,3}\s+(.+)$/m);
  return m ? m[1].trim().slice(0, 140) : null;
};

console.error(`Scanning ${ROOT} …`);
const files = walk(ROOT);
console.error(`Found ${files.length} JSON sidecars.`);

const rows = [];
const seenHash = new Map(); // hash → first path (dedup)
let parseErrors = 0, totalWords = 0;

for (const jf of files) {
  let d;
  try { d = JSON.parse(readFileSync(jf, "utf8")); } catch { parseErrors++; continue; }
  const rel = relative(ROOT, jf).split(sep).join("/");
  const parts = rel.split("/");
  const category = parts[0] ?? "(root)";
  const subcategory = parts.length > 2 ? parts[1] : null;
  const md = typeof d.markdown === "string" ? d.markdown : "";
  const wc = wordCount(md);
  totalWords += wc;
  const hash = d?.document?.hash ?? null;
  const dup = hash && seenHash.has(hash);
  if (hash && !dup) seenHash.set(hash, rel);
  rows.push({
    path: rel.replace(/\.json$/, ""),
    category,
    subcategory,
    title: firstHeading(md) || basename(jf, ".json"),
    doc_type: d?.document_type?.detected ?? "unknown",
    doc_type_conf: d?.document_type?.confidence ?? null,
    pages: d?.document?.pages ?? (Array.isArray(d?.pages) ? d.pages.length : null),
    hash,
    duplicate_of: dup ? seenHash.get(hash) : null,
    word_count: wc,
    status: d?.status ?? null,
    created_at: d?.created_at ?? null,
  });
}

rows.sort((a, b) => a.path.localeCompare(b.path));

// ---- aggregates ----
const tally = (key) => rows.reduce((m, r) => ((m[r[key] ?? "(none)"] = (m[r[key] ?? "(none)"] || 0) + 1), m), {});
const wordsByCat = rows.reduce((m, r) => ((m[r.category] = (m[r.category] || 0) + r.word_count), m), {});
const byCat = tally("category");
const byType = tally("doc_type");
const dupes = rows.filter((r) => r.duplicate_of).length;
const uniqueDocs = rows.length - dupes;
const fmt = (n) => n.toLocaleString("en-US");

// Embedding-cost estimate. text-embedding-3-small: $0.02 / 1M tokens; ~1.33 tokens/word.
const estTokens = Math.round(totalWords * 1.33);
const estCostThis = (estTokens / 1_000_000) * 0.02;
const estCostFull = estCostThis * 5; // user: this is ~20% of the full corpus

const catRows = Object.entries(byCat).sort((a, b) => b[1] - a[1])
  .map(([c, n]) => `| ${c} | ${fmt(n)} | ${fmt(wordsByCat[c] || 0)} |`).join("\n");
const typeRows = Object.entries(byType).sort((a, b) => b[1] - a[1])
  .map(([t, n]) => `| ${t} | ${fmt(n)} |`).join("\n");

// High-value items: academic papers + textbooks + reports, longest first (best RAG/topic signal).
const highValue = rows
  .filter((r) => ["academic_paper", "textbook", "report_manual", "slide_deck"].includes(r.doc_type) && !r.duplicate_of)
  .sort((a, b) => b.word_count - a.word_count)
  .slice(0, 40)
  .map((r) => `- \`${r.category}\` · **${r.title}** (${r.doc_type}, ${fmt(r.word_count)} w) — \`${r.path}\``)
  .join("\n");

const md = `---
title: docira-out Corpus Map (ROMAS Wire internal knowledge base)
generated: ${"2026-06-04"}
generator: tools/content/corpus-map.mjs
corpus_root: ${ROOT}
status: internal reference index — NOT publishable content (copyright). Feeds RAG grounding (CORPUS-2) + topic backlog (CORPUS-3).
---

# docira-out — Corpus Map

> **Copyright posture (binding):** this corpus is third-party reference material (TG reports,
> textbooks, vendor manuals, journal papers, course slides). It is an **internal editorial
> reference / RAG-grounding** source only. ROMAS Wire **never republishes extracted text** as
> article bodies — articles cite + link the primary source (Rule 1), they do not reproduce it.

## Totals
- **Documents indexed:** ${fmt(rows.length)} (${fmt(uniqueDocs)} unique, ${fmt(dupes)} duplicate by content hash)
- **Total extracted words:** ${fmt(totalWords)} · **est. tokens:** ${fmt(estTokens)} (~1.33 tok/word)
- **Parse errors (skipped):** ${parseErrors}
- **Embedding-cost estimate** (text-embedding-3-small @ $0.02/1M tok):
  - this corpus (~20%): **$${estCostThis.toFixed(2)}**
  - full corpus (5×, extrapolated): **~$${estCostFull.toFixed(2)}**
  - _Note: cost scales with chunk overlap; budget 1.3–1.6× this for chunked embedding._

## By category
| Category | Docs | Words |
|---|---:|---:|
${catRows}

## By document type
| Detected type | Docs |
|---|---:|
${typeRows}

## High-value items (papers / textbooks / manuals / decks, longest first — top 40)
${highValue}

---
*Index: \`Docs/content/corpus/docira-index.ndjson\` (one JSON line per doc). Re-run
\`node tools/content/corpus-map.mjs [root]\` after each corpus drop. Hash-keyed → deterministic.*
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(NDJSON, rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");
writeFileSync(MAP, md, "utf8");
console.error(`Wrote ${fmt(rows.length)} index rows → ${NDJSON}`);
console.error(`Wrote manifest → ${MAP}`);
console.log(JSON.stringify({ docs: rows.length, unique: uniqueDocs, dupes, totalWords, estCostThis: +estCostThis.toFixed(2), estCostFull: +estCostFull.toFixed(2), parseErrors, byType }, null, 2));
