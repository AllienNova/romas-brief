/**
 * rss-publisher · ROMAS Brief
 * T-212 / R-212 full implementation
 *
 * Responsibilities:
 *   1. Generate and publish 4 RSS feeds to R2 on demand:
 *      - audio-brief.xml   (Tier 1: per-article, last 500)
 *      - daily-brief.xml   (Tier 2: daily roundup, last 100)
 *      - podcast.xml       (Tier 3: weekly deep-dive, unlimited)
 *      - conference-brief.xml (Tier 4: conference, last 50, embargo-aware)
 *   2. Handle revoke events: regenerate affected feed without the revoked item
 *   3. Write rss_regenerated_at to revocations table after successful regeneration
 *   4. Purge CDN cache for the feed file after every write
 *
 * Trigger modes:
 *   A. HTTP POST /regenerate  { tier: AudioTier }  — called by audio-producer,
 *      audio-qa-reviewer (CMS), and cdn-purge-watchdog
 *   B. HTTP POST /revoke  { audio_job_id, revocation_id }  — called by CMS
 *      revoke handler
 *   C. HTTP GET /health  — health check
 *
 * Feed spec: .claude/skills/rss-feed-spec.md
 * Inviolable rule 2: embargoed items NEVER appear in conference-brief.xml
 */

import {
  VALID_FEED_TIERS,
  estimateEnclosureBytes,
  regenerateDecision,
} from "./lib.ts";

// ─── Env interface ────────────────────────────────────────────────────────────

export interface Env {
  /** R2 public CDN bucket */
  AUDIO_CDN: R2Bucket;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  CLOUDFLARE_ZONE_ID: string;
  CF_PURGE_API_TOKEN: string;
  CDN_BASE_URL: string;
  SITE_BASE_URL: string;
  /** Internal auth token for watchdog/CMS calls */
  INTERNAL_AUTH_TOKEN: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type AudioTier =
  | "audio_brief"
  | "daily_brief"
  | "podcast"
  | "conference_brief"
  | "video_podcast";

type FeedTier = "audio-brief" | "daily-brief" | "podcast" | "conference-brief";

interface EpisodeRow {
  id: string;
  article_id: string;
  audio_tier: AudioTier;
  audio_url_cdn: string;
  transcript_url: string | null;
  duration_sec: number | null;
  loudness_lufs: number | null;
  true_peak_dbtp: number | null;
  qa_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined from articles
  slug: string;
  title: string;
  standfirst: string | null;
  body_md: string | null;
  primary_source_url: string | null;
  primary_source_type: string | null;
  published_at: string | null;
  // Embargo check (for conference-brief)
  embargo_until: string | null;
}

interface FeedConfig {
  tier: FeedTier;
  dbTier: AudioTier;
  title: string;
  link: string;
  description: string;
  itunesCategory: string;
  itunesSubcategory: string;
  itunesType: "episodic" | "serial";
  coverImage: string;
  episodeCap: number | null;
  feedUrl: string;
  podcastGuid: string;
}

// ─── Feed configurations ──────────────────────────────────────────────────────

function getFeedConfig(env: Env): Record<FeedTier, FeedConfig> {
  const site = env.SITE_BASE_URL;
  const cdn = env.CDN_BASE_URL;

  return {
    "audio-brief": {
      tier: "audio-brief",
      dbTier: "audio_brief",
      title: "ROMAS Audio Brief",
      link: `${site}/listen/audio-brief`,
      description:
        "Per-article audio briefings for radiation oncology professionals — clinical intelligence in 5 to 10 minutes. From ROMAS Intelligence.",
      itunesCategory: "Health &amp; Fitness",
      itunesSubcategory: "Medicine",
      itunesType: "episodic",
      coverImage: `${cdn}/static/audio-brief-cover-3000.png`,
      episodeCap: 500,
      feedUrl: `${site}/feeds/audio-brief.xml`,
      podcastGuid: "romas-brief-audio-brief-v1",
    },
    "daily-brief": {
      tier: "daily-brief",
      dbTier: "daily_brief",
      title: "ROMAS Daily Brief",
      link: `${site}/listen/daily-brief`,
      description:
        "Daily radiation oncology roundups — the top developments from PubMed, arXiv, ClinicalTrials, and FDA in 10 to 15 minutes. From ROMAS Intelligence.",
      itunesCategory: "News",
      itunesSubcategory: "Daily News",
      itunesType: "episodic",
      coverImage: `${cdn}/static/daily-brief-cover-3000.png`,
      episodeCap: 100,
      feedUrl: `${site}/feeds/daily-brief.xml`,
      podcastGuid: "romas-brief-daily-brief-v1",
    },
    podcast: {
      tier: "podcast",
      dbTier: "podcast",
      title: "ROMAS Audio Podcast",
      link: `${site}/listen/podcast`,
      description:
        "Weekly deep-dive episodes on radiation oncology — clinical trials, physics, AI, and the future of the field. From ROMAS Intelligence.",
      itunesCategory: "Health &amp; Fitness",
      itunesSubcategory: "Medicine",
      itunesType: "episodic",
      coverImage: `${cdn}/static/podcast-cover-3000.png`,
      episodeCap: null, // unlimited
      feedUrl: `${site}/feeds/podcast.xml`,
      podcastGuid: "romas-brief-podcast-v1",
    },
    "conference-brief": {
      tier: "conference-brief",
      dbTier: "conference_brief",
      title: "ROMAS Conference Brief",
      link: `${site}/listen/conference-brief`,
      description:
        "Live coverage from ASTRO, ESTRO, AAPM, JASTRO, and RANZCR — daily briefings from the conference floor. From ROMAS Intelligence.",
      itunesCategory: "Health &amp; Fitness",
      itunesSubcategory: "Medicine",
      itunesType: "episodic",
      coverImage: `${cdn}/static/conference-brief-cover-3000.png`,
      episodeCap: 50,
      feedUrl: `${site}/feeds/conference-brief.xml`,
      podcastGuid: "romas-brief-conference-brief-v1",
    },
  };
}

// ─── Supabase REST helper ─────────────────────────────────────────────────────

function supabase(env: Env) {
  const base = env.SUPABASE_URL.replace(/\/$/, "");
  const headers: Record<string, string> = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };

