import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works — ROMAS Brief",
  description:
    "Learn how ROMAS Brief ingests, scores, and curates clinical intelligence from PubMed, arXiv, ClinicalTrials, and FDA for radiation oncology professionals.",
};

const SOURCES = [
  { name: "PubMed / MEDLINE", icon: "📚", desc: "Peer-reviewed clinical and physics literature, filtered to radiation oncology MeSH terms." },
  { name: "arXiv (cs.AI, physics.med-ph)", icon: "🔬", desc: "Pre-print physics and AI papers, often 6–12 months ahead of journal publication." },
  { name: "ClinicalTrials.gov", icon: "🏥", desc: "New trial registrations, status updates, and results postings for RT-related trials." },
  { name: "FDA MAUDE / 510(k) / PMA", icon: "🏛", desc: "Device clearances, adverse event reports, and recall notices for RT equipment." },
  { name: "ASTRO / ESTRO / AAPM", icon: "📋", desc: "Society guideline updates, meeting abstracts, and press releases." },
  { name: "Vendor press releases", icon: "🏭", desc: "Product launches, acquisitions, and regulatory filings from major RT vendors." },
];

const SCORE_DIMS = [
  {
    name: "Clinical Relevance",
    abbr: "C",
    color: "#0066CC",
    max: 40,
    desc: "Does this change how a clinician treats patients today? Weighted by evidence level (RCT > cohort > case series), sample size, and practice impact.",
  },
  {
    name: "Physics Impact",
    abbr: "P",
    color: "#5E5CE6",
    max: 35,
    desc: "Does this affect QA protocols, treatment planning, dosimetry, or equipment selection? Weighted by regulatory status and adoption readiness.",
  },
  {
    name: "Novelty",
    abbr: "N",
    color: "#0F766E",
    max: 25,
    desc: "Is this genuinely new? Penalises incremental updates and rewards first-in-class findings, new indications, and paradigm shifts.",
  },
];

const CONTENT_TYPES = [
  { label: "News Brief", icon: "📰", desc: "2–4 sentence summary of a single development. Signal-scored." },
  { label: "Paper Critique", icon: "🔬", desc: "Structured critique: background, methods, findings, limitations, ROMAS Insight." },
  { label: "Practice Delta", icon: "⚡", desc: "Explicit before/after: what changes in clinical or physics practice." },
  { label: "FDA Brief", icon: "🏛", desc: "Regulatory action with clearance class, indication, and clinical implications." },
  { label: "Primer", icon: "📖", desc: "Background explainer for an emerging topic (e.g., MR-Linac physics, FLASH RT)." },
  { label: "Long Take", icon: "📝", desc: "1,000–2,000 word deep-dive with full methodology and editorial commentary." },
  { label: "Conference Brief", icon: "🎤", desc: "Key abstracts and highlights from ASTRO, ESTRO, AAPM, and RSNA." },
];

