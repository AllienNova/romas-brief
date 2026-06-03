/**
 * ROMAS Wire — Categories index page
 */
import Link from "next/link";
import { CATEGORY_META, type Category } from "@/lib/mock-data";
import { getArticlesByCategory } from "@/lib/articles";
import { Stagger, StaggerItem } from "@/components/motion/primitives";

export const revalidate = 300;

export const metadata = {
  title: "Browse by Category",
  description: "Radiation oncology intelligence by category — AI, Physics, Clinical RT, Regulatory, Guidelines, and more.",
};

export default async function CategoriesIndexPage() {
  const categories = Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][];
  const counts = await Promise.all(
    categories.map(async ([slug]) => (await getArticlesByCategory(slug, 200)).length)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest font-semibold text-teal-600 mb-2">Browse</p>
        <h1 className="text-3xl font-black text-[var(--rb-text-primary)] tracking-tight">By Category</h1>
        <p className="mt-2 text-[var(--rb-text-tertiary)] text-sm max-w-xl">
          Every ROMAS Wire article is classified into one of 11 clinical categories.
        </p>
      </div>

      <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(([slug, meta], i) => {
          const count = counts[i] ?? 0;
          return (
            <StaggerItem key={slug} className="h-full">
              <Link
                href={`/categories/${slug}`}
                className="group bg-white rounded-xl border border-[var(--rb-border-subtle)] hover:border-teal-200 hover:shadow-sm p-5 transition-all block h-full"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${meta.color}`}>
                    {meta.label}
                  </span>
                  <span className="text-xs text-[var(--rb-text-tertiary)] tabular-nums">{count}</span>
                </div>
                <p className="text-xs text-[var(--rb-text-tertiary)] leading-relaxed line-clamp-2">{meta.description}</p>
                <p className="mt-3 text-xs text-teal-600 font-medium group-hover:underline">Browse →</p>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
