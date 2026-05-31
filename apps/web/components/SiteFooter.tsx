import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-[var(--rb-bg-raised)] border-t border-[var(--rb-border-subtle)] mt-24">
      <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066CC] to-[#0F766E] flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <div>
                <span className="text-sm font-bold text-[var(--rb-text-primary)]">ROMAS</span>
                <span className="text-sm font-light text-[var(--rb-text-secondary)]"> Brief</span>
              </div>
            </div>
            <p className="text-xs text-[var(--rb-text-secondary)] leading-relaxed mb-4 max-w-xs">
              Clinical intelligence from PubMed, arXiv, ClinicalTrials, and FDA — curated and scored for radiation oncology professionals.
            </p>
            {/* Podcast badges */}
            <div className="flex flex-wrap gap-2">
              <a href="#" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--rb-bg-surface)] border border-[var(--rb-border-subtle)] text-xs font-medium text-[var(--rb-text-secondary)] hover:border-[var(--rb-border-default)] transition-colors">
                🎵 Apple Podcasts
              </a>
              <a href="#" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--rb-bg-surface)] border border-[var(--rb-border-subtle)] text-xs font-medium text-[var(--rb-text-secondary)] hover:border-[var(--rb-border-default)] transition-colors">
                🎧 Spotify
              </a>
            </div>
          </div>

          {/* Topics */}
          <div>
            <h4 className="kicker text-[var(--rb-text-primary)] mb-4">Topics</h4>
            <ul className="space-y-2.5">
              {["AI & ML", "Clinical RT", "Physics", "Regulatory", "Guidelines", "Reimbursement", "Research"].map((t) => (
                <li key={t}>
                  <Link href={`/categories/${t.toLowerCase().replace(/[^a-z0-9]/g, "-")}`} className="text-xs text-[var(--rb-text-secondary)] hover:text-[var(--rb-accent)] transition-colors">
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h4 className="kicker text-[var(--rb-text-primary)] mb-4">Regions</h4>
            <ul className="space-y-2.5">
              {["United States", "Europe", "United Kingdom", "Asia-Pacific", "Canada", "Global"].map((r) => (
                <li key={r}>
                  <Link href={`/regions/${r.toLowerCase().replace(/[^a-z0-9]/g, "-")}`} className="text-xs text-[var(--rb-text-secondary)] hover:text-[var(--rb-accent)] transition-colors">
                    {r}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For You */}
          <div>
            <h4 className="kicker text-[var(--rb-text-primary)] mb-4">For You</h4>
            <ul className="space-y-2.5">
              {["Physicists", "Physicians", "Dosimetrists", "Therapists", "Residents"].map((a) => (
                <li key={a}>
                  <Link href={`/for/${a.toLowerCase()}`} className="text-xs text-[var(--rb-text-secondary)] hover:text-[var(--rb-accent)] transition-colors">
                    {a}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="kicker text-[var(--rb-text-primary)] mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: "About", href: "/about" },
                { label: "Listen", href: "/listen" },
                { label: "Issues Archive", href: "/issues" },
                { label: "Advertise", href: "/advertise" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Use", href: "/terms" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-xs text-[var(--rb-text-secondary)] hover:text-[var(--rb-accent)] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[var(--rb-border-subtle)]">
          <p className="text-xs text-[var(--rb-text-tertiary)]">
            © {new Date().getFullYear()} ROMAS Brief. All rights reserved. For educational purposes only. Not medical advice.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://twitter.com/romasbrief" className="text-xs text-[var(--rb-text-tertiary)] hover:text-[var(--rb-accent)] transition-colors">𝕏 Twitter</a>
            <a href="https://linkedin.com/company/romasbrief" className="text-xs text-[var(--rb-text-tertiary)] hover:text-[var(--rb-accent)] transition-colors">LinkedIn</a>
            <a href="/rss/daily-brief.xml" className="text-xs text-[var(--rb-text-tertiary)] hover:text-[var(--rb-accent)] transition-colors">RSS</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
