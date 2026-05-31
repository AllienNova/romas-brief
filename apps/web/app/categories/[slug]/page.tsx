/**
 * ROMAS Brief — Category detail page (FR-026)
 * /categories/[slug] — 11 categories
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CATEGORY_META,
  CONTENT_TYPE_META,
  type Category,
  type MockArticle,
} from "@/lib/mock-data";
import { getArticlesByCategory } from "@/lib/articles";

export const revalidate = 120;

export async function generateStaticParams() {
  return Object.keys(CATEGORY_META).map((slug) => ({ slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const meta = CATEGORY_META[params.slug as Category];
  if (!meta) return {};
  return {
    title: `${meta.label} — ROMAS Brief`,
    description: meta.description,
  };
}

function ArticleCard({ article }: { article: MockArticle }) {
  const ctMeta = CONTENT_TYPE_META[article.content_type];
  return (
    <article className="group bg-white rounded-xl border border-[var(--rb-border-subtle)] hover:border-teal-100 hover:shadow-sm p-5 transition-all">
      <Link href={`/article/${article.slug}`} className="block">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${ctMeta.color}`}>
            {ctMeta.label}
          </span>
          {article.has_audio && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-600 border border-teal-100">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a7 7 0 100 14A7 7 0 0010 3zm-1 9.5V7.5l5 2.5-5 2.5z" /></svg>
              Audio
            </span>
          )}
          <span className="ml-auto text-xs font-bold tabular-nums text-[var(--rb-text-tertiary)]">{article.composite_score}</span>
        </div>
        <h2 className="text-base font-bold text-[var(--rb-text-primary)] group-hover:text-teal-700 transition-colors leading-snug">
          {article.title}
        </h2>
        <p className="mt-2 text-sm text-[var(--rb-text-secondary)] leading-relaxed line-clamp-3">{article.standfirst}</p>
        {article.romas_insight && (
          <div className="mt-3 pl-3 border-l-2 border-teal-200">
            <p className="text-xs text-teal-700 italic line-clamp-2">
              <span className="font-semibold not-italic">ROMAS Insight:</span> {article.romas_insight}
            </p>
          </div>
        )}
        <time dateTime={article.published_at} className="mt-3 block text-xs text-[var(--rb-text-tertiary)]">
          {new Date(article.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </time>
      </Link>
    </article>
  );
}

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slug = params.slug as Category;
  const meta = CATEGORY_META[slug];
  if (!meta) notFound();

  const articles = await getArticlesByCategory(slug, 30);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--rb-text-tertiary)] mb-8">
        <Link href="/" className="hover:text-[var(--rb-text-secondary)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-[var(--rb-text-secondary)] transition-colors">Categories</Link>
        <span>/</span>
        <span className="text-[var(--rb-text-secondary)]">{meta.label}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <span className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${meta.color} mb-3`}>
          {meta.label}
        </span>
        <h1 className="text-3xl font-black text-[var(--rb-text-primary)] tracking-tight">{meta.label}</h1>
        <p className="mt-2 text-[var(--rb-text-tertiary)] text-sm max-w-xl leading-relaxed">{meta.description}</p>
        <p className="mt-2 text-xs text-[var(--rb-text-tertiary)]">{articles.length} articles</p>
      </div>

      {/* Other categories */}
      <div className="mb-8 flex flex-wrap gap-2">
        {(Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][])
          .filter(([s]) => s !== slug)
          .map(([s, m]) => (
            <Link
              key={s}
              href={`/categories/${s}`}
              className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${m.color} hover:opacity-80 transition-opacity`}
            >
              {m.label}
            </Link>
          ))}
      </div>

      {/* Article grid */}
      {articles.length === 0 ? (
        <div className="text-center py-16 text-[var(--rb-text-tertiary)]">
          <p>No articles in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
