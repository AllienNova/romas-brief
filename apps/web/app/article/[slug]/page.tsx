/**
 * ROMAS Wire — Article Detail Page (FR-031)
 * Server component. ISR-friendly (revalidate 120s).
 * Uses mock data when Supabase is not provisioned.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  CATEGORY_META,
  CONTENT_TYPE_META,
  REGION_META,
  AUDIENCE_META,
} from "@/lib/mock-data";
import { getArticleBySlug, getArticlesByCategory, getPublishedSlugs } from "@/lib/articles";
import { AudioPlayer } from "@/components/AudioPlayer";
import { AudioStatusBadge } from "@/components/AudioStatusBadge";
import ShareButtons from "@/components/ShareButtons";
import { Reveal } from "@/components/motion/primitives";
import { SignalBar } from "@/components/dataviz/SignalBar";
import { CompositeScoreRing } from "@/components/dataviz/CompositeScoreRing";
import { renderMarkdown } from "@/lib/markdown";

export const revalidate = 120;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getPublishedSlugs()).map((slug) => ({ slug }));
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

export async function generateMetadata(
  props: {
    params: Promise<{ slug: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const article = await getArticleBySlug(params.slug);
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

export default async function ArticlePage(
  props: {
    params: Promise<{ slug: string }>;
  }
) {
  const params = await props.params;
  const mockArticle = await getArticleBySlug(params.slug);
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
  const primaryAudio = mockArticle.has_audio ? { audio_tier: "audio_brief", duration_sec: null } : null;

  const bodyHtml = typedArticle.body_md ? renderMarkdown(typedArticle.body_md) : null;

  const catMeta = CATEGORY_META[mockArticle.category];
  const ctMeta = CONTENT_TYPE_META[mockArticle.content_type];
  const regionMeta = REGION_META[mockArticle.region];

  // Related articles
  const related = (await getArticlesByCategory(mockArticle.category, 4))
    .filter((a) => a.slug !== mockArticle.slug)
    .slice(0, 3);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-[var(--rb-text-tertiary)] flex-wrap">
        <Link href="/" className="hover:text-[var(--rb-text-secondary)] transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/categories/${mockArticle.category}`} className="hover:text-[var(--rb-text-secondary)] transition-colors">
          {catMeta.label}
        </Link>
        <span>/</span>
        <span className="text-[var(--rb-text-secondary)] line-clamp-1 max-w-xs">{typedArticle.title}</span>
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[var(--rb-bg-raised)] text-[var(--rb-text-secondary)]">
            {regionMeta.flag} {regionMeta.label}
          </span>
          {mockArticle.has_audio && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border" style={{ background: "var(--rb-teal-subtle)", color: "var(--rb-teal)", borderColor: "var(--rb-border-subtle)" }}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a7 7 0 100 14A7 7 0 0010 3zm-1 9.5V7.5l5 2.5-5 2.5z" /></svg>
              Audio available
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--rb-text-primary)] tracking-tight leading-tight">
          {typedArticle.title}
        </h1>
        {typedArticle.standfirst && (
          <p className="mt-3 text-lg text-[var(--rb-text-secondary)] leading-relaxed">
            {typedArticle.standfirst}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--rb-text-tertiary)]">
          {typedArticle.published_at && (
            <time dateTime={typedArticle.published_at}>
              {new Date(typedArticle.published_at).toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
              })}
            </time>
          )}
          <Link href={`/issues/${mockArticle.issue_date}`} className="hover:text-[var(--rb-teal)] transition-colors">
            Issue: {mockArticle.issue_date}
          </Link>
          <span>Score: <strong className="text-[var(--rb-text-secondary)]">{mockArticle.composite_score}</strong></span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {mockArticle.audience.map((aud) => (
            <Link key={aud} href={`/for/${aud}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[var(--rb-border-default)] text-xs text-[var(--rb-text-tertiary)] hover:border-teal-300 hover:text-[var(--rb-teal)] transition-colors">
              {AUDIENCE_META[aud].icon} {AUDIENCE_META[aud].label}
            </Link>
          ))}
        </div>
      </header>
      {/* Inline audio player */}
      {audioUrl && primaryAudio && (
        <div className="mb-8">
          {/* QA-gated: reader RLS only exposes published audio (Rule 6). */}
          <AudioPlayer
            variant="banner"
            status="published"
            audioUrl={audioUrl}
            title={typedArticle.title}
            tier={primaryAudio.audio_tier}
            durationSec={primaryAudio.duration_sec}
            transcriptUrl={transcriptUrl}
          />
        </div>
      )}
      {/* ROMAS Insight callout */}
      {typedArticle.romas_insight && (
        <div className="mb-8 rounded-xl p-5 border" style={{ background: "var(--rb-teal-subtle)", borderColor: "var(--rb-border-subtle)" }}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--rb-teal)" }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--rb-teal)" }}>ROMAS Insight</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--rb-text-primary)" }}>{typedArticle.romas_insight}</p>
            </div>
          </div>
        </div>
      )}
      {/* Article body */}
      {bodyHtml && (
        <div
          className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[var(--rb-teal)] prose-a:no-underline hover:prose-a:underline prose-strong:text-[var(--rb-text-primary)] mb-10"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      )}
      {/* Signal scores */}
      <Reveal>
      <div className="mb-8 bg-[var(--rb-bg-raised)] rounded-xl border border-[var(--rb-border-subtle)] p-5">
        <h2 className="text-sm font-bold text-[var(--rb-text-secondary)] mb-4 uppercase tracking-wide">Signal Scores</h2>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex-1 space-y-2.5">
            {([
              ["Clinical", mockArticle.signal_scores.clinical, "#8B5CF6"],
              ["AI/ML", mockArticle.signal_scores.ai, "#EC4899"],
              ["Physics", mockArticle.signal_scores.physics, "#6366F1"],
              ["Operational", mockArticle.signal_scores.operational, "#F59E0B"],
              ["Novelty", mockArticle.signal_scores.novelty, "#14B8A6"],
              ["Confidence", mockArticle.signal_scores.confidence, "#10B981"],
            ] as [string, number, string][]).map(([label, value, color], i) => (
              <SignalBar key={label} label={label} value={value} color={color} delay={i * 0.06} />
            ))}
          </div>
          <div
            className="flex flex-shrink-0 items-center justify-center border-t pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0"
            style={{ borderColor: "var(--rb-border-default)" }}
          >
            <CompositeScoreRing score={mockArticle.composite_score} label="Composite" />
          </div>
        </div>
      </div>
      </Reveal>
      {/* Primary source */}
      {typedArticle.primary_source_url && (
        <Reveal>
        <div className="mb-8 rounded-xl border border-[var(--rb-border-subtle)] p-5" style={{ background: "var(--rb-bg-surface)" }}>
          <h2 className="text-sm font-bold text-[var(--rb-text-secondary)] mb-3 uppercase tracking-wide">Primary Source</h2>
          <p className="text-xs text-[var(--rb-text-tertiary)] mb-1 uppercase tracking-wide">
            {typedArticle.primary_source_type?.replace(/_/g, " ")}
          </p>
          <a href={typedArticle.primary_source_url} target="_blank" rel="noopener noreferrer"
            className="text-sm text-[var(--rb-teal)] hover:underline break-all transition-colors">
            {typedArticle.primary_source_url}
          </a>
        </div>
        </Reveal>
      )}
      {/* Tags */}
      {typedArticle.tags && typedArticle.tags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-[var(--rb-text-secondary)] mb-3 uppercase tracking-wide">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {typedArticle.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-[var(--rb-bg-raised)] text-[var(--rb-text-secondary)] text-xs">{tag}</span>
            ))}
          </div>
        </div>
      )}
      {/* Share row */}
      <ShareButtons title={typedArticle.title} slug={typedArticle.slug} />
      {/* Related articles */}
      {related.length > 0 && (
        <Reveal>
        <section className="mb-10">
          <h2 className="text-lg font-bold text-[var(--rb-text-primary)] mb-5">Related Briefings</h2>
          <div className="space-y-4">
            {related.map((rel) => {
              const relCat = CATEGORY_META[rel.category];
              return (
                <article key={rel.slug} className="group flex gap-4 rounded-xl border border-[var(--rb-border-subtle)] p-4 transition-all hover:border-[var(--rb-border-default)]" style={{ background: "var(--rb-bg-surface)" }}>
                  <div className="flex-1 min-w-0">
                    <Link href={`/article/${rel.slug}`} className="block">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${relCat.color}`}>{relCat.label}</span>
                        {rel.has_audio && <AudioStatusBadge status="published" />}
                      </div>
                      <h3 className="text-sm font-bold text-[var(--rb-text-primary)] group-hover:text-[var(--rb-teal)] transition-colors leading-snug">{rel.title}</h3>
                      <p className="mt-1 text-xs text-[var(--rb-text-tertiary)] line-clamp-2">{rel.standfirst}</p>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        </Reveal>
      )}
      {/* Back link */}
      <div className="mt-6 pt-6 border-t border-[var(--rb-border-subtle)]">
        <Link href="/" className="text-sm text-[var(--rb-text-tertiary)] hover:text-[var(--rb-teal)] transition-colors">
          ← Back to briefings
        </Link>
      </div>
    </article>
  );
}
