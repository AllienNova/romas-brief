"use client";

/**
 * SiteHeader — Section-aware sticky header
 * - Topics mega-menu dropdown (3-column grid)
 * - Regions dropdown
 * - For-You audience dropdown
 * - Cmd-K / Ctrl-K search modal
 * - Dark mode toggle
 * - Subscribe CTA
 * - Mobile hamburger with full-screen nav
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DarkModeToggle from "./DarkModeToggle";
import {
  AiIcon,
  ClinicalRtIcon,
  PhysicsIcon,
  RegulatoryIcon,
  GuidelinesIcon,
  ReimbursementIcon,
  VendorIcon,
  ConferencesIcon,
  OperationsIcon,
  GlobeIcon,
  PhysicianIcon,
  DosimetristIcon,
  TherapistIcon,
  PrimerIcon,
  AdministratorIcon,
} from "./icons";

// ── Data ──────────────────────────────────────────────────────────────────

type TopicItem = { href: string; label: string; Icon: React.FC<{ size?: number; className?: string }>; desc: string };
type RegionItem = { href: string; label: string };
type AudienceItem = { href: string; label: string; Icon: React.FC<{ size?: number; className?: string }> };

const TOPICS: TopicItem[] = [
  { href: "/categories/ai", label: "AI & Machine Learning", Icon: AiIcon, desc: "LLM, auto-contouring, adaptive planning" },
  { href: "/categories/clinical-rt", label: "Clinical RT", Icon: ClinicalRtIcon, desc: "Trials, outcomes, technique updates" },
  { href: "/categories/physics", label: "Medical Physics", Icon: PhysicsIcon, desc: "QA, dosimetry, beam modelling" },
  { href: "/categories/regulatory", label: "Regulatory", Icon: RegulatoryIcon, desc: "FDA clearances, CE marks, recalls" },
  { href: "/categories/guidelines", label: "Guidelines", Icon: GuidelinesIcon, desc: "ASTRO, ESTRO, NCCN updates" },
  { href: "/categories/reimbursement", label: "Reimbursement", Icon: ReimbursementIcon, desc: "CMS, CPT codes, payer policy" },
  { href: "/categories/vendor", label: "Vendor News", Icon: VendorIcon, desc: "Product launches, acquisitions" },
  { href: "/categories/conferences", label: "Conferences", Icon: ConferencesIcon, desc: "ASTRO, ESTRO, AAPM highlights" },
  { href: "/categories/operations", label: "Operations", Icon: OperationsIcon, desc: "Workflow, staffing, industry moves" },
];

const REGIONS: RegionItem[] = [
  { href: "/regions/us", label: "United States" },
  { href: "/regions/europe", label: "Europe" },
  { href: "/regions/uk", label: "United Kingdom" },
  { href: "/regions/apac", label: "Asia-Pacific" },
  { href: "/regions/canada", label: "Canada" },
  { href: "/regions/latam", label: "Latin America" },
];

const AUDIENCE: AudienceItem[] = [
  { href: "/for/physicians", label: "Radiation Oncologists", Icon: PhysicianIcon },
  { href: "/for/physicists", label: "Medical Physicists", Icon: PhysicsIcon },
  { href: "/for/dosimetrists", label: "Dosimetrists", Icon: DosimetristIcon },
  { href: "/for/therapists", label: "Radiation Therapists", Icon: TherapistIcon },
  { href: "/for/residents", label: "Residents & Fellows", Icon: PrimerIcon },
  { href: "/for/administrators", label: "Administrators", Icon: AdministratorIcon },
];

const MOCK_SEARCH_RESULTS = [
  { slug: "adaptive-rt-ai-2026", title: "AI-Driven Adaptive RT Reduces Contouring Time by 60%", category: "AI" },
  { slug: "sbrt-liver-outcomes", title: "SBRT Liver Outcomes: 5-Year Multi-Centre Analysis", category: "Clinical RT" },
  { slug: "mr-linac-physics-qa", title: "MR-Linac QA Protocol — AAPM Task Group Report", category: "Physics" },
  { slug: "fda-clears-ethos-2", title: "FDA Clears Varian Ethos 2.0 for Adaptive Prostate RT", category: "Regulatory" },
  { slug: "cms-sbrt-reimbursement", title: "CMS Proposes 12% SBRT Reimbursement Increase for 2027", category: "Reimbursement" },
];

type DropdownId = "topics" | "regions" | "audience" | null;

// ── Component ─────────────────────────────────────────────────────────────

export default function SiteHeader() {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<DropdownId>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setActiveDropdown(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const openDropdown = useCallback((id: DropdownId) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setActiveDropdown(id);
  }, []);

  const closeDropdown = useCallback(() => {
    dropdownTimerRef.current = setTimeout(() => setActiveDropdown(null), 120);
  }, []);

  const keepDropdown = useCallback(() => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
  }, []);

  const searchResults = searchQuery.length > 1
    ? MOCK_SEARCH_RESULTS.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_SEARCH_RESULTS.slice(0, 3);

  return (
    <>
      <header
        className="nav-sticky"
        style={{
          boxShadow: scrolled ? "var(--rb-shadow-md)" : "none",
          transition: "box-shadow 0.2s ease",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group" aria-label="ROMAS Brief — Home">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--rb-accent)] to-[#0F766E] flex items-center justify-center shadow-apple-sm group-hover:shadow-apple-md transition-shadow">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-black text-lg tracking-tight" style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.03em" }}>
                ROMAS<span style={{ color: "var(--rb-accent)" }}>Brief</span>
              </span>
            </Link>

            {/* Primary nav — desktop */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary navigation">
              <Link
                href="/"
                className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-[var(--rb-bg-raised)]"
                style={{ color: pathname === "/" ? "var(--rb-accent)" : "var(--rb-text-secondary)" }}
              >
                Home
              </Link>

              {/* Topics */}
              <div className="relative" onMouseEnter={() => openDropdown("topics")} onMouseLeave={closeDropdown}>
                <button
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-[var(--rb-bg-raised)]"
                  style={{ color: "var(--rb-text-secondary)" }}
                  aria-expanded={activeDropdown === "topics"}
                  aria-haspopup="true"
                  onClick={() => setActiveDropdown(activeDropdown === "topics" ? null : "topics")}
                >
                  Topics
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "topics" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === "topics" && (
                  <div
                    className="absolute top-full left-0 mt-1 w-[500px] rounded-2xl border overflow-hidden z-50"
                    style={{ background: "var(--rb-bg-surface)", borderColor: "var(--rb-border-subtle)", boxShadow: "var(--rb-shadow-xl)" }}
                    onMouseEnter={keepDropdown}
                    onMouseLeave={closeDropdown}
                  >
                    <div className="p-3 grid grid-cols-3 gap-1">
                      {TOPICS.map(({ href, label, Icon, desc }) => (
                        <Link key={href} href={href} className="flex flex-col gap-0.5 p-3 rounded-xl transition-colors hover:bg-[var(--rb-bg-raised)] group">
                          <span className="mb-0.5" style={{ color: "var(--rb-text-secondary)" }}><Icon size={18} /></span>
                          <span className="text-xs font-semibold group-hover:text-[var(--rb-accent)] transition-colors" style={{ color: "var(--rb-text-primary)" }}>{label}</span>
                          <span className="text-xs leading-snug" style={{ color: "var(--rb-text-tertiary)" }}>{desc}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t px-4 py-3 flex items-center justify-between" style={{ borderColor: "var(--rb-border-subtle)", background: "var(--rb-bg-raised)" }}>
                      <span className="text-xs" style={{ color: "var(--rb-text-tertiary)" }}>9 topic categories</span>
                      <Link href="/categories" className="text-xs font-semibold" style={{ color: "var(--rb-accent)" }}>Browse all →</Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Regions */}
              <div className="relative" onMouseEnter={() => openDropdown("regions")} onMouseLeave={closeDropdown}>
                <button
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-[var(--rb-bg-raised)]"
                  style={{ color: "var(--rb-text-secondary)" }}
                  aria-expanded={activeDropdown === "regions"}
                  aria-haspopup="true"
                  onClick={() => setActiveDropdown(activeDropdown === "regions" ? null : "regions")}
                >
                  Regions
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "regions" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === "regions" && (
                  <div
                    className="absolute top-full left-0 mt-1 w-52 rounded-2xl border overflow-hidden z-50"
                    style={{ background: "var(--rb-bg-surface)", borderColor: "var(--rb-border-subtle)", boxShadow: "var(--rb-shadow-xl)" }}
                    onMouseEnter={keepDropdown}
                    onMouseLeave={closeDropdown}
                  >
                    <div className="p-2">
                      {REGIONS.map(({ href, label }) => (
                        <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-[var(--rb-bg-raised)] group">
                          <span style={{ color: "var(--rb-text-secondary)" }}><GlobeIcon size={16} /></span>
                          <span className="text-sm font-medium group-hover:text-[var(--rb-accent)] transition-colors" style={{ color: "var(--rb-text-primary)" }}>{label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* For You */}
              <div className="relative" onMouseEnter={() => openDropdown("audience")} onMouseLeave={closeDropdown}>
                <button
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-[var(--rb-bg-raised)]"
                  style={{ color: "var(--rb-text-secondary)" }}
                  aria-expanded={activeDropdown === "audience"}
                  aria-haspopup="true"
                  onClick={() => setActiveDropdown(activeDropdown === "audience" ? null : "audience")}
                >
                  For You
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "audience" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === "audience" && (
                  <div
                    className="absolute top-full left-0 mt-1 w-56 rounded-2xl border overflow-hidden z-50"
                    style={{ background: "var(--rb-bg-surface)", borderColor: "var(--rb-border-subtle)", boxShadow: "var(--rb-shadow-xl)" }}
                    onMouseEnter={keepDropdown}
                    onMouseLeave={closeDropdown}
                  >
                    <div className="p-2">
                      {AUDIENCE.map(({ href, label, Icon }) => (
                        <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-[var(--rb-bg-raised)] group">
                          <span style={{ color: "var(--rb-text-secondary)" }}><Icon size={16} /></span>
                          <span className="text-sm font-medium group-hover:text-[var(--rb-accent)] transition-colors" style={{ color: "var(--rb-text-primary)" }}>{label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/listen" className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-[var(--rb-bg-raised)]" style={{ color: pathname === "/listen" ? "var(--rb-accent)" : "var(--rb-text-secondary)" }}>
                Listen
              </Link>
              <Link href="/issues" className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-[var(--rb-bg-raised)]" style={{ color: pathname === "/issues" ? "var(--rb-accent)" : "var(--rb-text-secondary)" }}>
                Archive
              </Link>
            </nav>

            {/* Right cluster */}
            <div className="flex items-center gap-2">
              {/* Search Cmd-K button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all hover:bg-[var(--rb-bg-raised)]"
                style={{ borderColor: "var(--rb-border-default)", color: "var(--rb-text-tertiary)" }}
                aria-label="Open search (Cmd+K)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-xs hidden lg:inline">Search</span>
                <kbd className="hidden lg:inline text-xs px-1.5 py-0.5 rounded border font-mono" style={{ borderColor: "var(--rb-border-default)", background: "var(--rb-bg-raised)" }}>⌘K</kbd>
              </button>

              <DarkModeToggle />

              <a
                href="https://romasbrief.beehiiv.com/subscribe"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs px-4 py-2 hidden sm:inline-flex"
                aria-label="Subscribe to ROMAS Brief free"
              >
                Subscribe Free
              </a>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-xl transition-colors hover:bg-[var(--rb-bg-raised)]"
                style={{ color: "var(--rb-text-secondary)" }}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile scroll row (when hamburger closed) */}
          {!mobileOpen && (
            <nav className="lg:hidden flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide" aria-label="Mobile quick links">
              {[
                { href: "/categories", label: "Topics" },
                { href: "/regions", label: "Regions" },
                { href: "/listen", label: "Listen" },
                { href: "/issues", label: "Archive" },
                { href: "/for/physicists", label: "Physicists" },
                { href: "/for/physicians", label: "Physicians" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium transition-all" style={{ borderColor: "var(--rb-border-default)", color: "var(--rb-text-secondary)" }}>
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Mobile full nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t" style={{ background: "var(--rb-bg-surface)", borderColor: "var(--rb-border-subtle)" }}>
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
              <button
                onClick={() => { setSearchOpen(true); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
                style={{ borderColor: "var(--rb-border-default)", color: "var(--rb-text-secondary)", background: "var(--rb-bg-raised)" }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search ROMAS Brief…
              </button>
              <div>
                <p className="kicker mb-3" style={{ color: "var(--rb-text-tertiary)" }}>Topics</p>
                <div className="grid grid-cols-2 gap-2">
                  {TOPICS.slice(0, 6).map(({ href, label, Icon }) => (
                    <Link key={href} href={href} className="flex items-center gap-2 p-3 rounded-xl border transition-colors hover:bg-[var(--rb-bg-raised)]" style={{ borderColor: "var(--rb-border-subtle)", background: "var(--rb-bg-surface)" }}>
                      <span style={{ color: "var(--rb-text-secondary)" }}><Icon size={16} /></span>
                      <span className="text-sm font-medium" style={{ color: "var(--rb-text-primary)" }}>{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="kicker mb-3" style={{ color: "var(--rb-text-tertiary)" }}>For You</p>
                <div className="grid grid-cols-2 gap-2">
                  {AUDIENCE.map(({ href, label, Icon }) => (
                    <Link key={href} href={href} className="flex items-center gap-2 p-3 rounded-xl border transition-colors hover:bg-[var(--rb-bg-raised)]" style={{ borderColor: "var(--rb-border-subtle)", background: "var(--rb-bg-surface)" }}>
                      <span style={{ color: "var(--rb-text-secondary)" }}><Icon size={16} /></span>
                      <span className="text-sm font-medium" style={{ color: "var(--rb-text-primary)" }}>{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <a href="https://romasbrief.beehiiv.com/subscribe" target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center py-3 text-sm font-semibold block">
                Subscribe Free — takes 30 seconds
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── Cmd-K Search Modal ──────────────────────────────────────────── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="Search ROMAS Brief"
        >
          <div
            className="w-full max-w-xl rounded-2xl overflow-hidden"
            style={{ background: "var(--rb-bg-surface)", boxShadow: "var(--rb-shadow-xl)", border: "1px solid var(--rb-border-subtle)" }}
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "var(--rb-border-subtle)" }}>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--rb-text-tertiary)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search articles, topics, authors…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-base outline-none"
                style={{ color: "var(--rb-text-primary)" }}
                aria-label="Search query"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="flex-shrink-0 px-2 py-1 rounded-lg text-xs font-mono transition-colors hover:bg-[var(--rb-bg-raised)]"
                style={{ color: "var(--rb-text-tertiary)", border: "1px solid var(--rb-border-default)" }}
                aria-label="Close search"
              >
                Esc
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="p-2">
                  {!searchQuery && (
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--rb-text-tertiary)" }}>Recent articles</p>
                  )}
                  {searchResults.map((result) => (
                    <Link
                      key={result.slug}
                      href={`/article/${result.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-start gap-3 px-3 py-3 rounded-xl transition-colors hover:bg-[var(--rb-bg-raised)] group"
                    >
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--rb-text-tertiary)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1 group-hover:text-[var(--rb-accent)] transition-colors" style={{ color: "var(--rb-text-primary)" }}>{result.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--rb-text-tertiary)" }}>{result.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm" style={{ color: "var(--rb-text-tertiary)" }}>No results for &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-xs mt-1" style={{ color: "var(--rb-text-tertiary)" }}>Try a different search term</p>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--rb-border-subtle)", background: "var(--rb-bg-raised)" }}>
              <div className="flex items-center gap-3 text-xs" style={{ color: "var(--rb-text-tertiary)" }}>
                <span>↑↓ navigate</span>
                <span>↵ open</span>
                <span>Esc close</span>
              </div>
              <Link href="/search" onClick={() => setSearchOpen(false)} className="text-xs font-medium" style={{ color: "var(--rb-accent)" }}>
                Full search →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
