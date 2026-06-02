// =====================================================================
// apps/web/lib/search-core.ts · ROMAS Wire reader · SHIP-25 / T-307
// Pure, framework-free search helpers — no Next/Supabase imports, so they
// are unit-testable with `node --experimental-strip-types --test`.
//
//   - sanitizeQuery        normalize + bound the raw user query
//   - buildEmbeddingRequest / parseEmbedding   OpenAI embeddings (gated)
//   - scoreMockArticle / rankMock              no-DB fallback ranking
//
// The DB-backed orchestration (rpc search_articles + embedQuery) lives in
// articles.ts, which reuses these helpers.
// =====================================================================

/** OpenAI embeddings — contract verified stable (POST /v1/embeddings,
 *  {model,input} → {data:[{embedding:number[]}]}). text-embedding-3-small = 1536-dim,
 *  matching migration 0014's vector(1536). Confirm at wiring (runtime-gated). */
export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIM = 1536;
export const EMBEDDINGS_ENDPOINT = "https://api.openai.com/v1/embeddings";

/** Max query length we send to FTS / embeddings. */
const MAX_QUERY_LEN = 200;

/** Trim, collapse whitespace, and bound length. Empty → "". */
export function sanitizeQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, MAX_QUERY_LEN);
}

export interface EmbeddingRequest {
  url: string;
  headers: Record<string, string>;
  body: string;
}

/** Build the OpenAI embeddings POST for a query. apiKey is injected by caller. */
export function buildEmbeddingRequest(query: string, apiKey: string): EmbeddingRequest {
  return {
    url: EMBEDDINGS_ENDPOINT,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: query }),
  };
}

/** Narrow an embeddings response to a finite number[]; null if malformed. */
export function parseEmbedding(json: unknown): number[] | null {
  const data = (json as { data?: Array<{ embedding?: unknown }> } | null)?.data;
  const emb = Array.isArray(data) ? data[0]?.embedding : undefined;
  if (!Array.isArray(emb) || emb.length === 0) return null;
  if (!emb.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
  return emb as number[];
}

/** Minimal article shape the fallback ranker reads. */
export interface SearchableArticle {
  title: string;
  standfirst: string;
  body: string;
}

const WEIGHT = { title: 3, standfirst: 2, body: 1 } as const;

/** Count non-overlapping occurrences of `term` in `text` (case-insensitive). */
function countOccurrences(text: string, term: string): number {
  if (term.length === 0) return 0;
  const haystack = text.toLowerCase();
  let count = 0;
  let i = haystack.indexOf(term);
  while (i !== -1) {
    count++;
    i = haystack.indexOf(term, i + term.length);
  }
  return count;
}

/**
 * Weighted term-frequency score for the no-DB (mock) fallback. Mirrors the
 * tsvector field weighting in migration 0014 (title▸A, standfirst▸B, body▸C).
 */
export function scoreMockArticle(article: SearchableArticle, query: string): number {
  const terms = sanitizeQuery(query)
    .toLowerCase()
    .split(" ")
    .filter((t) => t.length > 1);
  if (terms.length === 0) return 0;
  let score = 0;
  for (const term of terms) {
    score += countOccurrences(article.title, term) * WEIGHT.title;
    score += countOccurrences(article.standfirst, term) * WEIGHT.standfirst;
    score += countOccurrences(article.body, term) * WEIGHT.body;
  }
  return score;
}

/** Rank articles by {@link scoreMockArticle}, drop zero-score, cap at limit. */
export function rankMock<T extends SearchableArticle>(
  articles: readonly T[],
  query: string,
  limit: number,
): T[] {
  return articles
    .map((a) => ({ a, s: scoreMockArticle(a, query) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s)
    .slice(0, Math.max(0, limit))
    .map((x) => x.a);
}
