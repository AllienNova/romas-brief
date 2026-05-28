/**
 * ROMAS Brief — Article Detail Page (FR-031)
 * Server component. ISR-friendly (revalidate 120s).
 * Uses mock data when Supabase is not provisioned.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  MOCK_ARTICLES,
  CATEGORY_META,
  CONTENT_TYPE_META,
  REGION_META,
  AUDIENCE_META,
  getArticleBySlug,
} from "@/lib/mock-data";
import InlineAudioPlayer from "@/components/InlineAudioPlayer";
import ShareButtons from "@/components/ShareButtons";

export const revalidate = 120;

export async function generateStaticParams() {
  return MOCK_ARTICLES.map((a) => ({ slug: a.slug }));
}

interface ArticleDetail {
  id: string;
  slug: string;
  title: string;
  standfirst: string | null;
  body_md: string | null;
  romas_insight: string | null;
  category: string | null;
  primary_source_url: string | null;
  primary_source_type: string | null;
  tags: string[] | null;
  published_at: string | null;
}

interface AudioJobDetail {
  id: string;
  audio_tier: string;
  audio_url_cdn: string | null;
  transcript_url: string | null;
  duration_sec: number | null;
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const article = getArticleBySlug(params.slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.standfirst,
    openGraph: {
      title: article.title,
      description: article.standfirst,
      type: "article",
      publishedTime: article.published_at,
    },
  };
}

/** Very simple markdown-to-HTML converter for body_md display */
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hul])/gm, "<p>")
    .replace(/(?<![>])$/gm, "</p>")
    .replace(/<p><\/p>/g, "");
}

