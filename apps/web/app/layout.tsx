/**
 * ROMAS Wire — Root Layout
 * Professional, Apple-level header with sticky nav, dark mode, and comprehensive footer.
 */
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import DarkModeToggle from "@/components/DarkModeToggle";
import MobileCTABand from "@/components/MobileCTABand";
import { MicrophoneIcon, NewsBriefIcon, HeadphonesIcon, GlobeIcon } from "@/components/icons";
import { SubscriberCount } from "@/components/SubscriberCount";
import { WebVitals } from "@/components/WebVitals";

export const metadata: Metadata = {
  title: {
    default: "ROMAS Wire — Radiation Oncology Intelligence, Decoded Daily",
    template: "%s · ROMAS Wire",
  },
  description:
    "Signal-scored clinical intelligence for radiation oncology professionals. Daily briefings from PubMed, arXiv, ClinicalTrials, and FDA — with audio.",
  metadataBase: new URL("https://romasbrief.vercel.app"),
  keywords: [
    "radiation oncology", "medical physics", "clinical intelligence",
    "radiation therapy", "oncology news", "PubMed", "arXiv",
    "ClinicalTrials", "FDA", "ROMAS Wire", "FLASH radiotherapy",
    "MR-Linac", "SBRT", "adaptive radiotherapy",
  ],
  authors: [{ name: "ROMAS Wire Editorial Team", url: "https://romasbrief.vercel.app" }],
  creator: "AlienNova Inc.",
  publisher: "AlienNova Inc.",
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    siteName: "ROMAS Wire",
    type: "website",
    locale: "en_US",
    url: "https://romasbrief.vercel.app",
    title: "ROMAS Wire — Radiation Oncology Intelligence, Decoded Daily",
    description: "Signal-scored clinical intelligence for radiation oncology professionals. Daily briefings from PubMed, arXiv, ClinicalTrials, and FDA — with audio.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ROMAS Wire — Radiation Oncology Intelligence" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@romasbrief",
    creator: "@romasbrief",
    title: "ROMAS Wire — Radiation Oncology Intelligence, Decoded Daily",
    description: "Signal-scored clinical intelligence for radiation oncology professionals.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://romasbrief.vercel.app",
    types: {
      "application/rss+xml": [
        { url: "/feeds/daily-brief.xml", title: "ROMAS Wire Daily RSS" },
        { url: "/feeds/podcast.xml", title: "ROMAS Wire Podcast RSS" },
      ],
    },
  },
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Topics" },
  { href: "/regions", label: "Regions" },
  { href: "/listen", label: "Listen" },
  { href: "/issues", label: "Archive" },
  { href: "/academy", label: "Academy" },
  { href: "/about", label: "About" },
] as const;

const AUDIENCE_LINKS = [
  { href: "/for/physicians", label: "Radiation Oncologists" },
  { href: "/for/physicists", label: "Medical Physicists" },
  { href: "/for/dosimetrists", label: "Dosimetrists" },
  { href: "/for/therapists", label: "Radiation Therapists" },
  { href: "/for/residents", label: "Residents & Fellows" },
] as const;

const FOOTER_TOPICS = [
  { href: "/categories/ai", label: "AI & Machine Learning" },
  { href: "/categories/clinical-rt", label: "Clinical RT" },
  { href: "/categories/physics", label: "Medical Physics" },
  { href: "/categories/regulatory", label: "Regulatory" },
  { href: "/categories/guidelines", label: "Guidelines" },
  { href: "/categories/reimbursement", label: "Reimbursement" },
] as const;