export default function HowItWorksPage() {
  return (
    <div style={{ background: "var(--bg-page)" }}>
      {/* Hero */}
      <section
        className="py-16 sm:py-20"
        style={{ background: "linear-gradient(135deg, #001D3D 0%, #001A18 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="kicker text-white/60 mb-4">Methodology</p>
          <h1
            className="text-4xl sm:text-5xl font-black text-white mb-5 text-balance"
            style={{ letterSpacing: "-0.04em" }}
          >
            How ROMAS Brief works
          </h1>
          <p className="text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
            Every item in ROMAS Brief is ingested from primary sources, scored by three independent dimensions,
            and curated by an editorial layer before reaching your inbox or feed.
            Only items above signal threshold <strong className="text-white">S70</strong> are published.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* Step 1 — Ingestion */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg" style={{ background: "var(--accent)" }}>1</div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Ingestion</h2>
          </div>
          <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            ROMAS Brief monitors six primary source categories continuously. New items are ingested within minutes
            of publication and queued for scoring. We do not republish press releases verbatim — every item is
            independently summarised and fact-checked against the primary source.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SOURCES.map(({ name, icon, desc }) => (
              <div
                key={name}
                className="flex items-start gap-4 p-5 rounded-2xl border"
                style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
              >
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{name}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step 2 — Scoring */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg" style={{ background: "#5E5CE6" }}>2</div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Signal Scoring</h2>
          </div>
          <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            Each item receives a composite signal score (S0–S100) derived from three independently weighted dimensions.
            The composite score is the weighted sum: <strong style={{ color: "var(--text-primary)" }}>S = C + P + N</strong>.
            Items below S70 are suppressed. Items above S90 are promoted to the hero carousel.
          </p>
          <div className="space-y-5">
            {SCORE_DIMS.map(({ name, abbr, color, max, desc }) => (
              <div
                key={name}
                className="p-6 rounded-2xl border"
                style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
                      style={{ background: color }}
                    >
                      {abbr}
                    </span>
                    <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{name}</h3>
                  </div>
                  <span className="text-sm font-mono font-bold" style={{ color }}>max {max} pts</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
                <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-raised)" }}>
                  <div className="h-full rounded-full" style={{ width: `${max}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Score legend */}
          <div className="mt-6 p-5 rounded-2xl" style={{ background: "var(--bg-raised)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Score legend</p>
            <div className="flex flex-wrap gap-3">
              {[
                { range: "S90–100", label: "Landmark", color: "#1A7F37", bg: "#DCFCE7" },
                { range: "S80–89", label: "High signal", color: "#1A7F37", bg: "#DCFCE7" },
                { range: "S70–79", label: "Notable", color: "#9A6700", bg: "#FEF9C3" },
                { range: "S60–69", label: "Informational", color: "#9A6700", bg: "#FEF9C3" },
                { range: "S0–59", label: "Suppressed", color: "#CF222E", bg: "#FFE4E6" },
              ].map(({ range, label, color, bg }) => (
                <div key={range} className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: bg }}>
                  <span className="text-xs font-bold font-mono" style={{ color }}>{range}</span>
                  <span className="text-xs" style={{ color }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Step 3 — Content types */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg" style={{ background: "#0F766E" }}>3</div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Content Types</h2>
          </div>
          <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            Each item is assigned a content type that determines its structure, depth, and editorial treatment.
            This helps you quickly calibrate how much time to invest in reading.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CONTENT_TYPES.map(({ label, icon, desc }) => (
              <div
                key={label}
                className="flex items-start gap-4 p-5 rounded-2xl border"
                style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
              >
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{label}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step 4 — Audio */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg" style={{ background: "#FF9F0A" }}>4</div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Audio Intelligence</h2>
          </div>
          <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Items above S80 are automatically converted to a natural-sounding audio brief using ElevenLabs voice synthesis.
            The daily podcast compiles the top 5–8 items into an 8–12 minute briefing, available on Apple Podcasts, Spotify,
            Overcast, and RSS. Audio is generated within 2 hours of the daily editorial cut-off at 06:00 ET.
          </p>
        </section>

        {/* Editorial independence */}
        <section
          className="p-8 rounded-3xl"
          style={{ background: "var(--accent-subtle)", border: "1px solid var(--border-subtle)" }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Editorial independence</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
            ROMAS Brief maintains a strict editorial firewall between commercial content and editorial content.
            Sponsored items are clearly labelled <strong style={{ color: "var(--text-primary)" }}>PARTNER MESSAGE</strong> and
            are never scored by the signal algorithm. Sponsors cannot influence editorial scoring, selection, or framing.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            ROMAS Brief is not a medical device and does not provide clinical advice. All content is for
            educational and informational purposes only. Always consult primary sources and qualified colleagues
            before making clinical or practice decisions.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Ready to start?</h2>
          <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
            Join 4,200+ radiation oncology professionals. Free for qualified clinicians.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://romasbrief.beehiiv.com/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-6 py-3 text-sm font-semibold"
            >
              Subscribe free →
            </a>
            <Link href="/" className="px-6 py-3 rounded-full border text-sm font-medium transition-all hover:bg-[var(--bg-raised)]" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
              Back to home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
