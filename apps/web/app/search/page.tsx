/**
 * ROMAS Wire — Search (SHIP-25 / T-307)
 * /search?q=… — full-text + semantic search over published articles.
 *
 * Server component, no client JS: a GET <form> submits the query back to this
 * route, results render server-side (good for SSR/SEO + accessibility). Data:
 * searchArticles() — DB hybrid FTS+pgvector when configured, weighted mock
 * ranking otherwise. Dynamic: results depend on the query string.
 */
import Link from "next/link";
import { CONTENT_TYPE_META, type MockArticle } from "@/lib/mock-data";
import { searchArticles } from "@/lib/articles";
import { Stagger, StaggerItem } from "@/components/motion/primitives";

export const dynamic = "force-dynamic";

export function generateMetadata(props: { searchParams: Promise<{ q?: string }> }) {
  return props.searchParams.then((sp) => {
    const q = (sp.q ?? "").trim();
    return {
      title: q ? `“${q}” — Search — ROMAS Wire` : "Search — ROMAS Wire",
      description: "Search ROMAS Wire — radiation oncology clinical intelligence.",
      // Query result pages should not be indexed.
      robots: { index: false, follow: true },
    };
  });
}

function ResultCard({ article }: { article: MockArticle }) {
  const ctMeta = CONTENT_TYPE_META[article.content_type];
  return (
    <article className="group bg-white rounded-xl border border-[var(--rb-border-subtle)] hover:border-teal-100 hover:shadow-sm p-5 transition-all">
      <Link href={`/article/${article.slug}`} className="block">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {ctMeta && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${ctMeta.color}`}>
              {ctMeta.label}
            </span>
          )}
          <span className="ml-auto text-xs font-bold tabular-nums text-[var(--rb-text-tertiary)]">
            {article.composite_score}
          </span>
        </div>
        <h2 className="text-base font-bold text-[var(--rb-text-primary)] group-hover:text-teal-700 transition-colors leading-snug">
          {article.title}
        </h2>
        <p className="mt-2 text-sm text-[var(--rb-text-secondary)] leading-relaxed line-clamp-3">{article.standfirst}</p>
        <time dateTime={article.published_at} className="mt-3 block text-xs text-[var(--rb-text-tertiary)]">
          {new Date(article.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </time>
      </Link>
    </article>
  );
}

export default async function SearchPage(props: { searchParams: Promise<{ q?: string }> }) {
  const sp = await props.searchParams;
  const query = (sp.q ?? "").trim();
  const results = query ? await searchArticles(query, 30) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <nav className="flex items-center gap-2 text-xs text-[var(--rb-text-tertiary)] mb-8">
        <Link href="/" className="hover:text-[var(--rb-text-secondary)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--rb-text-secondary)]">Search</span>
      </nav>

      <h1 className="text-3xl font-black text-[var(--rb-text-primary)] tracking-tight mb-6">Search</h1>

      <form action="/search" method="get" role="search" className="mb-8 flex gap-2">
        <label htmlFor="q" className="sr-only">Search ROMAS Wire</label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search articles — e.g. proton therapy, FLASH, FDA clearance"
          autoComplete="off"
          className="flex-1 rounded-lg border border-[var(--rb-border-subtle)] bg-white px-4 py-2.5 text-sm text-[var(--rb-text-primary)] placeholder:text-[var(--rb-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400"
        />
        <button
          type="submit"
          className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-colors"
        >
          Search
        </button>
      </form>

      {query === "" ? (
        <p className="text-[var(--rb-text-tertiary)] text-sm">
          Enter a search term to find ROMAS Wire articles by relevance.
        </p>
      ) : (
        <>
          <p className="mb-6 text-sm text-[var(--rb-text-tertiary)]" aria-live="polite">
            {results.length === 0
              ? `No results for “${query}”.`
              : `${results.length} result${results.length === 1 ? "" : "s"} for “${query}”.`}
          </p>
          {results.length > 0 && (
            <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((article) => (
                <StaggerItem key={article.slug} className="h-full">
                  <ResultCard article={article} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </>
      )}
    </div>
  );
}
