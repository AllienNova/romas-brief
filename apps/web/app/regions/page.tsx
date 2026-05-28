/**
 * ROMAS Brief — Regions index page
 * Lists all 8 regions with article counts and links.
 */
import Link from "next/link";
import { REGION_META, MOCK_ARTICLES, type Region } from "@/lib/mock-data";

export const revalidate = 300;

export const metadata = {
  title: "Browse by Region",
  description: "Radiation oncology intelligence filtered by region — US, Europe, UK, APAC, Canada, LATAM, MENA-Africa, and Global.",
};

export default function RegionsIndexPage() {
  const regions = Object.entries(REGION_META) as [Region, typeof REGION_META[Region]][];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest font-semibold text-teal-600 mb-2">Browse</p>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">By Region</h1>
        <p className="mt-2 text-neutral-500 text-sm max-w-xl">
          Radiation oncology intelligence filtered by geography — regulatory decisions, clinical trials, and practice updates from your region.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {regions.map(([slug, meta]) => {
          const count = MOCK_ARTICLES.filter(
            (a) => a.region === slug || (slug === "global" && a.region === "global")
          ).length;
          return (
            <Link
              key={slug}
              href={`/regions/${slug}`}
              className="group flex items-start gap-4 bg-white rounded-xl border border-neutral-100 hover:border-teal-200 hover:shadow-sm p-5 transition-all"
            >
              <span className="text-3xl leading-none flex-shrink-0">{meta.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-neutral-900 group-hover:text-teal-700 transition-colors">
                    {meta.label}
                  </h2>
                  <span className="text-xs text-neutral-400 tabular-nums">{count} articles</span>
                </div>
                <p className="mt-1 text-xs text-neutral-500 leading-relaxed line-clamp-2">
                  {meta.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
