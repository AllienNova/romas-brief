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
// Load the project .env (gitignored) so AI_GATEWAY_API_KEY / OPENAI_API_KEY /
// SUPABASE_ACCESS_TOKEN can simply be pasted there — no shell export needed.
// Node ≥20.12 / 24 ships process.loadEnvFile(); ignore if absent or no .env.
try { process.loadEnvFile?.(resolve(__dirname, "../../.env")); } catch { /* no .env — use shell env */ }
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
const EMBED_DIM = 1536;     // must match reference_chunks.embedding vector(1536)
const EMBED_MAX_INPUTS = 48;        // hard cap on inputs per request. 48 × worst-case
                                    // ~5k tokens/chunk = 240k < the 300k gateway cap,
                                    // so a request can't exceed the cap even when many
                                    // small chunks slip under the token budget below.
const EMBED_TOKEN_BUDGET = 100_000; // est tokens/request. The estimate (chars/5)
                                    // UNDER-counts the gateway's real tokenizer on
                                    // dense medical text, so a 250k-estimated batch
                                    // tokenized to >300k (the hard cap) → 400. 100k
                                    // est gives ~2× headroom under the 300k limit.
const UPSERT_BATCH = 8;     // rows per Management-API INSERT — 8×(1536 floats) keeps the
                            // SQL payload well under the Management API request-size cap
                            // (batch 40 returned an HTML error mid-run, killing the pass).

// Embedding endpoint resolution. Prefer the Vercel AI Gateway (unified billing +
// observability + fallbacks) when AI_GATEWAY_API_KEY is set; else direct OpenAI.
// Both are OpenAI-compatible (POST /embeddings, {model,input,dimensions} →
// {data:[{embedding}]}) — verified vs Vercel AI Gateway docs 2026-06-04
// (https://vercel.com/docs/ai-gateway/sdks-and-apis/openai-chat-completions/embeddings)
// and apps/web/lib/search-core.ts. Gateway model IDs are provider-prefixed.
function resolveEmbedder() {
  const gw = process.env["AI_GATEWAY_API_KEY"];
  const oai = process.env["OPENAI_API_KEY"];
  if (gw) return { provider: "vercel-gateway", url: "https://ai-gateway.vercel.sh/v1/embeddings", key: gw, model: "openai/text-embedding-3-small" };
  if (oai) return { provider: "openai-direct", url: "https://api.openai.com/v1/embeddings", key: oai, model: "text-embedding-3-small" };
  return null;
}

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
const EMB = resolveEmbedder();
const SUPABASE_ACCESS_TOKEN = process.env["SUPABASE_ACCESS_TOKEN"];
if (!EMB) { console.error("BLOCKED: no embedding key — set AI_GATEWAY_API_KEY (Vercel AI Gateway) or OPENAI_API_KEY. Tooling verified via --dry-run."); process.exit(2); }
if (!SUPABASE_ACCESS_TOKEN) { console.error("BLOCKED: SUPABASE_ACCESS_TOKEN not set."); process.exit(2); }
console.error(`Embedder: ${EMB.provider} (${EMB.model}, ${EMBED_DIM}-dim).`);

async function dbQuery(sql, attempt = 1) {
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${SUPABASE_REF}/database/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: sql }),
    });
    if (!res.ok) throw new Error(`DB ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return res.json();
  } catch (e) {
    // Transient Management-API failures (5xx/HTML/network) shouldn't abort a long
    // resumable run — retry with backoff; the run is idempotent (ON CONFLICT).
    if (attempt <= 3) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      return dbQuery(sql, attempt + 1);
    }
    throw e;
  }
}

// Resume: skip chunk_keys already embedded.
const existing = new Set((await dbQuery("select chunk_key from reference_chunks where embedding is not null;")).map((r) => r.chunk_key));
const todo = allChunks.filter((c) => !existing.has(c.chunk_key));
console.error(`Resume: ${existing.size} already embedded · ${todo.length} to do.`);

async function embed(inputs, attempt = 1) {
  let res;
  try {
    res = await fetch(EMB.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${EMB.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: EMB.model, input: inputs, dimensions: EMBED_DIM }),
    });
  } catch (netErr) {
    // Network blip — retryable.
    if (attempt <= 4) { await new Promise((r) => setTimeout(r, 1500 * attempt)); return embed(inputs, attempt + 1); }
    throw netErr;
  }
  if (!res.ok) {
    const body = (await res.text()).slice(0, 200);
    // Only 429 / 5xx are transient. A 4xx (e.g. 400 oversized request) is permanent —
    // retrying is pointless; surface it so the batching can be fixed.
    if ((res.status === 429 || res.status >= 500) && attempt <= 4) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      return embed(inputs, attempt + 1);
    }
    throw new Error(`${EMB.provider} ${res.status}: ${body}`);
  }
  const j = await res.json();
  const vecs = j.data.map((d) => d.embedding);
  if (vecs[0]?.length !== EMBED_DIM) throw new Error(`embedding dim ${vecs[0]?.length} != ${EMBED_DIM}`);
  return vecs;
}

let done = 0;
let i = 0;
while (i < todo.length) {
  // Pack a batch by token budget (not a fixed count) so no request exceeds the
  // gateway's 300k-token cap — chunks range ~700–5000 tokens.
  const batch = [];
  let toks = 0;
  while (i < todo.length && batch.length < EMBED_MAX_INPUTS && toks + (todo[i].token_estimate || 1) <= EMBED_TOKEN_BUDGET) {
    toks += todo[i].token_estimate || 1;
    batch.push(todo[i]);
    i++;
  }
  if (batch.length === 0) { batch.push(todo[i]); i++; } // single oversized chunk — send alone
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
console.log(JSON.stringify({ embedded: done, skipped_existing: existing.size, provider: EMB.provider, model: EMB.model }, null, 2));