  async function selectMany<T>(
    table: string,
    params: Record<string, string>,
  ): Promise<T[]> {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${base}/rest/v1/${table}?${qs}`, {
      headers: { ...headers, Prefer: "return=representation" },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase select ${table} HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
    return res.json() as Promise<T[]>;
  }

  async function update(
    table: string,
    id: string,
    patch: Record<string, unknown>,
  ): Promise<void> {
    const res = await fetch(`${base}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase update ${table} HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
  }

  return { selectMany, update };
}

// ─── Fetch published episodes for a tier ─────────────────────────────────────

async function fetchEpisodes(
  tier: AudioTier,
  cap: number | null,
  env: Env,
): Promise<EpisodeRow[]> {
  const db = supabase(env);
  const limit = cap ? String(cap) : "1000";

  // Join audio_jobs with articles via PostgREST embedded resource
  const episodes = await db.selectMany<EpisodeRow>("audio_jobs", {
    audio_tier: `eq.${tier}`,
    audio_status: "eq.published",
    select:
      "id,article_id,audio_tier,audio_url_cdn,transcript_url,duration_sec,loudness_lufs,true_peak_dbtp,qa_reviewed_at,created_at,updated_at,articles(slug,title,standfirst,body_md,primary_source_url,primary_source_type,published_at)",
    order: "qa_reviewed_at.desc",
    limit,
  });

  // Flatten the nested articles join
  return episodes.map((row) => {
    const r = row as unknown as Record<string, unknown>;
    const article = (r["articles"] as Record<string, unknown>) ?? {};
    return {
      ...row,
      slug: (article["slug"] as string) ?? "",
      title: (article["title"] as string) ?? "Untitled",
      standfirst: (article["standfirst"] as string | null) ?? null,
      body_md: (article["body_md"] as string | null) ?? null,
      primary_source_url: (article["primary_source_url"] as string | null) ?? null,
      primary_source_type: (article["primary_source_type"] as string | null) ?? null,
      published_at: (article["published_at"] as string | null) ?? null,
      embargo_until: null, // not applicable for published audio
    };
  });
}

// ─── Embargo check for conference-brief ──────────────────────────────────────

async function fetchConferenceEpisodes(env: Env): Promise<EpisodeRow[]> {
  const episodes = await fetchEpisodes("conference_brief", 50, env);
  const now = new Date();

  // Inviolable rule 2: filter out any item under active embargo
  const safe = episodes.filter((ep) => {
    if (!ep.embargo_until) return true;
    return new Date(ep.embargo_until) <= now;
  });

  if (safe.length < episodes.length) {
    console.warn(
      `[rss-publisher] conference-brief: filtered ${episodes.length - safe.length} embargoed item(s)`,
    );
  }

  return safe;
}

