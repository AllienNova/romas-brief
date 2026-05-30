import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Academy",
  description:
    "ROMAS Brief Academy — structured learning resources for radiation oncology professionals. Primers, deep dives, physics explainers, and clinical methodology guides.",
};

const FEATURED_COURSES = [
  {
    id: "flash-rt-primer",
    badge: "PRIMER",
    badgeColor: "#0066CC",
    title: "FLASH Radiotherapy: From Bench to Bedside",
    description:
      "A comprehensive primer on ultra-high dose-rate radiotherapy. Covers the FLASH effect mechanism, current clinical trial landscape, dosimetry challenges, and what a radiation oncology department needs to prepare for FLASH implementation.",
    duration: "45 min read",
    modules: 6,
    level: "Intermediate",
    category: "Clinical RT",
    href: "/academy/flash-rt-primer",
    thumbnail: "/thumbnails/flash-rt-proton-clinical-trial-2026.jpg",
  },
  {
    id: "mr-linac-physics",
    badge: "DEEP DIVE",
    badgeColor: "#0F766E",
    title: "MR-Linac Physics: A Practical Guide",
    description:
      "Everything a medical physicist needs to know about MR-Linac commissioning, QA, and adaptive workflow. Covers magnetic field effects on dosimetry, reference dosimetry in magnetic fields, and online adaptive RT protocols.",
    duration: "60 min read",
    modules: 8,
    level: "Advanced",
    category: "Medical Physics",
    href: "/academy/mr-linac-physics",
    thumbnail: "/thumbnails/mr-linac-adaptive-rt-prostate-astro-guideline.jpg",
  },
  {
    id: "ai-contouring-guide",
    badge: "EXPLAINER",
    badgeColor: "#7C3AED",
    title: "AI Auto-Contouring: A Clinical Physicist's Guide",
    description:
      "How to evaluate, commission, and clinically implement AI-driven auto-contouring tools. Includes a framework for vendor-neutral evaluation, QA metrics, and workflow integration strategies.",
    duration: "35 min read",
    modules: 5,
    level: "Intermediate",
    category: "AI & Technology",
    href: "/academy/ai-contouring-guide",
    thumbnail: "/thumbnails/ai-auto-contouring-head-neck-fda-clearance.jpg",
  },
  {
    id: "sbrt-dosimetry",
    badge: "PRIMER",
    badgeColor: "#D97706",
    title: "SBRT Dosimetry: Small Fields and High Stakes",
    description:
      "A practical guide to small-field dosimetry for SBRT and SRS. Covers detector selection, output factor measurement, TRS-483 implementation, and common pitfalls in stereotactic dosimetry.",
    duration: "50 min read",
    modules: 7,
    level: "Advanced",
    category: "Medical Physics",
    href: "/academy/sbrt-dosimetry",
    thumbnail: "/thumbnails/cms-reimbursement-sbrt-lung-2026.jpg",
  },
];

const QUICK_READS = [
  { title: "Understanding the ROMAS Signal Score", category: "Methodology", time: "5 min", href: "/about/how-it-works" },
  { title: "ASTRO MR-Linac Guideline: Key Takeaways", category: "Guidelines", time: "8 min", href: "/academy/astro-mr-linac-summary" },
  { title: "CMS 2026 SBRT Reimbursement Changes Explained", category: "Reimbursement", time: "6 min", href: "/academy/cms-sbrt-2026" },
  { title: "DeepSeek-R2 for RT Planning: What Physicists Need to Know", category: "AI", time: "10 min", href: "/academy/deepseek-r2-rt" },
  { title: "AAPM TG-302: Small-Field Dosimetry Reference Data", category: "Physics", time: "12 min", href: "/academy/tg-302-summary" },
  { title: "Paediatric Proton Therapy: 15-Year Evidence Summary", category: "Clinical RT", time: "9 min", href: "/academy/paediatric-proton-summary" },
];

