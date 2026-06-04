-- =========================================================================
-- 0017_reference_chunks.sql · CORPUS-2 — internal RAG-grounding store.
--
-- An INTERNAL editorial reference: chunked + embedded text from the docira-out
-- knowledge base (TG reports, textbooks, manuals, papers, course material).
-- Used ONLY to ground + verify drafts (clinical-fact-checker / physics-reviewer
-- + the drafting pipeline). NEVER served to the public reader, NEVER republished
-- verbatim as article bodies — this is third-party copyrighted source material;
-- ROMAS Wire cites + links the primary source (Rule 1), it does not reproduce it.
--
-- RLS is deny-by-default: no anon/public access at all. Only service_role (the
-- ingestion worker + the editorial agents' server context) reads/writes. This is
-- the hard wall that keeps copyrighted reference text off the public surface.
-- =========================================================================

create extension if not exists vector;

create table if not exists reference_chunks (
  id              uuid primary key default gen_random_uuid(),
  -- Provenance (from docira-index.ndjson). source_path is the corpus-relative
  -- path; source_hash is docira's content hash for the whole document (dedup).
  source_path     text not null,
  source_category text not null,
  source_subcategory text,
  source_title    text not null,
  doc_type        text,
  source_hash     text,
  -- The chunk itself + its position in the document.
  chunk_index     integer not null,
  chunk_text      text not null check (length(chunk_text) <= 20000),
  -- Stable per-chunk identity for idempotent upsert (source_hash + chunk_index,
  -- or a text hash when source_hash is absent). Unique → re-runs update in place.
  chunk_key       text not null,
  token_estimate  integer,
  -- OpenAI text-embedding-3-small (1536-dim) — MUST match articles.embedding so
  -- the same query-embedding path (apps/web/lib/search-core.ts) can be reused.
  embedding       vector(1536),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (chunk_key)
);

comment on table reference_chunks is
  'CORPUS-2 internal RAG-grounding store. Chunked+embedded docira-out reference text (copyrighted third-party material). INTERNAL ONLY — never served to the reader, never republished (Rule 1: cite the primary source, do not reproduce). RLS deny-by-default; service_role only.';
comment on column reference_chunks.embedding is
  'OpenAI text-embedding-3-small (1536-dim), matches articles.embedding. NULL until the gated backfill runs (needs OPENAI_API_KEY).';

create index if not exists reference_chunks_embedding_idx
  on reference_chunks using hnsw (embedding vector_cosine_ops);
create index if not exists reference_chunks_category_idx
  on reference_chunks (source_category);
create index if not exists reference_chunks_path_idx
  on reference_chunks (source_path);

-- ── RLS: deny-by-default. No policy for anon/public → zero public access. ──
alter table reference_chunks enable row level security;
-- service_role bypasses RLS (used by the ingestion worker + editorial agents).
-- No anon/authenticated policy is created on purpose: the reader must never read
-- copyrighted reference text. If an editor UI later needs it, add a narrow
-- policy scoped to the qa_reviewers/editor role — never to anon.

-- Internal hybrid-grounding RPC: cosine-nearest reference chunks for a query
-- embedding. SECURITY DEFINER + service_role-only execute → never reachable by
-- the anon reader. Returns provenance so the agent can cite the PRIMARY source,
-- not the chunk.
create or replace function match_reference_chunks(
  q_embedding vector(1536),
  match_count integer default 8,
  filter_category text default null
)
  returns table (
    id uuid, source_path text, source_category text, source_title text,
    doc_type text, chunk_index integer, chunk_text text, similarity double precision
  )
  language sql
  stable
  security definer
  set search_path = public
as $$
  select c.id, c.source_path, c.source_category, c.source_title,
         c.doc_type, c.chunk_index, c.chunk_text,
         1 - (c.embedding <=> q_embedding) as similarity
    from reference_chunks c
   where c.embedding is not null
     and (filter_category is null or c.source_category = filter_category)
   order by c.embedding <=> q_embedding
   limit greatest(1, least(match_count, 50));
$$;

comment on function match_reference_chunks(vector, integer, text) is
  'CORPUS-2 internal grounding retrieval. Cosine-nearest reference chunks for a query embedding. service_role-only (revoked from anon/authenticated) — copyrighted reference text never reaches the public reader.';

revoke execute on function match_reference_chunks(vector, integer, text) from public, anon, authenticated;
grant execute on function match_reference_chunks(vector, integer, text) to service_role;
