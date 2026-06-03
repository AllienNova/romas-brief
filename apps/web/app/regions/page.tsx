/**
 * ROMAS Wire — Regions index page
 * Lists all 8 regions with article counts and links.
 */
import Link from "next/link";
import { REGION_META, type Region } from "@/lib/mock-data";
import { getArticlesByRegion } from "@/lib/articles";
import { Stagger, StaggerItem } from "@/components/motion/primitives";

export const revalidate = 300;

export const metadata = {
  title: "Browse by Region",
  description: "Radiation oncology intelligence filtered by region — US, Europe, UK, APAC, Canada, LATAM, MENA-Africa, and Global.",
};

export default async function RegionsIndexPage() {
  const regions = Object.entries(REGION_META) as [Region, typeof REGION_META[Region]][];
  const counts = await Promise.all(
    regions.map(async ([slug]) => (await getArticlesByRegion(slug, 200)).length)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest font-semibold text-teal-600 mb-2">Browse</p>
        <h1 className="text-3xl font-black text-[var(--rb-text-primary)] tracking-tight">By Region</h1>
        <p className="mt-2 text-[var(--rb-text-tertiary)] text-sm max-w-xl">
          Radiation oncology intelligence filtered by geography — regulatory decisions, clinical trials, and practice updates from your region.
        </p>
      </div>

      <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {regions.map(([slug, meta], i) => {
          const count = counts[i] ?? 0;
          return (
            <StaggerItem key={slug} className="h-full">
              <Link
                href={`/regions/${slug}`}
                className="group flex items-start gap-4 bg-white rounded-xl border border-[var(--rb-border-subtle)] hover:border-teal-200 hover:shadow-sm p-5 transition-all block h-full"
              >
                <span className="text-3xl leading-none flex-shrink-0">{meta.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-[var(--rb-text-primary)] group-hover:text-teal-700 transition-colors">
                      {meta.label}
                    </h2>
                    <span className="text-xs text-[var(--rb-text-tertiary)] tabular-nums">{count} articles</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--rb-text-tertiary)] leading-relaxed line-clamp-2">
                    {meta.description}
                  </p>
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