export default function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  // Use mock data (replace with Supabase query once DB is provisioned)
  const mockArticle = getArticleBySlug(params.slug);
  if (!mockArticle) notFound();

  const typedArticle: ArticleDetail = {
    id: mockArticle.slug,
    slug: mockArticle.slug,
    title: mockArticle.title,
    standfirst: mockArticle.standfirst,
    body_md: mockArticle.body,
    romas_insight: mockArticle.romas_insight ?? null,
    category: mockArticle.category,
    primary_source_url: mockArticle.primary_source_url,
    primary_source_type: mockArticle.primary_source_type,
    tags: mockArticle.tags,
    published_at: mockArticle.published_at,
  };

  const audioUrl = mockArticle.has_audio ? (mockArticle.audio_url ?? null) : null;
  const transcriptUrl = null;
  const primaryAudio = mockArticle.has_audio ? { audio_tier: "standard", duration_sec: null } : null;

  const bodyHtml = typedArticle.body_md ? renderMarkdown(typedArticle.body_md) : null;

  const catMeta = CATEGORY_META[mockArticle.category];
  const ctMeta = CONTENT_TYPE_META[mockArticle.content_type];
  const regionMeta = REGION_META[mockArticle.region];

  // Related articles
  const related = MOCK_ARTICLES.filter(
    (a) => a.category === mockArticle.category && a.slug !== mockArticle.slug
  ).slice(0, 3);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-neutral-400 flex-wrap">
        <Link href="/" className="hover:text-neutral-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/categories/${mockArticle.category}`} className="hover:text-neutral-600 transition-colors">
          {catMeta.label}
        </Link>
        <span>/</span>
        <span className="text-neutral-600 line-clamp-1 max-w-xs">{typedArticle.title}</span>
      </nav>

      {/* Article header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${catMeta.color}`}>
            {catMeta.label}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${ctMeta.color}`}>
            {ctMeta.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600">
            {regionMeta.flag} {regionMeta.label}
          </span>
          {mockArticle.has_audio && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-600 border border-teal-100">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a7 7 0 100 14A7 7 0 0010 3zm-1 9.5V7.5l5 2.5-5 2.5z" /></svg>
              Audio available
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-tight">
          {typedArticle.title}
        </h1>
        {typedArticle.standfirst && (
          <p className="mt-3 text-lg text-neutral-600 leading-relaxed">
            {typedArticle.standfirst}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-400">
          {typedArticle.published_at && (
            <time dateTime={typedArticle.published_at}>
              {new Date(typedArticle.published_at).toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
              })}
            </time>
          )}
          <Link href={`/issues/${mockArticle.issue_date}`} className="hover:text-teal-600 transition-colors">
            Issue: {mockArticle.issue_date}
          </Link>
          <span>Score: <strong className="text-neutral-600">{mockArticle.composite_score}</strong></span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {mockArticle.audience.map((aud) => (
            <Link key={aud} href={`/for/${aud}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-neutral-200 text-xs text-neutral-500 hover:border-teal-300 hover:text-teal-700 transition-colors">
              {AUDIENCE_META[aud].icon} {AUDIENCE_META[aud].label}
            </Link>
          ))}
        </div>
      </header>

      {/* Inline audio player */}
      {audioUrl && primaryAudio && (
        <div className="mb-8">
          <InlineAudioPlayer audioUrl={audioUrl} title={typedArticle.title} />
        </div>
      )}

      {/* ROMAS Insight callout */}
      {typedArticle.romas_insight && (
        <div className="mb-8 bg-teal-50 border border-teal-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-teal-800 uppercase tracking-wide mb-1">ROMAS Insight</p>
              <p className="text-sm text-teal-900 leading-relaxed">{typedArticle.romas_insight}</p>
            </div>
          </div>
        </div>
      )}

      {/* Article body */}
      {bodyHtml && (
        <div
          className="prose prose-neutral max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-neutral-900 mb-10"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      )}

      {/* Signal scores */}
      <div className="mb-8 bg-neutral-50 rounded-xl border border-neutral-100 p-5">
        <h2 className="text-sm font-bold text-neutral-700 mb-4 uppercase tracking-wide">Signal Scores</h2>
        <div className="space-y-2.5">
          {([
            ["Clinical", mockArticle.signal_scores.clinical, "bg-violet-400"],
            ["AI/ML", mockArticle.signal_scores.ai, "bg-pink-400"],
            ["Physics", mockArticle.signal_scores.physics, "bg-indigo-400"],
            ["Operational", mockArticle.signal_scores.operational, "bg-amber-400"],
            ["Novelty", mockArticle.signal_scores.novelty, "bg-teal-400"],
            ["Confidence", mockArticle.signal_scores.confidence, "bg-emerald-400"],
          ] as [string, number, string][]).map(([label, value, color]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 w-20 flex-shrink-0">{label}</span>
              <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.round(value * 100)}%` }} />
              </div>
              <span className="text-xs text-neutral-400 tabular-nums w-6 text-right">{Math.round(value * 100)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between">
          <span className="text-xs text-neutral-500">Composite score</span>
          <span className="text-lg font-black text-neutral-900 tabular-nums">{mockArticle.composite_score}</span>
        </div>
      </div>

      {/* Primary source */}
      {typedArticle.primary_source_url && (
        <div className="mb-8 bg-white rounded-xl border border-neutral-100 p-5">
          <h2 className="text-sm font-bold text-neutral-700 mb-3 uppercase tracking-wide">Primary Source</h2>
          <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">
            {typedArticle.primary_source_type?.replace(/_/g, " ")}
          </p>
          <a href={typedArticle.primary_source_url} target="_blank" rel="noopener noreferrer"
            className="text-sm text-teal-600 hover:underline break-all transition-colors">
            {typedArticle.primary_source_url}
          </a>
        </div>
      )}

      {/* Tags */}
      {typedArticle.tags && typedArticle.tags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-neutral-700 mb-3 uppercase tracking-wide">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {typedArticle.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Share row */}
      <ShareButtons title={typedArticle.title} slug={typedArticle.slug} />

      {/* Related articles */}
      {related.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-neutral-900 mb-5">Related Briefings</h2>
          <div className="space-y-4">
            {related.map((rel) => {
              const relCat = CATEGORY_META[rel.category];
              return (
                <article key={rel.slug} className="group flex gap-4 bg-white rounded-xl border border-neutral-100 hover:border-teal-100 p-4 transition-all">
                  <div className="flex-1 min-w-0">
                    <Link href={`/article/${rel.slug}`} className="block">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${relCat.color}`}>{relCat.label}</span>
                        {rel.has_audio && <span className="text-xs text-teal-600">▶ Audio</span>}
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900 group-hover:text-teal-700 transition-colors leading-snug">{rel.title}</h3>
                      <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{rel.standfirst}</p>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="mt-6 pt-6 border-t border-neutral-100">
        <Link href="/" className="text-sm text-neutral-500 hover:text-teal-700 transition-colors">
          ← Back to briefings
        </Link>
      </div>
    </article>
  );
}
