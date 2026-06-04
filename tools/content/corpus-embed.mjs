#!/usr/bin/env node
// =====================================================================
// corpus-embed.mjs — chunk + embed the docira-out corpus into reference_chunks
// (CORPUS-2 internal RAG grounding). Idempotent, resumable, cost-aware.
//
// Pipeline per unique document (skips duplicate_of + near-empty scans):
//   read .md → paragraph-aware char chunks (~CHUNK_CHARS, OVERLAP_CHARS) →
//   chunk_key = sha256(source_hash:chunk_index) → embed (OpenAI
//   text-embedding-3-small, 1536-dim — matches articles.embedding) →
//   upsert into reference_chunks via the Management API (batched).
//
// Modes:
//   --dry-run        chunk + size + cost only. No API calls, no DB writes. (default-safe)
//   --limit N        cap docs processed (smoke a small batch first).
//   (live)           requires OPENAI_API_KEY + SUPABASE_ACCESS_TOKEN. Resumable:
//                    skips chunk_keys already present in reference_chunks.
//
// Copyright: reference_chunks is INTERNAL only (migration 0017 RLS deny-by-default).
// Never republished — used to ground/verify drafts that cite the PRIMARY source (Rule 1).
//
// Usage: node tools/content/corpus-embed.mjs [corpusRoot] --dry-run
//        OPENAI_API_KEY=… node tools/content/corpus-embed.mjs [corpusRoot] --limit 20
// =====================================================================
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const val = (n, d) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : d; };
const ROOT = resolve(argv[0] && !argv[0].startsWith("--") ? argv[0] : "E:/docira-out");
const INDEX = resolve(__dirname, "../../Docs/content/corpus/docira-index.ndjson");
const DRY = flag("--dry-run");
const LIMIT = val("--limit") ? parseInt(val("--limit"), 10) : Infinity;
const SUPABASE_REF = "rjpuxfbuzispklcstuzo";

// Tuning. ~800-token chunks (≈3500 chars) with 400-char overlap; skip docs with
// fewer words than MIN_WORDS (near-empty scans carry no grounding value).
const CHUNK_CHARS = 3500;
const OVERLAP_CHARS = 400;
const MIN_WORDS = 40;
const EMBED_MODEL = "text-embedding-3-small";
const EMBED_BATCH = 96;     // inputs per OpenAI embeddings request
const UPSERT_BATCH = 40;    // rows per Management-API INSERT

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const estTokens = (chars) => Math.round((chars / 5) * 1.0); // ~5 chars/token English

/** Paragraph-aware char chunker with overlap. */
function chunk(text) {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (clean.length <= CHUNK_CHARS) return clean ? [clean] : [];
  const out = [];
  let i = 0;
  while (i < clean.length) {
    let end = Math.min(i + CHUNK_CHARS, clean.length);
    if (end < clean.length) {
      // prefer a paragraph/sentence boundary within the last 600 chars
      const window = clean.slice(i, end);
      const para = window.lastIndexOf("\n\n");
      const sent = window.lastIndexOf(". ");
      const cut = para > CHUNK_CHARS - 600 ? para : sent > CHUNK_CHARS - 600 ? sent + 1 : -1;
      if (cut > 0) end = i + cut;
    }
    const piece = clean.slice(i, end).trim();
    if (piece) out.push(piece.slice(0, 20000)); // honor CHECK length cap
    if (end >= clean.length) break;
    i = end - OVERLAP_CHARS;
    if (i < 0) i = 0;
  }
  return out;
}