const CATEGORIES = [
  { icon: "⚕️", label: "Clinical RT", count: 24, href: "/academy/clinical-rt", color: "#0066CC" },
  { icon: "⚛️", label: "Medical Physics", count: 31, href: "/academy/physics", color: "#0F766E" },
  { icon: "🤖", label: "AI & Technology", count: 18, href: "/academy/ai", color: "#7C3AED" },
  { icon: "🏛", label: "Regulatory", count: 12, href: "/academy/regulatory", color: "#D97706" },
  { icon: "📋", label: "Guidelines", count: 15, href: "/academy/guidelines", color: "#DC2626" },
  { icon: "💰", label: "Reimbursement", count: 8, href: "/academy/reimbursement", color: "#059669" },
];

export default function AcademyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 px-4"
        style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #0F766E 100%)" }}
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            🎓 ROMAS Brief Academy
          </div>
          <h1
            className="text-4xl sm:text-5xl font-black text-white mb-6"
            style={{ letterSpacing: "-0.03em", lineHeight: "1.1" }}
          >
            Learn deeper.<br />
            <span style={{ color: "#A5F3FC" }}>Practice smarter.</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed mb-8">
            Structured primers, deep dives, and clinical explainers — built for radiation oncology professionals who want to go beyond the headline.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#courses"
              className="btn-primary px-8 py-3 text-sm font-bold"
            >
              Browse Courses
            </a>
            <a
              href="https://romasbrief.beehiiv.com/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 transition-colors"
            >
              Subscribe for full access →
            </a>
          </div>
        </div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle at 30% 70%, white 1px, transparent 1px), radial-gradient(circle at 70% 30%, white 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Category Grid ─────────────────────────────────────────────── */}
        <section className="py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Browse by Topic
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(({ icon, label, count, href, color }) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl p-4 text-center group hover:scale-105 transition-transform"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mx-auto mb-3"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  {icon}
                </div>
                <p className="text-xs font-bold mb-1 group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-primary)" }}>
                  {label}
                </p>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{count} resources</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured Courses ──────────────────────────────────────────── */}
        <section id="courses" className="pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="kicker mb-1" style={{ color: "var(--text-tertiary)" }}>Featured</p>
              <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)", letterSpacing: "-0.025em" }}>
                In-Depth Learning
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURED_COURSES.map((course) => (
              <Link
                key={course.id}
                href={course.href}
                className="group rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
              >
                {/* Thumbnail */}
                <div
                  className="h-44 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${course.badgeColor}22 0%, ${course.badgeColor}08 100%)`,
                  }}
                >
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
                  <span
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: course.badgeColor }}
                  >
                    {course.badge}
                  </span>
                  <span
                    className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                  >
                    {course.level}
                  </span>
                </div>
                {/* Content */}
                <div className="p-5">
                  <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: course.badgeColor }}>
                    {course.category}
                  </p>
                  <h3 className="text-base font-bold mb-2 group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-primary)" }}>
                    {course.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-tertiary)" }}>
                    <span>📖 {course.duration}</span>
                    <span>📚 {course.modules} modules</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Quick Reads ───────────────────────────────────────────────── */}
        <section className="pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="kicker mb-1" style={{ color: "var(--text-tertiary)" }}>Quick Reads</p>
              <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)", letterSpacing: "-0.025em" }}>
                5–12 Minute Explainers
              </h2>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
            {QUICK_READS.map(({ title, category, time, href }, i) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between px-6 py-4 group hover:bg-[var(--bg-raised)] transition-colors"
                style={{ borderBottom: i < QUICK_READS.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded"
                    style={{ background: "var(--bg-raised)", color: "var(--text-tertiary)", border: "1px solid var(--border-subtle)" }}
                  >
                    {category}
                  </span>
                  <span className="text-sm font-medium group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-primary)" }}>
                    {title}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>⏱ {time}</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: "var(--text-tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Subscribe CTA ─────────────────────────────────────────────── */}
        <section className="pb-20">
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)", boxShadow: "var(--shadow-xl)" }}
          >
            <div className="text-4xl mb-4">🎓</div>
            <h2 className="text-2xl font-black text-white mb-3" style={{ letterSpacing: "-0.025em" }}>
              Full Academy access is free
            </h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto">
              Subscribe to ROMAS Brief and unlock all Academy content — primers, deep dives, and explainers — delivered alongside your daily brief.
            </p>
            <a
              href="https://romasbrief.beehiiv.com/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-8 py-3 text-sm font-bold inline-flex"
            >
              Subscribe Free — Unlock Academy
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
