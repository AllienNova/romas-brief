/**
 * ROMAS Brief — Issue archive index page (FR-030)
 * /issues — lists all available daily issues
 */
import Link from "next/link";
import { ISSUE_DATES, getArticlesByIssueDate } from "@/lib/mock-data";

export const revalidate = 300;

export const metadata = {
  title: "Issue Archive — ROMAS Brief",
  description: "Browse every daily ROMAS Brief issue — radiation oncology intelligence, archived by date.",
};

export default function IssuesIndexPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest font-semibold text-teal-600 mb-2">Archive</p>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Issue Archive</h1>
        <p className="mt-2 text-neutral-500 text-sm max-w-xl">
          Every daily ROMAS Brief issue, archived. Each issue contains the day&apos;s top briefings, signal-scored and primary-source cited.
        </p>
      </div>

      <div className="space-y-3">
        {ISSUE_DATES.map((date) => {
          const articles = getArticlesByIssueDate(date);
          const d = new Date(date + "T12:00:00Z");
          const label = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
          return (
            <Link
              key={date}
              href={`/issues/${date}`}
              className="group flex items-center justify-between bg-white rounded-xl border border-neutral-100 hover:border-teal-200 hover:shadow-sm px-5 py-4 transition-all"
            >
              <div>
                <p className="text-sm font-bold text-neutral-900 group-hover:text-teal-700 transition-colors">{label}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{articles.length} briefings</p>
              </div>
              <span className="text-neutral-300 group-hover:text-teal-400 transition-colors text-lg">→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
