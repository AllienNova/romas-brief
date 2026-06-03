/**
 * ROMAS Wire — Region detail page (FR-025)
 * /regions/[slug] — 8 regions: us · europe · uk · apac · canada · latam · mena-africa · global
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  REGION_META,
  CATEGORY_META,
  CONTENT_TYPE_META,
  type Region,
  type MockArticle,
} from "@/lib/mock-data";
import { getArticlesByRegion } from "@/lib/articles";
import { Reveal } from "@/components/motion/primitives";

export const revalidate = 120;

export async function generateStaticParams() {
  return Object.keys(REGION_META).map((slug) => ({ slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const meta = REGION_META[params.slug as Region];
  if (!meta) return {};
  return {
    title: `${meta.label} — Radiation Oncology Intelligence`,
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
          <span className="ml-auto text-xs font-bold tabular-nums text-[var(--rb-text-tertiary)]">
            Score: {article.composite_score}
          </span>
        </div>
        <h2 className="text-base font-bold text-[var(--rb-text-primary)] group-hover:text-teal-700 transition-colors leading-snug">
          {article.title}
        </h2>
        <p className="mt-1.5 text-sm text-[var(--rb-text-secondary)] leading-relaxed line-clamp-2">
          {article.standfirst}
        </p>
        {article.romas_insight && (
          <div className="mt-2 pl-3 border-l-2 border-teal-200">
            <p className="text-xs text-teal-700 italic leading-relaxed line-clamp-1">
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

export default async function RegionPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slug = params.slug as Region;
  const meta = REGION_META[slug];
  if (!meta) notFound();

  const articles = await getArticlesByRegion(slug, 30);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--rb-text-tertiary)] mb-8">
        <Link href="/" className="hover:text-[var(--rb-text-secondary)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/regions" className="hover:text-[var(--rb-text-secondary)] transition-colors">Regions</Link>
        <span>/</span>
        <span className="text-[var(--rb-text-secondary)]">{meta.label}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <span className="text-5xl leading-none flex-shrink-0">{meta.flag}</span>
        <div>
          <h1 className="text-3xl font-black text-[var(--rb-text-primary)] tracking-tight">{meta.label}</h1>
          <p className="mt-2 text-[var(--rb-text-tertiary)] text-sm max-w-xl leading-relaxed">{meta.description}</p>
          <p className="mt-2 text-xs text-[var(--rb-text-tertiary)]">{articles.length} articles</p>
        </div>
      </div>

      {/* Other regions */}
      <Reveal>
      <div className="mb-8 flex flex-wrap gap-2">
        {(Object.entries(REGION_META) as [Region, typeof REGION_META[Region]][])
          .filter(([s]) => s !== slug)
          .map(([s, m]) => (
            <Link
              key={s}
              href={`/regions/${s}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[var(--rb-border-default)] text-xs text-[var(--rb-text-secondary)] hover:border-teal-300 hover:text-teal-700 transition-colors"
            >
              <span>{m.flag}</span> {m.label}
            </Link>
          ))}
      </div>
      </Reveal>

      {/* Article list */}
      <Reveal>
      {articles.length === 0 ? (
        <div className="text-center py-16 text-[var(--rb-text-tertiary)]">
          <p>No articles for this region yet.</p>
        </div>
      ) : (
        <div>
          {articles.map((article) => (
            <ArticleRow key={article.slug} article={article} />
          ))}
        </div>
      )}
      </Reveal>
    </div>
  );
}