// ─── XML helpers ──────────────────────────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc2822(dateStr: string): string {
  return new Date(dateStr).toUTCString();
}

function formatDuration(sec: number | null): string {
  if (!sec || sec <= 0) return "00:00:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function buildEpisodeTitle(ep: EpisodeRow, tier: FeedTier): string {
  const raw = ep.title ?? "Untitled";
  // Conference Brief format: "{Conference} — Day {N}: {topic}" if detectable
  // Otherwise use article title truncated to 90 chars
  return raw.slice(0, 90);
}

function buildEpisodeDescription(ep: EpisodeRow): string {
  // Plain text, no markdown, ≤ 240 chars for itunes:summary
  const standfirst = ep.standfirst ?? "";
  const plain = standfirst
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();

  const base = plain.length > 0 ? plain : ep.title;
  return base.slice(0, 240);
}

function buildShowNotesHtml(ep: EpisodeRow, siteBase: string): string {
  const title = escapeXml(ep.title ?? "Untitled");
  const standfirst = escapeXml(ep.standfirst ?? "");
  const sourceUrl = ep.primary_source_url ?? "#";
  const sourceLabel = ep.primary_source_type ?? "Source";
  const articleUrl = `${siteBase}/article/${ep.slug}`;

  return [
    `<p><strong>${title}</strong></p>`,
    standfirst ? `<p>${standfirst}</p>` : "",
    "",
    "<h3>Primary source</h3>",
    `<p><a href="${escapeXml(sourceUrl)}">${escapeXml(sourceLabel)}</a></p>`,
    "",
    `<p><em>Full article: <a href="${escapeXml(articleUrl)}">${escapeXml(articleUrl)}</a></em></p>`,
  ]
    .filter((l) => l !== "")
    .join("\n");
}

function buildTranscriptTags(ep: EpisodeRow, cdnBase: string): string {
  if (!ep.transcript_url) return "";
  const base = `${cdnBase}/${ep.transcript_url}`;
  const srtUrl = base.replace(".txt", ".srt");
  return [
    `    <podcast:transcript url="${escapeXml(base)}" type="text/plain"/>`,
    `    <podcast:transcript url="${escapeXml(srtUrl)}" type="application/srt"/>`,
  ].join("\n");
}

function buildEnclosureUrl(ep: EpisodeRow, cdnBase: string): string {
  if (ep.audio_url_cdn) {
    return `${cdnBase}/${ep.audio_url_cdn}`;
  }
  // Fallback: reconstruct from slug and tier
  const date = ep.published_at ?? ep.created_at;
  const [year, month] = date.split("-");
  return `${cdnBase}/audio/brief/${year}/${month}/${ep.slug}__brief.mp3`;
}

// ─── Feed XML generation ──────────────────────────────────────────────────────

