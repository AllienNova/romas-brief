/**
 * Google News sitemap (SSOT decision 22 / §12.8 gate). Lists articles
 * published in the last 48h (Google News spec) with the news:news extension.
 * Submit this URL in Google Publisher Center. Pairs with the NewsArticle
 * JSON-LD already emitted on article pages (app/layout.tsx + article route).
 */
import { getRecentPublished } from "@/lib/articles";

export const revalidate = 900; // 15 min

const BASE_URL = "https://romasbrief.vercel.app"; // phase-2: → https://romaswire.com
const PUBLICATION_NAME = "ROMAS Wire";
const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000; // Google News only indexes the last 2 days

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  const cutoff = Date.now() - NEWS_WINDOW_MS;
  const recent = (await getRecentPublished(1000))
    .map((a) => ({ a, t: Date.parse(a.published_at ?? "") }))
    .filter(({ t }) => Number.isFinite(t) && t >= cutoff);

  const entries = recent
    .map(
      ({ a, t }) => `  <url>
    <loc>${BASE_URL}/article/${escapeXml(a.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>${PUBLICATION_NAME}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(t).toISOString()}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}
