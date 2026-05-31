/**
 * ROMAS Wire — Audience detail page (FR-027)
 * /for/[audience] — 5 audiences: physicians · physicists · dosimetrists · therapists · residents
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AUDIENCE_META,
  CATEGORY_META,
  CONTENT_TYPE_META,
  type Audience,
  type MockArticle,
} from "@/lib/mock-data";
import { getArticlesByAudience } from "@/lib/articles";

export const revalidate = 120;

export async function generateStaticParams() {
  return Object.keys(AUDIENCE_META).map((slug) => ({ audience: slug }));
}

export async function generateMetadata(props: { params: Promise<{ audience: string }> }) {
  const params = await props.params;
  const meta = AUDIENCE_META[params.audience as Audience];
  if (!meta) return {};
  return {
    title: `For ${meta.label} — ROMAS Wire`,
    description: meta.description,
  };
}

function ArticleRow({ article }: { article: MockArticle }) {
  const catMeta = CATEGORY_META[article.category];
  const ctMeta = CONTENT_TYPE_META[article.content_type];
  return (
    <article className="group py-5 border-b border-[var(--rb-border-subtle)] last:border-0">
      <Link href={`/article/${article.slug}`} className="block">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${catMeta.color}`}>
            {catMeta.label}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${ctMeta.color}`}>
            {ctMeta.label}
          </span>
          {article.has_audio && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-600 border border-teal-100">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a7 7 0 100 14A7 7 0 0010 3zm-1 9.5V7.5l5 2.5-5 2.5z" /></svg>
              Audio
            </span>
          )}
        </div>
        <h2 className="text-base font-bold text-[var(--rb-text-primary)] group-hover:text-teal-700 transition-colors leading-snug">
          {article.title}
        </h2>
        <p className="mt-1.5 text-sm text-[var(--rb-text-secondary)] leading-relaxed line-clamp-2">{article.standfirst}</p>
        {article.romas_insight && (
          <div className="mt-2 pl-3 border-l-2 border-teal-200">
            <p className="text-xs text-teal-700 italic line-clamp-1">
              <span className="font-semibold not-italic">ROMAS Insight:</span> {article.romas_insight}
            </p>
          </div>
        )}
        <time dateTime={article.published_at} className="mt-2 block text-xs text-[var(--rb-text-tertiary)]">
          {new Date(article.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </time>
      </Link>
    </article>
  );
}

export default async function AudiencePage(props: { params: Promise<{ audience: string }> }) {
  const params = await props.params;
  const slug = params.audience as Audience;
  const meta = AUDIENCE_META[slug];
  if (!meta) notFound();

  const articles = await getArticlesByAudience(slug, 30);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--rb-text-tertiary)] mb-8">
        <Link href="/" className="hover:text-[var(--rb-text-secondary)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--rb-text-secondary)]">For {meta.label}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <span className="text-4xl leading-none flex-shrink-0">{meta.icon}</span>
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-teal-600 mb-1">Curated for</p>
          <h1 className="text-3xl font-black text-[var(--rb-text-primary)] tracking-tight">{meta.label}</h1>
          <p className="mt-2 text-[var(--rb-text-tertiary)] text-sm max-w-xl leading-relaxed">{meta.description}</p>
          <p className="mt-2 text-xs text-[var(--rb-text-tertiary)]">{articles.length} articles</p>
        </div>
      </div>

      {/* Other audiences */}
      <div className="mb-8 flex flex-wrap gap-2">
        {(Object.entries(AUDIENCE_META) as [Audience, typeof AUDIENCE_META[Audience]][])
          .filter(([s]) => s !== slug)
          .map(([s, m]) => (
            <Link
              key={s}
              href={`/for/${s}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--rb-border-default)] text-xs text-[var(--rb-text-secondary)] hover:border-teal-300 hover:text-teal-700 transition-colors"
            >
              <span>{m.icon}</span> {m.label}
            </Link>
          ))}
      </div>

      {/* Article list */}
      {articles.length === 0 ? (
        <div className="text-center py-16 text-[var(--rb-text-tertiary)]">
          <p>No articles for this audience yet.</p>
        </div>
      ) : (
        <div>
          {articles.map((article) => (
            <ArticleRow key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
