/**
 * ROMAS Brief — Issue detail page (FR-030)
 * /issues/[date] — shows all articles for a given issue date (YYYY-MM-DD)
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ISSUE_DATES,
  CATEGORY_META,
  CONTENT_TYPE_META,
  type MockArticle,
} from "@/lib/mock-data";
import { getArticlesByIssueDate } from "@/lib/articles";

export const revalidate = 120;

export async function generateStaticParams() {
  return ISSUE_DATES.map((date) => ({ date }));
}

export async function generateMetadata(props: { params: Promise<{ date: string }> }) {
  const params = await props.params;
  const d = new Date(params.date + "T12:00:00Z");
  if (isNaN(d.getTime())) return {};
  const label = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  return {
    title: `${label} — ROMAS Brief`,
    description: `All ROMAS Brief radiation oncology briefings for ${label}.`,
  };
}

function ArticleRow({ article }: { article: MockArticle }) {
  const catMeta = CATEGORY_META[article.category];
  const ctMeta = CONTENT_TYPE_META[article.content_type];
  return (
    <article className="group py-5 border-b border-neutral-100 last:border-0">
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
          <span className="ml-auto text-xs font-bold tabular-nums text-neutral-400">Score: {article.composite_score}</span>
        </div>
        <h2 className="text-base font-bold text-neutral-900 group-hover:text-teal-700 transition-colors leading-snug">
          {article.title}
        </h2>
        <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed line-clamp-2">{article.standfirst}</p>
        {article.romas_insight && (
          <div className="mt-2 pl-3 border-l-2 border-teal-200">
            <p className="text-xs text-teal-700 italic line-clamp-1">
              <span className="font-semibold not-italic">ROMAS Insight:</span> {article.romas_insight}
            </p>
          </div>
        )}
      </Link>
    </article>
  );
}

export default async function IssuePage(props: { params: Promise<{ date: string }> }) {
  const params = await props.params;
  const d = new Date(params.date + "T12:00:00Z");
  if (isNaN(d.getTime())) notFound();

  const articles = await getArticlesByIssueDate(params.date);
  if (articles.length === 0 && !ISSUE_DATES.includes(params.date)) notFound();

  const label = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  // Find prev/next issue dates
  const idx = ISSUE_DATES.indexOf(params.date);
  const prevDate = idx < ISSUE_DATES.length - 1 ? ISSUE_DATES[idx + 1] : null;
  const nextDate = idx > 0 ? ISSUE_DATES[idx - 1] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-8">
        <Link href="/" className="hover:text-neutral-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/issues" className="hover:text-neutral-600 transition-colors">Archive</Link>
        <span>/</span>
        <span className="text-neutral-600">{params.date}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-teal-600 mb-2">Daily Issue</p>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">{label}</h1>
        <p className="mt-2 text-xs text-neutral-400">{articles.length} briefings in this issue</p>
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p>No briefings for this date.</p>
        </div>
      ) : (
        <div>
          {articles.map((article) => (
            <ArticleRow key={article.slug} article={article} />
          ))}
        </div>
      )}

      {/* Prev / Next navigation */}
      <div className="mt-10 flex items-center justify-between pt-6 border-t border-neutral-100">
        {prevDate ? (
          <Link
            href={`/issues/${prevDate}`}
            className="flex items-center gap-2 text-sm text-neutral-600 hover:text-teal-700 transition-colors"
          >
            ← {new Date(prevDate + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </Link>
        ) : <span />}
        <Link href="/issues" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
          All issues
        </Link>
        {nextDate ? (
          <Link
            href={`/issues/${nextDate}`}
            className="flex items-center gap-2 text-sm text-neutral-600 hover:text-teal-700 transition-colors"
          >
            {new Date(nextDate + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" })} →
          </Link>
        ) : <span />}
      </div>
    </div>
  );
}
