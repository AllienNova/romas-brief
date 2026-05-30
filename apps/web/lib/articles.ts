// =====================================================================
// apps/web/lib/articles.ts · ROMAS Brief reader — data-access layer (SHIP-08)
//
// DB-backed equivalents of the mock-data article functions. Each returns the
// SAME MockArticle shape so components/routes are unchanged apart from `await`.
//
// Safety: every query mirrors the `public_read_published` RLS policy
//   (status = 'published' AND revoked_at IS NULL) — anon can only read live,
//   non-revoked articles. When SUPABASE_URL / SUPABASE_ANON_KEY are absent
//   (local/preview/CI without secrets), each function falls back to the mock
//   layer so the reader still renders and the build stays green. Real DB data
//   is served only when env + published content both exist.
//
// Presentation config (CATEGORY_META / REGION_META / AUDIENCE_META /
//   CONTENT_TYPE_META / ISSUE_DATES) stays in ./mock-data — it is not article
//   data and is imported directly by routes.
//
// NOTE (audio): has_audio / audio_url require an audio_jobs join; deferred to
//   the audio-surface work (listen page / SHIP-23). Until then audio getters
//   return empty against the DB (consistent with 0 published audio episodes).
// =====================================================================

import { createPublicSupabaseClient } from "./supabase/public";
import * as mock from "./mock-data";
import type { MockArticle, Category, Region, Audience, ContentType } from "./mock-data";

/** Columns the reader needs; maps to MockArticle in rowToArticle(). */
const COLUMNS =
  "slug,title,standfirst,body_md,category,content_type,region,audience_tags," +
  "primary_source_url,primary_source_type,published_at,created_at," +
  "composite_score,signal_scores,romas_insight,modality_tags,disease_site_tags";

interface DbArticleRow {
  slug: string;
  title: string;
  standfirst: string;
  body_md: string;
  category: string;
  content_type: string;
  region: string[] | null;
  audience_tags: string[] | null;
  primary_source_url: string;
  primary_source_type: string | null;
  published_at: string | null;
  created_at: string | null;
  composite_score: number | null;
  signal_scores: unknown;
  romas_insight: string | null;
  modality_tags: string[] | null;
  disease_site_tags: string[] | null;
}

function hasDbEnv(): boolean {
  return Boolean(process.env["SUPABASE_URL"] && process.env["SUPABASE_ANON_KEY"]);
}

// DB stores categories with underscores (clinical_rt, resident_education,
// future_rt); the reader Category type + CATEGORY_META use hyphens. Convert
// at the boundary in both directions.
function dbCategory(c: Category): string {
  return c.replace(/-/g, "_");
}
function readerCategory(c: string): Category {
  return c.replace(/_/g, "-") as Category;
}

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function parseSignalScores(j: unknown): MockArticle["signal_scores"] {
  const o = (j && typeof j === "object" ? j : {}) as Record<string, unknown>;
  return {
    clinical: num(o["clinical"]),
    ai: num(o["ai"]),
    physics: num(o["physics"]),
    operational: num(o["operational"]),
    novelty: num(o["novelty"]),
    confidence: num(o["confidence"]),
  };
}

function rowToArticle(r: DbArticleRow): MockArticle {
  const published = r.published_at ?? r.created_at ?? "";
  return {
    slug: r.slug,
    title: r.title,
    standfirst: r.standfirst,
    body: r.body_md,
    category: readerCategory(r.category),
    content_type: r.content_type as ContentType,
    region: (r.region?.[0] ?? "global") as Region,
    audience: (r.audience_tags ?? []) as Audience[],
    primary_source_url: r.primary_source_url,
    primary_source_type: r.primary_source_type ?? "",
    published_at: published,
    issue_date: published.slice(0, 10),
    has_audio: false,
    composite_score: num(r.composite_score),
    signal_scores: parseSignalScores(r.signal_scores),
    romas_insight: r.romas_insight ?? undefined,
    tags: [],
    modality_tags: r.modality_tags ?? [],
    disease_site_tags: r.disease_site_tags ?? [],
  };
}

/** Base SELECT constrained to the public_read_published RLS shape. */
function publishedQuery() {
  return createPublicSupabaseClient()
    .from("articles")
    .select(COLUMNS)
    .eq("status", "published")
    .is("revoked_at", null);
}

function mapRows(data: unknown): MockArticle[] {
  return Array.isArray(data) ? (data as DbArticleRow[]).map(rowToArticle) : [];
}

export async function getArticleBySlug(slug: string): Promise<MockArticle | undefined> {
  if (!hasDbEnv()) return mock.getArticleBySlug(slug);
  const { data, error } = await publishedQuery().eq("slug", slug).limit(1).maybeSingle();
  if (error || !data) return undefined;
  return rowToArticle(data as unknown as DbArticleRow);
}

