-- 0014_pgvector_search.sql · ROMAS Wire · SHIP-25 / T-307
-- Full-text + semantic search over published articles.
--
-- Two layers, one RPC:
--   1. Postgres FTS — a generated, weighted `tsv` tsvector (title▸A,
--      standfirst▸B, body▸C) + GIN index. Needs no external service; this
--      alone satisfies SHIP-25 acceptance ("search returns DB hits ranked by
--      relevance").
--   2. pgvector semantic — a 1536-dim `embedding` (OpenAI text-embedding-3-small)
--      + HNSW cosine index. Optional: the reader passes a query embedding only
--      when OPENAI_API_KEY is configured AND rows have been backfilled; absent
--      either, search degrades cleanly to FTS-only.
--
-- search_articles() is SECURITY INVOKER, so the caller's RLS
-- (public_read_published: status='published' AND revoked_at IS NULL) applies —
-- anon can never reach unpublished/revoked rows through it.
--
-- RUNTIME (gated, P-00/embeddings): applying this migration is a DB op; the
-- semantic path additionally needs the embedding backfill + OPENAI_API_KEY.

create extension if not exists vector;

-- ── FTS: weighted generated tsvector + GIN ──────────────────────────────
alter table articles
  add column if not exists tsv tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(standfirst, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(body_md, '')), 'C')
  ) stored;

create index if not exists articles_tsv_idx on articles using gin (tsv);

-- ── Semantic: 1536-dim embedding + HNSW cosine index ────────────────────
alter table articles add column if not exists embedding vector(1536);

comment on column articles.embedding is
  'OpenAI text-embedding-3-small (1536-dim) of title+standfirst+body, for pgvector semantic search (SHIP-25). Backfilled out-of-band; NULL until then (FTS still works).';

create index if not exists articles_embedding_idx
  on articles using hnsw (embedding vector_cosine_ops);

-- ── Hybrid search RPC ───────────────────────────────────────────────────
-- Returns published, non-revoked articles ranked by FTS ts_rank plus, when a
-- query embedding is supplied, cosine similarity. q_embedding NULL → FTS-only.
create or replace function search_articles(
  q_text text,
  q_embedding vector(1536) default null,
  match_count int default 20
)
returns setof articles
language sql
stable
security invoker
set search_path = public
as $$
  with q as (
    select websearch_to_tsquery('english', coalesce(q_text, '')) as tsq
  )
  select a.*
  from articles a, q
  where a.status = 'published'
    and a.revoked_at is null
    and (
      a.tsv @@ q.tsq
      or (q_embedding is not null and a.embedding is not null)
    )
  order by
    (
      coalesce(ts_rank(a.tsv, q.tsq), 0)
      + case
          when q_embedding is not null and a.embedding is not null
            then (1 - (a.embedding <=> q_embedding))
          else 0
        end
    ) desc,
    a.composite_score desc nulls last,
    a.published_at desc nulls last
  limit greatest(1, least(match_count, 100));
$$;

comment on function search_articles is
  'SHIP-25/T-307 hybrid search. FTS ts_rank + optional pgvector cosine (q_embedding). SECURITY INVOKER — RLS public_read_published applies. Reader: supabase.rpc(''search_articles'', {q_text, q_embedding, match_count}).';
