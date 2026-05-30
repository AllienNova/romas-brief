/**
 * ROMAS Brief — Homepage
 * Apple-level visual craft. 8 curated editorial modules.
 * Rotating components: HeroCarousel (above Top Stories), SideStack (side column),
 * QuickHitsRotator (top row only), DismissibleStrip, MobileCTABand.
 */
import Link from "next/link";
import Image from "next/image";
import ArticleCard from "@/components/ArticleCard";
import ConversionWidget from "@/components/ConversionWidget";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";
import SideStack from "@/components/SideStack";
import QuickHitsRotator from "@/components/QuickHitsRotator";
import DismissibleStrip from "@/components/DismissibleStrip";
import FromTheEditor from "@/components/FromTheEditor";
import RotatingTopStories from "@/components/RotatingTopStories";
import type { MockArticle } from "@/lib/mock-data";
import {
  getTopStories,
  getIndustryMoves,
  getPaperOfTheDay,
  getQuickHits,
  getTodaysPodcast,
  getTrendingArticles,
  getTopPapersThisWeek,
  getAudioArticles,
  getArticlesByCategory,
} from "@/lib/articles";

export const dynamic = "force-dynamic";

// ── Helper ────────────────────────────────────────────────────────────────
function SectionHeader({
  label,
  title,
  description,
  href,
  hrefLabel = "View all",
}: {
  label: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-8 gap-4">
      <div>
        <p className="kicker mb-1.5" style={{ color: "var(--text-tertiary)" }}>{label}</p>
        <h2
          className="text-2xl sm:text-3xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="flex-shrink-0 text-sm font-semibold transition-colors hover:opacity-80"
          style={{ color: "var(--accent)" }}
          aria-label={`${hrefLabel} — ${title}`}
        >
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}

// ── Build Hero Carousel slides ────────────────────────────────────────────
function buildCarouselSlides(
  articles: MockArticle[],
  confBrief: MockArticle | undefined,
): HeroSlide[] {
  const slides: HeroSlide[] = [];

  // Slide 1 — Top Move (highest score clinical article)
  const topMove = articles.find((a) => a.category === "clinical-rt" || a.composite_score >= 90);
  if (topMove) {
    slides.push({
      id: "top-move",
      type: "top_move",
      label: "top_move",
      kicker: `${topMove.category.replace(/-/g, " ").toUpperCase()} · S${topMove.composite_score}`,
      title: topMove.title,
      summary: topMove.standfirst,
      href: `/article/${topMove.slug}`,
      cta: "Read brief",
      gradient: "linear-gradient(135deg, #001D3D 0%, #003366 100%)",
      score: topMove.composite_score,
      hasAudio: topMove.has_audio,
    });
  }

  // Slide 2 — Friday Read (long_take or paper_critique)
  const fridayRead = articles.find(
    (a) => a.content_type === "long_take" || a.content_type === "paper_critique"
  );
  if (fridayRead) {
    slides.push({
      id: "friday-read",
      type: "friday_read",
      label: "friday_read",
      kicker: `PAPER CRITIQUE · ${fridayRead.category.replace(/-/g, " ").toUpperCase()}`,
      title: fridayRead.title,
      summary: fridayRead.standfirst,
      href: `/article/${fridayRead.slug}`,
      cta: "Read critique",
      gradient: "linear-gradient(135deg, #001A18 0%, #0F766E 100%)",
      score: fridayRead.composite_score,
      hasAudio: fridayRead.has_audio,
    });
  }

  // Slide 3 — Audio Today (has_audio)
  const audioToday = articles.find((a) => a.has_audio && a !== topMove && a !== fridayRead);
  if (audioToday) {
    slides.push({
      id: "audio-today",
      type: "audio_today",
      label: "audio_today",
      kicker: `AUDIO BRIEF · ${audioToday.category.replace(/-/g, " ").toUpperCase()}`,
      title: audioToday.title,
      summary: audioToday.standfirst,
      href: `/article/${audioToday.slug}`,
      cta: "Listen now",
      gradient: "linear-gradient(135deg, #1A0030 0%, #5E5CE6 100%)",
      score: audioToday.composite_score,
      hasAudio: true,
    });
  }

  // Slide 4 — Conference Brief
  if (confBrief) {
    slides.push({
      id: "conference-brief",
      type: "conference_brief",
      label: "conference_brief",
      kicker: "CONFERENCE BRIEF · ESTRO 2026",
      title: confBrief.title,
      summary: confBrief.standfirst,
      href: `/article/${confBrief.slug}`,
      cta: "See highlights",
      gradient: "linear-gradient(135deg, #1A0A00 0%, #FF9F0A 60%, #FF6961 100%)",
      score: confBrief.composite_score,
      hasAudio: confBrief.has_audio,
    });
  }

  // Slide 5 — Sponsor (editorial firewall)
  slides.push({
    id: "sponsor",
    type: "sponsor",
    label: "sponsor",
    kicker: "PARTNER MESSAGE",
    title: "Adaptive RT Workflow Automation — Varian Ethos",
    summary:
      "Discover how AI-driven adaptive planning can reduce daily contouring time by up to 60% while maintaining dosimetric precision.",
    href: "https://www.varian.com/ethos",
    cta: "Learn more",
    gradient: "linear-gradient(135deg, #1A1A2E 0%, #2D2D44 100%)",
    isSponsor: true,
  });

  return slides;
}

// ── Page ─────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const [
    topStories,
    industryMoves,
    paperOfDay,
    quickHits,
    podcast,
    trending,
    topPapers,
    audioArticles,
    conferenceArticles,
  ] = await Promise.all([
    getTopStories(24), // full pool for RotatingTopStories
    getIndustryMoves(3),
    getPaperOfTheDay(),
    getQuickHits(12),
    getTodaysPodcast(),
    getTrendingArticles(5),
    getTopPapersThisWeek(4),
    getAudioArticles(4),
    getArticlesByCategory("conferences", 1),
  ]);

  // Hero carousel slides
  const carouselSlides = buildCarouselSlides(topStories, conferenceArticles[0]);

  // SideStack pool — top 12 by composite score (topStories is score-ordered)
  const sideStackPool = topStories
    .slice(0, 12)
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      category: a.category,
      score: a.composite_score,
      publishedAt: a.published_at,
      hasAudio: a.has_audio,
      isRomasInsight: !!a.romas_insight,
      region: a.region,
    }));

  // Quick Hits — rotating pool + stable anchors
  const quickHitsPool = quickHits.map((a) => ({
    slug: a.slug,
    title: a.title,
    category: a.category,
    score: a.composite_score,
    publishedAt: a.published_at,
    hasAudio: a.has_audio,
    region: a.region,
  }));
  const rotatingPool = quickHitsPool.slice(0, 8);
  const stableItems = quickHitsPool.slice(1, 5);

  return (
    <div style={{ background: "var(--bg-page)" }}>

      {/* ── Dismissible explanation strip ──────────────────────────── */}
      <DismissibleStrip />

      {/* ── HERO CAROUSEL (above Top Stories) ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <HeroCarousel slides={carouselSlides} />
      </section>

      {/* ── MODULE 1: Top Stories ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
        <SectionHeader
          label="Today's Briefing"
          title="Top Stories"
          description="Clinical intelligence from PubMed, arXiv, ClinicalTrials and FDA — curated, scored, and audio-ready"
          href="/issues"
          hrefLabel="Full archive"
        />

        {/* Rotating Top Stories — hero + 2 secondary auto-cycle every 7s */}
        <RotatingTopStories articles={topStories} interval={7} />

        {/* From the Editor — below the rotating grid */}
        <div className="mt-6">
          <FromTheEditor />
        </div>
      </section>

      {/* ── MODULE 2: Inline Conversion ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ConversionWidget
          variant="inline"
          headline="Join 4,200+ radiation oncology professionals"
          subline="Clinical intelligence from PubMed, arXiv, ClinicalTrials and FDA — curated, scored, and audio-ready"
        />
      </section>

      {/* ── MODULE 3: Industry Moves + Paper of the Day ─────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <SectionHeader label="People & Organisations" title="Industry Moves" href="/categories/operations" hrefLabel="More moves" />
            <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}>
              {industryMoves.map((article, i) => (
                <Link key={article.slug} href={`/article/${article.slug}`} className="block group" aria-label={`Industry move: ${article.title}`}>
                  <div className={`p-5 transition-colors hover:bg-[var(--bg-raised)] ${i < industryMoves.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--border-subtle)" }}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: "var(--bg-raised)" }}>🏥</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="kicker" style={{ color: "#30D158" }}>{article.category}</span>
                          {article.composite_score >= 80 && <span className="badge-signal-green">S{article.composite_score}</span>}
                        </div>
                        <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-primary)" }}>{article.title}</h3>
                        <time className="kicker mt-1 block" dateTime={article.published_at} style={{ color: "var(--text-tertiary)" }}>
                          {new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </time>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <SectionHeader label="Featured Research" title="Paper of the Day" href="/categories/research" hrefLabel="More papers" />
            {paperOfDay && (
              <Link href={`/article/${paperOfDay.slug}`} className="block group" aria-label={`Paper of the Day: ${paperOfDay.title}`}>
                <article className="card-feature overflow-hidden" style={{ background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-raised) 100%)" }}>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                        🔬 {paperOfDay.primary_source_type}
                      </div>
                      {paperOfDay.romas_insight && <span className="badge-insight">✦ ROMAS Insight</span>}
                      {paperOfDay.composite_score >= 80 ? <span className="badge-signal-green">S{paperOfDay.composite_score}</span> : <span className="badge-signal-amber">S{paperOfDay.composite_score}</span>}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 text-balance group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: "1.25" }}>
                      {paperOfDay.title}
                    </h2>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>{paperOfDay.standfirst}</p>
                    <div className="grid grid-cols-3 gap-3 p-4 rounded-xl mb-6" style={{ background: "var(--bg-raised)" }}>
                      {[
                        { label: "Clinical", value: paperOfDay.signal_scores.clinical },
                        { label: "Physics", value: paperOfDay.signal_scores.physics },
                        { label: "Novelty", value: paperOfDay.signal_scores.novelty },
                      ].map(({ label, value }) => (
                        <div key={label} className="text-center">
                          <p className="text-xl font-bold font-mono" style={{ color: value >= 80 ? "#1A7F37" : value >= 60 ? "#9A6700" : "#CF222E" }}>{value}</p>
                          <p className="kicker mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</p>
                        </div>
                      ))}
                    </div>
                    {paperOfDay.romas_insight && (
                      <div className="p-4 rounded-xl border-l-4 mb-5" style={{ background: "var(--accent-subtle)", borderLeftColor: "var(--accent)" }}>
                        <p className="kicker mb-1" style={{ color: "var(--accent)" }}>ROMAS Insight</p>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{paperOfDay.romas_insight}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {paperOfDay.has_audio && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: "var(--bg-raised)", color: "var(--text-secondary)" }}>🎧 Audio available</span>
                        )}
                        <a href={paperOfDay.primary_source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover:bg-[var(--bg-sunken)]" style={{ background: "var(--bg-raised)", color: "var(--text-secondary)" }} aria-label="Open primary source in new tab">Primary source ↗</a>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>Read critique →</span>
                    </div>
                  </div>
                </article>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── MODULE 4: Quick Hits (rotating top row) ──────────────────── */}
      <section className="py-10" style={{ background: "var(--bg-raised)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Fast Intelligence"
            title="Quick Hits"
            description="Top row refreshes every 8s from today's highest-signal items. Rows 2–5 are stable anchors."
            href="/categories"
            hrefLabel="Browse all topics"
          />
          <QuickHitsRotator rotatingPool={rotatingPool} stableItems={stableItems} />
        </div>
      </section>

      {/* ── MODULE 5: Today's Podcast + Audio Intelligence ───────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {podcast && (
            <div className="lg:col-span-5">
              <SectionHeader label="Audio Intelligence" title="Today's Podcast" href="/listen" hrefLabel="All audio" />
              <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #001D3D 0%, #001A18 100%)", boxShadow: "var(--shadow-lg)" }}>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "rgba(255,255,255,0.10)" }}>🎙</div>
                    <div>
                      <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">ROMAS Brief Podcast</p>
                      <p className="text-sm font-medium text-white/80">
                        {new Date(podcast.published_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 text-balance" style={{ lineHeight: "1.3" }}>{podcast.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed mb-6">{podcast.standfirst}</p>
                  <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <button className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95" style={{ background: "var(--accent)" }} aria-label="Play episode">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                    <div className="flex-1">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
                        <div className="h-full rounded-full" style={{ width: "0%", background: "var(--accent)" }} />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-xs text-white/50">0:00</span>
                        <span className="text-xs text-white/50">~8 min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <Link href={`/article/${podcast.slug}`} className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold" style={{ background: "rgba(255,255,255,0.10)", color: "white" }} aria-label="Read transcript">Read transcript</Link>
                    <Link href="/listen" className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold hover:opacity-90" style={{ background: "var(--accent)", color: "white" }} aria-label="Browse all audio">Browse all audio</Link>
                  </div>
                  {/* Cross-platform subscribe row */}
                  <div className="mt-5 pt-4 border-t border-white/10">
                    <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Subscribe on</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Apple", href: "https://podcasts.apple.com/podcast/romas-brief" },
                        { label: "Spotify", href: "https://open.spotify.com/show/romasbrief" },
                        { label: "RSS", href: "/feeds/podcast.xml" },
                        { label: "Overcast", href: "https://overcast.fm/itunes/romasbrief" },
                      ].map(({ label, href }) => (
                        <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.7)" }} aria-label={`Subscribe on ${label}`}>{label}</a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="lg:col-span-7">
            <SectionHeader label="Recent Audio Briefs" title="Audio Intelligence" href="/listen" hrefLabel="Full audio library" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {audioArticles.map((article) => (
                <Link key={article.slug} href={`/article/${article.slug}`} className="block group" aria-label={`Audio brief: ${article.title}`}>
                  <article className="card p-5 h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}><span className="text-base">🎧</span></div>
                      <div className="flex-1 min-w-0">
                        <span className="kicker block mb-1" style={{ color: "var(--accent)" }}>{article.category}</span>
                        <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-primary)" }}>{article.title}</h4>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <time className="kicker" dateTime={article.published_at} style={{ color: "var(--text-tertiary)" }}>
                        {new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </time>
                      {article.composite_score >= 80 ? <span className="badge-signal-green">S{article.composite_score}</span> : <span className="badge-signal-amber">S{article.composite_score}</span>}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MODULE 6: Trending Now ───────────────────────────────────── */}
      <section className="py-10" style={{ background: "var(--bg-raised)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <SectionHeader label="Most Read This Week" title="Trending Now" href="/categories" hrefLabel="All topics" />
              <div className="space-y-0">
                {trending.map((article, i) => (
                  <Link key={article.slug} href={`/article/${article.slug}`} className="block group" aria-label={`Trending #${i + 1}: ${article.title}`}>
                    <div className={`flex items-start gap-5 py-5 transition-colors hover:bg-[var(--bg-surface)] rounded-xl px-3 -mx-3 ${i < trending.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--border-subtle)" }}>
                      <span className="flex-shrink-0 text-4xl font-black tabular-nums" style={{ color: "var(--border-strong)", lineHeight: "1" }}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="kicker" style={{ color: "var(--accent)" }}>{article.category}</span>
                          {article.composite_score >= 80 ? <span className="badge-signal-green">S{article.composite_score}</span> : <span className="badge-signal-amber">S{article.composite_score}</span>}
                          {article.romas_insight && <span className="badge-insight">✦ RI</span>}
                        </div>
                        <h3 className="text-base font-semibold line-clamp-2 group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-primary)" }}>{article.title}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <time className="kicker" dateTime={article.published_at} style={{ color: "var(--text-tertiary)" }}>
                            {new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </time>
                          {article.has_audio && <span className="kicker" style={{ color: "var(--text-tertiary)" }}>🎧 Audio</span>}
                          <span className="kicker" style={{ color: "var(--text-tertiary)" }}>{article.region}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="lg:col-span-4">
              <SectionHeader label="Explore" title="Browse Topics" />
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: "/categories/ai", label: "AI & ML", icon: "🤖" },
                  { href: "/categories/clinical-rt", label: "Clinical RT", icon: "⚕️" },
                  { href: "/categories/physics", label: "Physics", icon: "⚛️" },
                  { href: "/categories/regulatory", label: "Regulatory", icon: "🏛" },
                  { href: "/categories/guidelines", label: "Guidelines", icon: "📋" },
                  { href: "/categories/reimbursement", label: "Reimbursement", icon: "💰" },
                  { href: "/regions/us", label: "US", icon: "🇺🇸" },
                  { href: "/regions/europe", label: "Europe", icon: "🇪🇺" },
                  { href: "/for/physicists", label: "Physicists", icon: "🔬" },
                  { href: "/for/physicians", label: "Physicians", icon: "👨‍⚕️" },
                ].map(({ href, label, icon }) => (
                  <Link key={href} href={href} className="flex items-center gap-2.5 p-3 rounded-xl border transition-all hover:shadow-sm hover:border-[var(--border-default)] group" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }} aria-label={`Browse ${label} articles`}>
                    <span className="text-lg">{icon}</span>
                    <span className="text-xs font-semibold group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-primary)" }}>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODULE 7: Top Papers This Week ──────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SectionHeader label="Research Intelligence" title="Top Papers This Week" description="Highest composite signal scores from peer-reviewed literature." href="/categories/research" hrefLabel="All research" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {topPapers.map((article) => (
            <Link key={article.slug} href={`/article/${article.slug}`} className="block group" aria-label={`Research paper: ${article.title}`}>
              <article className="card h-full p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>🔬 {article.primary_source_type}</span>
                  {article.composite_score >= 80 ? <span className="badge-signal-green">S{article.composite_score}</span> : <span className="badge-signal-amber">S{article.composite_score}</span>}
                </div>
                <h3 className="text-sm font-semibold line-clamp-3 group-hover:text-[var(--accent)] transition-colors mb-3" style={{ color: "var(--text-primary)" }}>{article.title}</h3>
                {article.romas_insight && <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{article.romas_insight}</p>}
                <div className="mt-auto pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
                  <time className="kicker" dateTime={article.published_at} style={{ color: "var(--text-tertiary)" }}>
                    {new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </time>
                  {article.has_audio && <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>🎧</span>}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* ── MODULE 8: Final CTA ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0066CC 0%, #0F766E 100%)", boxShadow: "var(--shadow-xl)" }}>
          <div className="px-8 py-14 sm:px-16 sm:py-16 text-center">
            <p className="kicker text-white/60 mb-3">Free for qualified clinicians</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance" style={{ letterSpacing: "-0.03em" }}>The signal, not the noise.</h2>
            <p className="text-base sm:text-lg text-white/80 mb-2 max-w-xl mx-auto leading-relaxed">
              Clinical intelligence from PubMed, arXiv, ClinicalTrials and FDA — curated, scored, and audio-ready.
            </p>
            <p className="text-sm text-white/65 mb-8 max-w-xl mx-auto">Join 4,200+ radiation oncology professionals who start their day with ROMAS Brief.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href="https://romasbrief.beehiiv.com/subscribe" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white font-semibold text-sm transition-all hover:bg-white/90 hover:scale-105 active:scale-95" style={{ color: "#0066CC" }} aria-label="Subscribe to ROMAS Brief">Subscribe free — takes 30 seconds</a>
              <Link href="/listen" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white font-medium text-sm transition-all hover:bg-white/10" aria-label="Browse audio library">🎧 Browse audio library</Link>
            </div>
            <p className="text-xs text-white/50 mt-5">No spam. Unsubscribe anytime. GDPR compliant.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
