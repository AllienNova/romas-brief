import type { Metadata } from "next";
import Link from "next/link";
import type { FC } from "react";
import {
  GuidelinesIcon,
  PaperCritiqueIcon,
  HeadphonesIcon,
  RegulatoryIcon,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";

export const metadata: Metadata = {
  title: "About ROMAS",
  description:
    "ROMAS stands for Radiation Oncology Multi-Agentic System — an autonomous AI intelligence platform delivering signal-scored clinical intelligence to radiation oncology professionals daily.",
};

const ROMAS_ACRONYM = [
  {
    letter: "R",
    word: "Radiation",
    color: "#0066CC",
    desc: "The modality. Every insight, every signal, every brief is anchored in the science of therapeutic radiation and its clinical application.",
  },
  {
    letter: "O",
    word: "Oncology",
    color: "#0F766E",
    desc: "The disease. We cover the full spectrum of solid tumours and haematological malignancies treated with radiation therapy, globally.",
  },
  {
    letter: "M",
    word: "Multi-Agentic",
    color: "#7C3AED",
    desc: "The engine. ROMAS deploys a network of specialised AI agents — each trained on a distinct domain — working in parallel to ingest, score, and synthesise the literature.",
  },
  {
    letter: "A",
    word: "Agentic",
    color: "#D97706",
    desc: "The intelligence. Our agents act autonomously — they do not wait to be asked. They monitor PubMed, arXiv, FDA, and ClinicalTrials continuously, 24 hours a day.",
  },
  {
    letter: "S",
    word: "System",
    color: "#DC2626",
    desc: "The architecture. ROMAS is not a newsletter — it is a living, self-improving intelligence system built specifically for the radiation oncology community.",
  },
];

const VALUES: { Icon: FC<IconProps>; title: string; description: string }[] = [
  {
    Icon: GuidelinesIcon,
    title: "Signal Over Noise",
    description:
      "Your time is your most finite resource. We score every piece of evidence across three dimensions—clinical relevance, physics impact, and novelty—and only publish what clears S70. We protect your time by eliminating the noise.",
  },
  {
    Icon: PaperCritiqueIcon,
    title: "Primary-Source Integrity",
    description:
      "Trust requires transparency. Every brief links directly to the primary source—the PubMed abstract, the FDA 510(k) summary, the arXiv preprint. We never summarise a summary. You always know exactly where the evidence came from.",
  },
  {
    Icon: HeadphonesIcon,
    title: "Audio-First Accessibility",
    description:
      "You spend hours in the clinic, in the vault, and in transit. Every high-signal brief is available as a spoken audio summary, so you can stay current without being desk-bound. Intelligence that fits your workflow.",
  },
  {
    Icon: RegulatoryIcon,
    title: "Transparent by Design",
    description:
      "Editorial content and sponsored content are always clearly separated. Our signal scoring is never influenced by commercial relationships — a sponsored item is scored by the same rigorous methodology as any other. Sponsors support the platform; they do not shape the brief. You will always know which is which.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--rb-bg-page)" }}>
      {/* ── Hero: Aspirational & Identity-Driven ───────────────────────── */}
      <section
        className="relative overflow-hidden py-32 px-4"
        style={{ background: "linear-gradient(135deg, #001D3D 0%, #003366 60%, #0F766E 100%)" }}
      >
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 text-xs font-bold uppercase tracking-widest shadow-lg"
            style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
            The ROMAS Standard
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-8"
            style={{ letterSpacing: "-0.03em", lineHeight: "1.05" }}>
            For the professionals who <br className="hidden sm:block" />
            <span style={{ color: "#5EEAD4" }}>refuse to fall behind.</span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed font-medium">
            You make decisions that alter the course of human lives. You cannot afford to rely on outdated evidence or press releases. ROMAS is the intelligence engine built for the vanguard of radiation oncology.
          </p>
        </div>
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        
        {/* ── Social Proof / Belonging ─────────────────────────────────── */}
        <div className="rounded-2xl p-8 text-center shadow-xl flex flex-col sm:flex-row items-center justify-center gap-8 mb-24"
          style={{ background: "var(--rb-bg-surface)", border: "1px solid var(--rb-border-subtle)" }}>
          <div className="flex -space-x-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-12 h-12 rounded-full border-2 border-[var(--rb-bg-surface)] bg-gray-200 overflow-hidden relative"
                style={{ background: `linear-gradient(135deg, hsl(${i * 60}, 70%, 60%), hsl(${i * 60 + 40}, 70%, 50%))` }}>
                <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
              </div>
            ))}
          </div>
          <div className="text-left">
            <p className="text-2xl font-black" style={{ color: "var(--rb-text-primary)" }}>Trusted across the field</p>
            <p className="text-sm font-medium" style={{ color: "var(--rb-text-secondary)" }}>Radiation Oncologists, Physicists, and Dosimetrists trust our signal.</p>
          </div>
        </div>

        {/* ── The Acronym Reveal (What is ROMAS?) ──────────────────────── */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <p className="kicker mb-3 font-bold tracking-widest uppercase text-sm" style={{ color: "var(--rb-accent)" }}>The Acronym</p>
            <h2 className="text-4xl font-black" style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.025em" }}>
              What does ROMAS stand for?
            </h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: "var(--rb-text-secondary)" }}>
              <strong style={{ color: "var(--rb-text-primary)" }}>Radiation Oncology Multi-Agentic System.</strong> Not a newsletter. Not a digest. An autonomous AI intelligence system built from the ground up for radiation oncology professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {ROMAS_ACRONYM.map((item, i) => (
              <div key={item.letter} className="rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                style={{ background: "var(--rb-bg-surface)", border: "1px solid var(--rb-border-subtle)", boxShadow: "var(--rb-shadow-sm)" }}>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150"
                  style={{ background: item.color }}></div>
                <div className="text-5xl font-black mb-4 transition-colors duration-300" style={{ color: item.color }}>
                  {item.letter}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--rb-text-primary)" }}>{item.word}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--rb-text-secondary)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── The Problem & The Solution (Psychological Contrast) ──────── */}
        <section className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.02em" }}>
              The literature is drowning you. <br/>
              <span style={{ color: "var(--rb-accent)" }}>We are the lifeboat.</span>
            </h2>
            <p className="text-lg leading-relaxed mb-6" style={{ color: "var(--rb-text-secondary)" }}>
              Over 4,000 oncology papers are published every month. FDA clearances happen weekly. Guidelines shift quietly. You cannot read it all, but missing a critical practice delta is not an option.
            </p>
            <p className="text-lg leading-relaxed font-medium" style={{ color: "var(--rb-text-primary)" }}>
              ROMAS Brief acts as your personal intelligence agency. We ingest the noise, apply our rigorous scoring algorithm, and deliver only the pure, practice-changing signal.
            </p>
          </div>
          <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background: "var(--rb-bg-raised)", border: "1px solid var(--rb-border-subtle)", boxShadow: "var(--rb-shadow-lg)" }}>
             <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg, #0066CC, #0F766E, #7C3AED)" }}></div>
             <h3 className="text-xl font-bold mb-6 text-center" style={{ color: "var(--rb-text-primary)" }}>The ROMAS Signal Filter</h3>
             
             <div className="space-y-4 relative">
               {/* Funnel visual */}
               <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                 <p className="text-sm font-bold text-[var(--rb-text-tertiary)] dark:text-[var(--rb-text-tertiary)] uppercase tracking-wide">4,000+ Monthly Publications</p>
               </div>
               <div className="flex justify-center"><div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600"></div></div>
               <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700 mx-8">
                 <p className="text-sm font-bold text-[var(--rb-text-secondary)] dark:text-[var(--rb-text-tertiary)] uppercase tracking-wide">Algorithmic Triage</p>
               </div>
               <div className="flex justify-center"><div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600"></div></div>
               <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700 mx-16">
                 <p className="text-sm font-bold text-[var(--rb-text-secondary)] dark:text-[var(--rb-text-tertiary)] uppercase tracking-wide">Expert Scoring (C, P, N)</p>
               </div>
               <div className="flex justify-center"><div className="w-1 h-8" style={{ background: "linear-gradient(180deg, var(--rb-border-subtle), var(--rb-accent))" }}></div></div>
               <div className="rounded-xl p-5 text-center shadow-md transform scale-105" style={{ background: "var(--rb-accent)", color: "white" }}>
                 <p className="text-base font-black uppercase tracking-widest mb-1">The Daily Brief</p>
                 <p className="text-xs font-medium opacity-90">Only items scoring S70+ reach your inbox</p>
               </div>
             </div>
          </div>
        </section>

        {/* ── Values ───────────────────────────────────────────────────── */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.025em" }}>The Code We Operate By</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {VALUES.map(({ Icon, title, description }) => (
              <div key={title} className="rounded-2xl p-8 group hover:shadow-xl transition-all duration-300"
                style={{ background: "var(--rb-bg-surface)", border: "1px solid var(--rb-border-subtle)" }}>
                <span className="mb-6 block transform group-hover:scale-110 transition-transform origin-left" style={{ color: "var(--rb-accent)" }}><Icon size={36} /></span>
                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--rb-text-primary)" }}>{title}</h3>
                <p className="text-base leading-relaxed" style={{ color: "var(--rb-text-secondary)" }}>{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA: Aspirational Identity ───────────────────────────────── */}
        <section className="pb-32">
          <div className="rounded-3xl p-12 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #001D3D 0%, #003366 100%)", boxShadow: "var(--rb-shadow-xl)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#5EEAD4] opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6" style={{ letterSpacing: "-0.025em", lineHeight: "1.1" }}>
                Claim your intellectual advantage.
              </h2>
              <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto font-medium">
                Join the clinicians and physicists who start their day with clarity, not clutter. Free forever. No spam, ever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://romasbrief.beehiiv.com/subscribe" target="_blank" rel="noopener noreferrer"
                  className="btn-primary px-10 py-4 text-base font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                  Subscribe Free — Takes 30 Seconds
                </a>
                <Link href="/about/how-it-works"
                  className="px-10 py-4 rounded-xl text-base font-bold transition-all text-white hover:bg-white/10 border border-white/20 hover:border-white/40">
                  Read the Methodology
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