export async function getArticlesByCategory(category: Category, limit = 20): Promise<MockArticle[]> {
  if (!hasDbEnv()) return mock.getArticlesByCategory(category, limit);
  const { data } = await publishedQuery().eq("category", dbCategory(category)).order("composite_score", { ascending: false }).limit(limit);
  return mapRows(data);
}

export async function getArticlesByRegion(region: Region, limit = 20): Promise<MockArticle[]> {
  if (!hasDbEnv()) return mock.getArticlesByRegion(region, limit);
  const { data } = await publishedQuery()
    .or(`region.cs.{${region}},region.cs.{global}`)
    .order("composite_score", { ascending: false })
    .limit(limit);
  return mapRows(data);
}

export async function getArticlesByAudience(audience: Audience, limit = 20): Promise<MockArticle[]> {
  if (!hasDbEnv()) return mock.getArticlesByAudience(audience, limit);
  const { data } = await publishedQuery().contains("audience_tags", [audience]).order("composite_score", { ascending: false }).limit(limit);
  return mapRows(data);
}

export async function getArticlesByContentType(contentType: ContentType, limit = 20): Promise<MockArticle[]> {
  if (!hasDbEnv()) return mock.getArticlesByContentType(contentType, limit);
  const { data } = await publishedQuery().eq("content_type", contentType).order("composite_score", { ascending: false }).limit(limit);
  return mapRows(data);
}

export async function getArticlesByIssueDate(issueDate: string): Promise<MockArticle[]> {
  if (!hasDbEnv()) return mock.getArticlesByIssueDate(issueDate);
  const { data } = await publishedQuery()
    .gte("published_at", `${issueDate}T00:00:00Z`)
    .lte("published_at", `${issueDate}T23:59:59Z`)
    .order("composite_score", { ascending: false });
  return mapRows(data);
}

export async function getTopStories(limit = 6): Promise<MockArticle[]> {
  if (!hasDbEnv()) return mock.getTopStories(limit);
  const { data } = await publishedQuery().order("composite_score", { ascending: false }).limit(limit);
  return mapRows(data);
}

export async function getTrendingArticles(limit = 5): Promise<MockArticle[]> {
  if (!hasDbEnv()) return mock.getTrendingArticles(limit);
  // Proxy "trending" by recency among high-signal articles.
  const { data } = await publishedQuery().order("published_at", { ascending: false }).limit(limit);
  return mapRows(data);
}

export async function getPaperOfTheDay(): Promise<MockArticle | undefined> {
  if (!hasDbEnv()) return mock.getPaperOfTheDay();
  const { data } = await publishedQuery()
    .in("content_type", ["paper_critique", "practice_delta"])
    .order("composite_score", { ascending: false })
    .limit(1);
  return mapRows(data)[0];
}

export async function getQuickHits(limit = 5): Promise<MockArticle[]> {
  if (!hasDbEnv()) return mock.getQuickHits(limit);
  const { data } = await publishedQuery().eq("content_type", "news_brief").order("published_at", { ascending: false }).limit(limit);
  return mapRows(data);
}

export async function getIndustryMoves(limit = 3): Promise<MockArticle[]> {
  if (!hasDbEnv()) return mock.getIndustryMoves(limit);
  const { data } = await publishedQuery()
    .or("content_type.eq.vendor_intel,category.eq.vendor")
    .order("published_at", { ascending: false })
    .limit(limit);
  return mapRows(data);
}

export async function getTopPapersThisWeek(limit = 5): Promise<MockArticle[]> {
  if (!hasDbEnv()) return mock.getTopPapersThisWeek(limit);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await publishedQuery()
    .in("content_type", ["paper_critique", "practice_delta"])
    .gte("published_at", weekAgo)
    .order("composite_score", { ascending: false })
    .limit(limit);
  return mapRows(data);
}

// ── Audio getters: DB audio_jobs join is deferred (SHIP-23 / listen surface).
//    Until then, fall back to mock when no env; return empty against the DB. ──
export async function getAudioArticles(limit = 20): Promise<MockArticle[]> {
  if (!hasDbEnv()) return mock.getAudioArticles(limit);
  return [];
}

export async function getTodaysPodcast(): Promise<MockArticle | undefined> {
  if (!hasDbEnv()) return mock.getTodaysPodcast();
  return undefined;
}

/** Published, non-revoked slugs for generateStaticParams (ISR). */
export async function getPublishedSlugs(): Promise<string[]> {
  if (!hasDbEnv()) return mock.MOCK_ARTICLES.map((a) => a.slug);
  const { data } = await createPublicSupabaseClient()
    .from("articles")
    .select("slug")
    .eq("status", "published")
    .is("revoked_at", null);
  return Array.isArray(data) ? (data as { slug: string }[]).map((r) => r.slug) : [];
}