const index = readFileSync(INDEX, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const docs = index.filter((r) => !r.duplicate_of && (r.word_count ?? 0) >= MIN_WORDS).slice(0, LIMIT);
console.error(`Index: ${index.length} rows → ${docs.length} embeddable docs (unique, ≥${MIN_WORDS} words, limit ${LIMIT}).`);

// Build all chunks (dry path needs only counts; live path needs the text).
let totalChunks = 0, totalChars = 0, readErrors = 0;
const allChunks = []; // {chunk_key, source_path, source_category, source_subcategory, source_title, doc_type, source_hash, chunk_index, chunk_text, token_estimate}
for (const d of docs) {
  let md;
  try { md = readFileSync(resolve(ROOT, d.path + ".md"), "utf8"); } catch { readErrors++; continue; }
  const pieces = chunk(md);
  pieces.forEach((text, ci) => {
    totalChunks++; totalChars += text.length;
    const key = sha256(`${d.hash ?? d.path}:${ci}`);
    if (!DRY) allChunks.push({
      chunk_key: key, source_path: d.path, source_category: d.category,
      source_subcategory: d.subcategory ?? null, source_title: d.title,
      doc_type: d.doc_type ?? null, source_hash: d.hash ?? null,
      chunk_index: ci, chunk_text: text, token_estimate: estTokens(text.length),
    });
  });
}

const tokens = estTokens(totalChars);
const cost = (tokens / 1_000_000) * 0.02;
console.error(`Chunks: ${totalChunks.toLocaleString()} · ~${tokens.toLocaleString()} tokens · est. embed cost $${cost.toFixed(2)} · read-errors ${readErrors}`);

if (DRY) {
  console.log(JSON.stringify({ docs: docs.length, chunks: totalChunks, est_tokens: tokens, est_cost_usd: +cost.toFixed(2), read_errors: readErrors, chunk_chars: CHUNK_CHARS, overlap: OVERLAP_CHARS }, null, 2));
  console.error("--dry-run: no API calls, no DB writes.");
  process.exit(0);
}

// ---- LIVE PATH (gated) ----
const OPENAI_API_KEY = process.env["OPENAI_API_KEY"];
const SUPABASE_ACCESS_TOKEN = process.env["SUPABASE_ACCESS_TOKEN"];
if (!OPENAI_API_KEY) { console.error("BLOCKED: OPENAI_API_KEY not set — embedding run is gated (Kimal to provide). Tooling verified via --dry-run."); process.exit(2); }
if (!SUPABASE_ACCESS_TOKEN) { console.error("BLOCKED: SUPABASE_ACCESS_TOKEN not set."); process.exit(2); }

async function dbQuery(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${SUPABASE_REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) throw new Error(`DB ${res.status}: ${await res.text()}`);
  return res.json();
}

// Resume: skip chunk_keys already embedded.
const existing = new Set((await dbQuery("select chunk_key from reference_chunks where embedding is not null;")).map((r) => r.chunk_key));
const todo = allChunks.filter((c) => !existing.has(c.chunk_key));
console.error(`Resume: ${existing.size} already embedded · ${todo.length} to do.`);

async function embed(inputs) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, input: inputs }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return j.data.map((d) => d.embedding);
}

let done = 0;
for (let i = 0; i < todo.length; i += EMBED_BATCH) {
  const batch = todo.slice(i, i + EMBED_BATCH);
  const vecs = await embed(batch.map((c) => c.chunk_text));
  batch.forEach((c, k) => { c.embedding = vecs[k]; });
  // upsert in smaller DB batches
  for (let j = 0; j < batch.length; j += UPSERT_BATCH) {
    const rows = batch.slice(j, j + UPSERT_BATCH);
    const json = JSON.stringify(rows);
    if (json.includes("$ref$")) throw new Error("token collision $ref$");
    const sql = `insert into public.reference_chunks
      (chunk_key, source_path, source_category, source_subcategory, source_title, doc_type, source_hash, chunk_index, chunk_text, token_estimate, embedding)
      select x.chunk_key, x.source_path, x.source_category, x.source_subcategory, x.source_title, x.doc_type, x.source_hash, x.chunk_index, x.chunk_text, x.token_estimate, (x.embedding::text)::vector(1536)
      from jsonb_to_recordset($ref$${json}$ref$::jsonb) as x(
        chunk_key text, source_path text, source_category text, source_subcategory text, source_title text,
        doc_type text, source_hash text, chunk_index integer, chunk_text text, token_estimate integer, embedding jsonb)
      on conflict (chunk_key) do update set embedding = excluded.embedding, updated_at = now();`;
    await dbQuery(sql);
    done += rows.length;
  }
  console.error(`  embedded+upserted ${done}/${todo.length}`);
}
console.log(JSON.stringify({ embedded: done, skipped_existing: existing.size, model: EMBED_MODEL }, null, 2));
