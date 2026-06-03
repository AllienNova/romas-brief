/**
 * ROMAS Wire — /design-preview (WEB-1)
 * Motion-direction APPROVAL prototype. Not indexed, not linked from nav.
 * Demonstrates the elevated vocabulary before the full reader sweep (WEB-2/3):
 * cinematic hero entrance, scroll reveals, staggered card grid, and the
 * animated six-axis signal-score radar. All motion via the WEB-0 primitives
 * (reduced-motion-safe, CLS-safe). Calm/editorial per the design docs — the
 * "stunning" is typography + space + motion, not loud gradients.
 */
import Link from "next/link";
import { MOCK_ARTICLES, type MockArticle } from "@/lib/mock-data";
import { FadeIn, Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { SignalScoreRadar, type RadarAxis } from "@/components/dataviz/SignalScoreRadar";
import { SignalBar } from "@/components/dataviz/SignalBar";
import { CompositeScoreRing } from "@/components/dataviz/CompositeScoreRing";

export const metadata = {
  title: "Design Preview",
  robots: { index: false, follow: false },
};

const SAMPLE: MockArticle[] = MOCK_ARTICLES.slice(0, 6);

const RADAR: RadarAxis[] = [
  { label: "Clinical", value: 0.92 },
  { label: "AI", value: 0.74 },
  { label: "Physics", value: 0.61 },
  { label: "Operational", value: 0.55 },
  { label: "Novelty", value: 0.83 },
  { label: "Confidence", value: 0.9 },
];

function PreviewCard({ a }: { a: MockArticle }) {
  return (
    <Link
      href="#"
      className="group block h-full rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "var(--rb-bg-surface)",
        borderColor: "var(--rb-border-subtle)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--rb-accent)" }}>
          {a.category}
        </span>
        <span
          className="ml-auto rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums"
          style={{ background: "var(--rb-accent-subtle)", color: "var(--rb-accent)" }}
        >
          S{a.composite_score}
        </span>
      </div>
      <h3
        className="text-lg font-bold leading-snug transition-colors duration-200 group-hover:text-[var(--rb-accent)]"
        style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.02em" }}
      >
        {a.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed line-clamp-3" style={{ color: "var(--rb-text-secondary)" }}>
        {a.standfirst}
      </p>
    </Link>
  );
}

export default function DesignPreviewPage() {
  return (
    <div style={{ background: "var(--rb-bg-page)" }}>
      {/* ── Cinematic hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* soft teal glow — calm, not Web3 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--rb-accent) 14%, transparent) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-content px-6 py-24 sm:py-32 text-center">
          <FadeIn>
            <span
              className="inline-block rounded-full border px-3 py-1 text-xs font-semibold tracking-wide"
              style={{ borderColor: "var(--rb-border-default)", color: "var(--rb-text-tertiary)" }}
            >
              Design preview · motion direction
            </span>
          </FadeIn>
          <FadeIn delay={0.08} y={24}>
            <h1
              className="mx-auto mt-6 max-w-3xl text-5xl font-black leading-[1.05] sm:text-7xl"
              style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.04em" }}
            >
              Radiation oncology, decoded daily.
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed" style={{ color: "var(--rb-text-secondary)" }}>
              Signal-scored clinical intelligence — verified to primary source, audio-first,
              built for the people who run the clinic.
            </p>
          </FadeIn>
          <FadeIn delay={0.24}>
            <div className="mt-9 flex items-center justify-center gap-3">
              <span
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white"
                style={{ background: "var(--rb-accent)" }}
              >
                Read today&apos;s brief
              </span>
              <span
                className="rounded-xl border px-6 py-3 text-sm font-semibold"
                style={{ borderColor: "var(--rb-border-default)", color: "var(--rb-text-primary)" }}
              >
                Listen
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Signal intelligence (animated data-viz) ─────────────────── */}
      <section className="mx-auto max-w-content px-6 py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Reveal>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--rb-accent)" }}>
                The triage layer
              </span>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl" style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.03em" }}>
                Every item, scored on six axes.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed" style={{ color: "var(--rb-text-secondary)" }}>
                Clinical impact, AI relevance, physics depth, operational weight, novelty,
                and confidence — composited into one signal score so you read what matters first.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex justify-center">
              <SignalScoreRadar data={RADAR} size={320} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Score primitives (animated bars + composite ring) ───────── */}
      <section className="mx-auto max-w-content px-6 pb-8">
        <Reveal>
          <h2 className="mb-8 text-2xl font-black" style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.02em" }}>
            Score primitives
          </h2>
        </Reveal>
        <div
          className="grid items-center gap-10 rounded-2xl border p-8 md:grid-cols-[1fr_auto]"
          style={{ background: "var(--rb-bg-surface)", borderColor: "var(--rb-border-subtle)" }}
        >
          <Reveal className="space-y-3">
            {RADAR.map((axis, i) => (
              <SignalBar key={axis.label} label={axis.label} value={axis.value} delay={i * 0.06} />
            ))}
          </Reveal>
          <Reveal delay={0.15} className="flex justify-center">
            <CompositeScoreRing score={86} label="Composite" size={120} />
          </Reveal>
        </div>
      </section>

      {/* ── Staggered card grid ─────────────────────────────────────── */}
      <section className="mx-auto max-w-content px-6 pb-24">
        <Reveal>
          <h2 className="mb-8 text-2xl font-black" style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.02em" }}>
            Today&apos;s signal
          </h2>
        </Reveal>
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE.map((a) => (
            <StaggerItem key={a.slug}>
              <PreviewCard a={a} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  );
}