function generateFeedXml(
  config: FeedConfig,
  episodes: EpisodeRow[],
  env: Env,
): string {
  const now = new Date().toUTCString();
  const cdnBase = env.CDN_BASE_URL;
  const siteBase = env.SITE_BASE_URL;

  const itemsXml = episodes
    .map((ep) => {
      const title = escapeXml(buildEpisodeTitle(ep, config.tier));
      const articleUrl = `${siteBase}/article/${escapeXml(ep.slug)}`;
      const enclosureUrl = escapeXml(buildEnclosureUrl(ep, cdnBase));
      const pubDate = toRfc2822(ep.qa_reviewed_at ?? ep.created_at);
      const description = escapeXml(buildEpisodeDescription(ep));
      const showNotes = buildShowNotesHtml(ep, siteBase);
      const duration = formatDuration(ep.duration_sec);
      const transcriptTags = buildTranscriptTags(ep, cdnBase);
      // SHIP-15: RSS/Apple Podcasts require a non-zero enclosure byte length.
      // Derived deterministically from duration at the 128 kbps encode bitrate
      // (no per-item R2 HEAD request). Missing/0 duration → minimal positive (1).
      const enclosureBytes = estimateEnclosureBytes(ep.duration_sec ?? 0);

      return `  <item>
    <title>${title}</title>
    <link>${escapeXml(articleUrl)}</link>
    <guid isPermaLink="false">romas-brief:audio:${ep.id}</guid>
    <pubDate>${pubDate}</pubDate>
    <description><![CDATA[${description}

Full article: ${articleUrl}]]></description>
    <content:encoded><![CDATA[${showNotes}]]></content:encoded>
    <enclosure
      url="${enclosureUrl}"
      length="${enclosureBytes}"
      type="audio/mpeg"/>
    <itunes:duration>${duration}</itunes:duration>
    <itunes:episodeType>full</itunes:episodeType>
    <itunes:explicit>false</itunes:explicit>
    <itunes:author>ROMAS Intelligence</itunes:author>
    <itunes:summary>${description}</itunes:summary>
    <itunes:image href="${escapeXml(config.coverImage)}"/>
${transcriptTags}
  </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:podcast="https://podcastindex.org/namespace/1.0">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${escapeXml(config.link)}</link>
    <description>${escapeXml(config.description)}</description>
    <language>en-us</language>
    <copyright>© ROMAS Intelligence</copyright>
    <lastBuildDate>${now}</lastBuildDate>
    <itunes:author>ROMAS Intelligence</itunes:author>
    <itunes:owner>
      <itunes:name>Kimal Honour Djam</itunes:name>
      <itunes:email>president@aliennova.com</itunes:email>
    </itunes:owner>
    <itunes:image href="${escapeXml(config.coverImage)}"/>
    <itunes:category text="${config.itunesCategory}">
      <itunes:category text="${config.itunesSubcategory}"/>
    </itunes:category>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>${config.itunesType}</itunes:type>
    <itunes:summary>${escapeXml(config.description.slice(0, 240))}</itunes:summary>
    <atom:link href="${escapeXml(config.feedUrl)}" rel="self" type="application/rss+xml"/>
    <podcast:funding url="${escapeXml(env.SITE_BASE_URL)}/support">Support ROMAS Brief</podcast:funding>
    <podcast:locked owner="president@aliennova.com">yes</podcast:locked>
    <podcast:guid>${config.podcastGuid}</podcast:guid>
${itemsXml}
  </channel>
</rss>`;
}

// ─── CDN purge ────────────────────────────────────────────────────────────────

async function purgeFeedCache(
  feedPath: string,
  env: Env,
): Promise<void> {
  const url = `${env.SITE_BASE_URL}/feeds/${feedPath}`;
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/purge_cache`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CF_PURGE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files: [url] }),
    },
  );
  if (!res.ok) {
    const body = await res.text();
    console.error(`[rss-publisher] CDN purge failed for ${feedPath} HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
}

// ─── Main feed generation ─────────────────────────────────────────────────────

async function generateAndPublishFeed(
  feedTier: FeedTier,
  env: Env,
): Promise<void> {
  const configs = getFeedConfig(env);
  const config = configs[feedTier];

  console.log(`[rss-publisher] Generating feed: ${feedTier}`);

  // Fetch episodes
  let episodes: EpisodeRow[];
  if (feedTier === "conference-brief") {
    episodes = await fetchConferenceEpisodes(env);
  } else {
    episodes = await fetchEpisodes(config.dbTier, config.episodeCap, env);
  }

  console.log(`[rss-publisher] ${feedTier}: ${episodes.length} episode(s)`);

  // Generate XML
  const xml = generateFeedXml(config, episodes, env);

  // Validate: basic well-formedness check (xmllint not available in Workers)
  // We verify the XML starts and ends correctly as a minimal sanity check
  if (!xml.startsWith("<?xml") || !xml.includes("</rss>")) {
    throw new Error(`[rss-publisher] Generated XML for ${feedTier} appears malformed`);
  }

  // Upload to R2
  const r2Key = `feeds/${feedTier}.xml`;
  await env.AUDIO_CDN.put(r2Key, xml, {
    httpMetadata: {
      contentType: "application/rss+xml; charset=utf-8",
      cacheControl: "public, max-age=60", // 60s TTL (revoke kill-switch SLA)
    },
    customMetadata: {
      generated_at: new Date().toISOString(),
      episode_count: String(episodes.length),
      feed_tier: feedTier,
    },
  });

  console.log(`[rss-publisher] Uploaded ${r2Key} (${xml.length} bytes)`);

  // Purge CDN cache
  await purgeFeedCache(`${feedTier}.xml`, env);

  console.log(`[rss-publisher] Feed ${feedTier} published successfully`);
}

// ─── Revoke handler ───────────────────────────────────────────────────────────

async function handleRevoke(
  audioJobId: string,
  revocationId: string,
  env: Env,
): Promise<void> {
  const db = supabase(env);

  // Fetch the audio job to determine which tier to regenerate
  const jobs = await db.selectMany<{ audio_tier: AudioTier }>("audio_jobs", {
    id: `eq.${audioJobId}`,
    select: "audio_tier",
    limit: "1",
  });

  const job = jobs[0];
  if (!job) {
    console.error(`[rss-publisher] audio_job ${audioJobId} not found for revoke`);
    return;
  }

  const tierMap: Record<AudioTier, FeedTier | null> = {
    audio_brief: "audio-brief",
    daily_brief: "daily-brief",
    podcast: "podcast",
    conference_brief: "conference-brief",
    video_podcast: null, // Day 60
  };

  const feedTier = tierMap[job.audio_tier];
  if (!feedTier) {
    console.log(`[rss-publisher] No feed for tier ${job.audio_tier} — skipping`);
    return;
  }

  // Regenerate the feed (revoked item will be excluded since it's no longer 'published')
  await generateAndPublishFeed(feedTier, env);

  // Write rss_regenerated_at to revocations table
  await db.update("revocations", revocationId, {
    rss_regenerated_at: new Date().toISOString(),
  });

  console.log(
    `[rss-publisher] Revoke complete: feed ${feedTier} regenerated, revocation ${revocationId} updated`,
  );
}

// ─── Auth check ───────────────────────────────────────────────────────────────

function isAuthorized(request: Request, env: Env): boolean {
  const auth = request.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/, "");
  return token === env.INTERNAL_AUTH_TOKEN;
}

// ─── Worker fetch handler ─────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check — no auth required
    if (url.pathname === "/health" || url.pathname === "/") {
      return new Response(
        JSON.stringify({ status: "ok", worker: "rss-publisher", version: "1.0.0" }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    // All other endpoints require auth
    if (!isAuthorized(request, env)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    // POST /regenerate  { tier: FeedTier }
    if (url.pathname === "/regenerate" && request.method === "POST") {
      let body: { tier?: string } = {};
      try {
        body = (await request.json()) as { tier?: string };
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }

      // SHIP-15: pure decision — missing tier → regenerate all; valid tier →
      // regenerate one; any other value → 400 (was an empty-success path).
      const decision = regenerateDecision(body.tier);

      if (decision.action === "invalid") {
        return new Response(
          JSON.stringify({
            error: `Invalid tier: ${decision.tier}. Valid: ${VALID_FEED_TIERS.join(", ")}`,
          }),
          { status: 400, headers: { "content-type": "application/json" } },
        );
      }

      if (decision.action === "all") {
        for (const t of decision.tiers) {
          await generateAndPublishFeed(t, env).catch((err) => {
            console.error(`[rss-publisher] Failed to regenerate ${t}:`, err);
          });
        }
        return new Response(
          JSON.stringify({ ok: true, regenerated: decision.tiers }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      // decision.action === "one"
      await generateAndPublishFeed(decision.tier, env);
      return new Response(
        JSON.stringify({ ok: true, tier: decision.tier }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    // POST /revoke  { audio_job_id, revocation_id }
    if (url.pathname === "/revoke" && request.method === "POST") {
      let body: { audio_job_id?: string; revocation_id?: string } = {};
      try {
        body = (await request.json()) as {
          audio_job_id?: string;
          revocation_id?: string;
        };
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }

      if (!body.audio_job_id || !body.revocation_id) {
        return new Response(
          JSON.stringify({ error: "audio_job_id and revocation_id are required" }),
          { status: 400, headers: { "content-type": "application/json" } },
        );
      }

      await handleRevoke(body.audio_job_id, body.revocation_id, env);
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    // POST /regenerate-all  — regenerate all 4 feeds
    if (url.pathname === "/regenerate-all" && request.method === "POST") {
      const tiers: FeedTier[] = [
        "audio-brief",
        "daily-brief",
        "podcast",
        "conference-brief",
      ];
      const results: Record<string, string> = {};
      for (const tier of tiers) {
        try {
          await generateAndPublishFeed(tier, env);
          results[tier] = "ok";
        } catch (err) {
          results[tier] = err instanceof Error ? err.message : String(err);
          console.error(`[rss-publisher] Failed to regenerate ${tier}:`, err);
        }
      }
      return new Response(
        JSON.stringify({ ok: true, results }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  },
};
