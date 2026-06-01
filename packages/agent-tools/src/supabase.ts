// =====================================================================
// packages/agent-tools/src/supabase.ts · ROMAS Wire · ADR-0020 tool 4
// READ-ONLY Supabase (PostgREST) access for the agent layer.
// The agent reads only PUBLIC content + an aggregate subscriber count.
// It NEVER receives the service-role key (S1 — PHI/prod isolation): only
// the anon/read-only key, and only published rows (RLS deny-by-default).
//
// PostgREST contract:
//   GET {url}/rest/v1/articles?select=...&status=eq.published&order=...&limit=N
//   headers: apikey: <key>, Authorization: Bearer <key>
//   count via header Prefer: count=exact -> Content-Range: 0-24/1234
// =====================================================================

export interface PublishedArticle {
  title: string;
  slug: string;
  published_at: string | null;
  thumbnail_url: string | null;
}

const ARTICLE_COLUMNS = "title,slug,published_at,thumbnail_url";

export function articlesUrl(baseUrl: string, limit: number): string {
  const safeLimit = Math.max(1, Math.min(1000, Math.trunc(limit)));
  const params = new URLSearchParams({
    select: ARTICLE_COLUMNS,
    status: "eq.published",
    order: "published_at.desc",
    limit: String(safeLimit),
  });
  return `${baseUrl}/rest/v1/articles?${params.toString()}`;
}

function authHeaders(key: string): Record<string, string> {
  return { apikey: key, Authorization: `Bearer ${key}` };
}

/** Fetch the most recent published articles (read-only). */
export async function getPublishedArticles(
  baseUrl: string,
  anonKey: string,
  limit: number,
): Promise<PublishedArticle[]> {
  const res = await fetch(articlesUrl(baseUrl, limit), {
    headers: authHeaders(anonKey),
  });
  if (!res.ok) return [];
  const rows = (await res.json()) as PublishedArticle[];
  return Array.isArray(rows) ? rows : [];
}

/**
 * Aggregate count of active subscribers via a HEAD request with
 * `Prefer: count=exact`; parses the total from the Content-Range header
 * (the number after the slash). Returns 0 on any error (never throws).
 */
export async function getActiveSubscriberCount(
  baseUrl: string,
  anonKey: string,
): Promise<number> {
  const url = `${baseUrl}/rest/v1/subscribers?select=id&status=eq.active`;
  const res = await fetch(url, {
    method: "HEAD",
    headers: { ...authHeaders(anonKey), Prefer: "count=exact" },
  });
  return parseContentRangeTotal(res.headers.get("content-range"));
}

/** Parse the total from a PostgREST `Content-Range` header (`0-24/1234`). */
export function parseContentRangeTotal(header: string | null): number {
  if (!header) return 0;
  const slash = header.lastIndexOf("/");
  if (slash < 0) return 0;
  const total = Number.parseInt(header.slice(slash + 1), 10);
  return Number.isFinite(total) ? total : 0;
}