const FOOTER_CONTENT_TYPES = [
  { href: "/content-type/news_brief", label: "News Briefs" },
  { href: "/content-type/paper_critique", label: "Paper Critiques" },
  { href: "/content-type/practice_delta", label: "Practice Deltas" },
  { href: "/content-type/fda_brief", label: "FDA Briefs" },
  { href: "/content-type/primer", label: "Primers" },
  { href: "/content-type/long_take", label: "Long Takes" },
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Plausible Analytics — cookieless, GDPR-compliant */}
        <script defer data-domain="romasbrief.com" src="https://plausible.io/js/script.js" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://romasbrief.vercel.app/#website",
                  url: "https://romasbrief.vercel.app",
                  name: "ROMAS Wire",
                  description: "Signal-scored clinical intelligence for radiation oncology professionals.",
                  publisher: { "@id": "https://romasbrief.vercel.app/#organization" },
                  potentialAction: [{
                    "@type": "SearchAction",
                    target: { "@type": "EntryPoint", urlTemplate: "https://romasbrief.vercel.app/search?q={search_term_string}" },
                    "query-input": "required name=search_term_string",
                  }],
                },
                {
                  "@type": "Organization",
                  "@id": "https://romasbrief.vercel.app/#organization",
                  name: "ROMAS Wire",
                  url: "https://romasbrief.vercel.app",
                  logo: { "@type": "ImageObject", url: "https://romasbrief.vercel.app/logo.png", width: 512, height: 512 },
                  sameAs: ["https://twitter.com/romasbrief", "https://linkedin.com/company/romasbrief"],
                  contactPoint: { "@type": "ContactPoint", email: "president@aliennova.com", contactType: "editorial" },
                },
              ],
            }),
          }}
        />
        {/* Dark mode init — prevents FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('romas-theme');if(m==='dark'||(m!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="h-full antialiased" style={{ background: "var(--rb-bg-page)", color: "var(--rb-text-primary)" }}>
        <WebVitals />

        {/* Skip-to-content (WCAG 2.4.1) — first focusable element. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:z-[300] focus:top-3 focus:left-3 focus:px-4 focus:py-2 focus:rounded-lg focus:text-white focus:shadow-lg"
          style={{ background: "var(--rb-accent)" }}
        >
          Skip to content
        </a>

        {/* ── Edition Banner ─────────────────────────────────────────── */}
        <div
          className="text-center py-2 px-4"
          style={{ background: "var(--rb-accent)", color: "white" }}
        >
          <p className="text-xs font-medium tracking-wide" style={{ letterSpacing: "0.01em" }}>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-white/60 mr-2 align-middle"
              style={{ animation: "pulse-dot 2s ease-in-out infinite" }}
            />
            Americas Edition
            <span className="mx-2 opacity-40">·</span>
            <span suppressHydrationWarning>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="mx-2 opacity-40">·</span>
            <Link
              href="/regions/europe"
              className="underline underline-offset-2 hover:no-underline opacity-75 hover:opacity-100 transition-opacity"
            >
              Switch to EU edition →
            </Link>
          </p>
        </div>

        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="nav-sticky">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-[60px] flex items-center justify-between gap-4">

              {/* Logo */}
              <Link
                href="/"
                className="flex items-center gap-2.5 flex-shrink-0 group"
                aria-label="ROMAS Wire — Home"
              >
                {/* Icon mark */}
                <div
                  className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, var(--rb-accent) 0%, var(--rb-teal) 100%)",
                    boxShadow: "0 2px 8px rgba(0,85,204,0.28), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  {/* Radiation / signal icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="2" fill="white" stroke="none"/>
                    <path d="M12 10V3"/>
                    <path d="M12 14v7"/>
                    <path d="M10 12H3"/>
                    <path d="M14 12h7"/>
                    <path d="M10.6 10.6 5.8 5.8"/>
                    <path d="M13.4 13.4l4.8 4.8"/>
                    <path d="M13.4 10.6l4.8-4.8"/>
                    <path d="M10.6 13.4 5.8 18.2"/>
                  </svg>
                </div>
                {/* Wordmark */}
                <div className="flex flex-col leading-none">
                  <span
                    className="font-black text-[17px] tracking-tight"
                    style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.035em", lineHeight: "1" }}
                  >
                    ROMAS<span style={{ color: "var(--rb-accent)" }}>Wire</span>
                  </span>
                  <span
                    className="text-[9px] font-semibold tracking-widest uppercase mt-0.5 hidden sm:block"
                    style={{ color: "var(--rb-text-tertiary)", letterSpacing: "0.14em" }}
                  >
                    Radiation Oncology Intelligence
                  </span>
                </div>
              </Link>

              {/* Primary nav — desktop */}
              <nav className="hidden lg:flex items-center gap-0" aria-label="Primary navigation">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 hover:bg-[var(--rb-bg-raised)] hover:text-[var(--rb-text-primary)]"
                    style={{ color: "var(--rb-text-secondary)" }}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Right cluster */}
              <div className="flex items-center gap-2 flex-shrink-0">

                {/* Audience switcher — "For:" pill */}
                <div
                  className="hidden xl:flex items-center gap-1 px-3 py-1.5 rounded-xl"
                  style={{
                    background: "var(--rb-bg-raised)",
                    border: "1px solid var(--rb-border-subtle)",
                  }}
                >
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest mr-1"
                    style={{ color: "var(--rb-text-tertiary)", letterSpacing: "0.14em" }}
                  >
                    For:
                  </span>
                  {[
                    { href: "/for/physicians", label: "Oncologists" },
                    { href: "/for/physicists", label: "Physicists" },
                    { href: "/for/dosimetrists", label: "Dosimetrists" },
                  ].map(({ href, label }, i, arr) => (
                    <span key={href} className="flex items-center gap-1">
                      <Link
                        href={href}
                        className="text-[11px] font-semibold transition-colors hover:text-[var(--rb-accent)] px-0.5"
                        style={{ color: "var(--rb-text-secondary)" }}
                      >
                        {label}
                      </Link>
                      {i < arr.length - 1 && (
                        <span style={{ color: "var(--rb-border-strong)", fontSize: "9px" }}>·</span>
                      )}
                    </span>
                  ))}
                </div>

                {/* Dark mode toggle */}
                <DarkModeToggle />

                {/* Subscribe CTA */}
                <a
                  href="https://romasbrief.beehiiv.com/subscribe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary hidden sm:inline-flex"
                  style={{ fontSize: "12.5px", padding: "7px 16px" }}
                >
                  Subscribe Free
                </a>
              </div>
            </div>

            {/* Mobile nav scroll row */}
            <nav
              className="lg:hidden flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide"
              aria-label="Mobile navigation"
            >
              {[...NAV_LINKS.slice(1), ...AUDIENCE_LINKS.slice(0, 3)].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    border: "1px solid var(--rb-border-default)",
                    color: "var(--rb-text-secondary)",
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* ── Main content ──────────────────────────────────────────── */}
        <main id="main-content">{children}</main>

        {/* ── Mobile CTA Band ───────────────────────────────────────── */}
        <MobileCTABand />

        {/* ── Footer ────────────────────────────────────────────────── */}
        <footer
          className="mt-20 border-t"
          style={{ borderColor: "var(--rb-border-subtle)", background: "var(--rb-bg-raised)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 mb-12">

              {/* Brand column */}
              <div className="col-span-2 sm:col-span-3 lg:col-span-2">
                <Link href="/" className="flex items-center gap-2.5 mb-4 group">
                  <div
                    className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, var(--rb-accent) 0%, var(--rb-teal) 100%)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="2" fill="white" stroke="none"/>
                      <path d="M12 10V3"/><path d="M12 14v7"/>
                      <path d="M10 12H3"/><path d="M14 12h7"/>
                      <path d="M10.6 10.6 5.8 5.8"/><path d="M13.4 13.4l4.8 4.8"/>
                      <path d="M13.4 10.6l4.8-4.8"/><path d="M10.6 13.4 5.8 18.2"/>
                    </svg>
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="font-black text-base tracking-tight" style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.03em" }}>
                      ROMAS<span style={{ color: "var(--rb-accent)" }}>Wire</span>
                    </span>
                    <span className="text-[9px] font-semibold tracking-widest uppercase mt-0.5" style={{ color: "var(--rb-text-tertiary)", letterSpacing: "0.12em" }}>
                      Radiation Oncology Multi-Agentic System
                    </span>
                  </div>
                </Link>

                <p className="text-sm leading-relaxed mb-2 max-w-xs" style={{ color: "var(--rb-text-secondary)" }}>
                  Signal-scored clinical intelligence for radiation oncology professionals. Primary-source cited. Available in audio.
                </p>
                {/* Subscriber count hidden until 2,500 (CLAUDE.md §3 row 5) — qualitative audience line below threshold. */}
                <SubscriberCount count={0} className="text-xs leading-relaxed mb-5 max-w-xs" />

                {/* RSS feeds */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {([
                    { href: "/feeds/audio-brief.xml", label: "Audio RSS", Icon: MicrophoneIcon },
                    { href: "/feeds/daily-brief.xml", label: "Daily RSS", Icon: NewsBriefIcon },
                    { href: "/feeds/podcast.xml", label: "Podcast", Icon: HeadphonesIcon },
                  ] as const).map(({ href, label, Icon }) => (
                    <a
                      key={href}
                      href={href}
                      className="pill-tag inline-flex items-center gap-1"
                    >
                      <Icon size={12} />
                      {label}
                    </a>
                  ))}
                </div>

                {/* Social */}
                <div className="flex items-center gap-4">
                  <a
                    href="https://twitter.com/romasbrief"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium transition-colors hover:text-[var(--rb-accent)]"
                    style={{ color: "var(--rb-text-tertiary)" }}
                  >
                    𝕏 Twitter
                  </a>
                  <a
                    href="https://linkedin.com/company/romasbrief"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium transition-colors hover:text-[var(--rb-accent)]"
                    style={{ color: "var(--rb-text-tertiary)" }}
                  >
                    LinkedIn
                  </a>
                </div>
              </div>

              {/* Topics */}
              <div>
                <p className="section-label">Topics</p>
                <ul className="space-y-2.5">
                  {FOOTER_TOPICS.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-sm transition-colors hover:text-[var(--rb-accent)]"
                        style={{ color: "var(--rb-text-secondary)" }}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/categories" className="text-sm font-semibold" style={{ color: "var(--rb-accent)" }}>
                      All topics →
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Content types */}
              <div>
                <p className="section-label">Content</p>
                <ul className="space-y-2.5">
                  {FOOTER_CONTENT_TYPES.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-sm transition-colors hover:text-[var(--rb-accent)]"
                        style={{ color: "var(--rb-text-secondary)" }}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Audience + Regions */}
              <div>
                <p className="section-label">For You</p>
                <ul className="space-y-2.5 mb-6">
                  {AUDIENCE_LINKS.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-sm transition-colors hover:text-[var(--rb-accent)]"
                        style={{ color: "var(--rb-text-secondary)" }}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="section-label">Regions</p>
                <ul className="space-y-2">
                  {[
                    { href: "/regions/us", label: "United States" },
                    { href: "/regions/europe", label: "Europe" },
                    { href: "/regions/uk", label: "United Kingdom" },
                    { href: "/regions/apac", label: "Asia-Pacific" },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-sm transition-colors hover:text-[var(--rb-accent)] inline-flex items-center gap-1.5"
                        style={{ color: "var(--rb-text-secondary)" }}
                      >
                        <GlobeIcon size={12} />
                        {label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/regions" className="text-sm font-semibold" style={{ color: "var(--rb-accent)" }}>
                      All regions →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div
              className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ borderColor: "var(--rb-border-subtle)" }}
            >
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-xs" style={{ color: "var(--rb-text-tertiary)" }}>
                  © {new Date().getFullYear()} ROMAS Wire · AlienNova Inc.
                </p>
                <span className="text-xs" style={{ color: "var(--rb-text-tertiary)" }}>
                  Not medical advice. For educational purposes only.
                </span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="mailto:president@aliennova.com"
                  className="text-xs transition-colors hover:text-[var(--rb-accent)]"
                  style={{ color: "var(--rb-text-tertiary)" }}
                >
                  Contact
                </a>
                <Link
                  href="/about"
                  className="text-xs transition-colors hover:text-[var(--rb-accent)]"
                  style={{ color: "var(--rb-text-tertiary)" }}
                >
                  About
                </Link>
                <Link
                  href="/issues"
                  className="text-xs transition-colors hover:text-[var(--rb-accent)]"
                  style={{ color: "var(--rb-text-tertiary)" }}
                >
                  Archive
                </Link>
                <a
                  href="https://romasbrief.beehiiv.com/subscribe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ fontSize: "12px", padding: "7px 16px" }}
                >
                  Subscribe Free →
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
