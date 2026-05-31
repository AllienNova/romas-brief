/**
 * cdn-purge-watchdog · ROMAS Wire
 * T-211 / R-211 full implementation
 *
 * Runs every minute via Cloudflare Cron Triggers.
 *
 * Responsibility:
 *   - Find revocations rows where cdn_purge_at IS NULL AND
 *     created_at < now() - PURGE_SLA_THRESHOLD_SEC (default 90s)
 *   - Retry the Cloudflare cache purge for each stale revocation
 *   - On confirmed 2xx: write cdn_purge_at = now() to the revocations row
 *   - If purge still fails after retry: alert via Sentry + Resend email
 *
 * SLA: 60s p99 CDN withdrawal (NFR-005). Watchdog fires at 90s to catch
 * any revocations that the audio-producer inline purge missed.
 *
 * Also handles:
 *   - Detecting revocations where rss_regenerated_at IS NULL after 120s
 *     (rss-publisher may have missed the event) and enqueuing a re-trigger
 *     via Supabase function call or a direct rss-publisher fetch.
 */

// ─── Env interface ────────────────────────────────────────────────────────────

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  CLOUDFLARE_ZONE_ID: string;
  CF_PURGE_API_TOKEN: string;
  /** Public CDN base URL for audio/transcript artifacts (e.g. https://cdn.romasbrief.com) — same var rss-publisher reads */
  CDN_BASE_URL: string;
  /** Seconds after revocation before watchdog retries purge (default: 90) */
  PURGE_SLA_THRESHOLD_SEC: string;
  /** Optional Sentry DSN for SLA breach alerts */
  SENTRY_DSN?: string;
  /** Optional Resend API key for email alerts */
  RESEND_API_KEY?: string;
  /** Alert recipient email */
  ALERT_EMAIL?: string;
  /** RSS publisher worker URL for re-trigger (optional) */
  RSS_PUBLISHER_URL?: string;
  /** RSS publisher auth token (optional) */
  RSS_PUBLISHER_TOKEN?: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevocationRow {
  id: string;
  audio_job_id: string | null;
  article_id: string | null;
  reason: string;
  cdn_purge_at: string | null;
  rss_regenerated_at: string | null;
  created_at: string;
}

interface AudioJobRow {
  id: string;
  audio_url_cdn: string | null;
  transcript_url: string | null;
  audio_tier: string;
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

  async function selectOne<T>(
    table: string,
    params: Record<string, string>,
  ): Promise<T | null> {
    const rows = await selectMany<T>(table, { ...params, limit: "1" });
    return rows[0] ?? null;
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

  return { selectMany, selectOne, update };
}

// ─── CDN cache purge ──────────────────────────────────────────────────────────

interface PurgeResult {
  success: boolean;
  status: number;
  error?: string | undefined;
}

async function purgeCdnUrls(
  urls: string[],
  zoneId: string,
  apiToken: string,
): Promise<PurgeResult> {
  if (urls.length === 0) return { success: true, status: 200 };

  // Cloudflare purge accepts max 30 URLs per request
  const chunks: string[][] = [];
  for (let i = 0; i < urls.length; i += 30) {
    chunks.push(urls.slice(i, i + 30));
  }

  for (const chunk of chunks) {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files: chunk }),
      },
    );
    if (!res.ok) {
      const body = await res.text();
      return { success: false, status: res.status, error: body.slice(0, 200) };
    }
  }
  return { success: true, status: 200 };
}

// ─── Build CDN URLs for a revocation ─────────────────────────────────────────

function buildCdnUrls(job: AudioJobRow, cdnBase: string): string[] {
  const urls: string[] = [];
  // SHIP-15: CDN base comes from env.CDN_BASE_URL (same var rss-publisher reads),
  // not a hardcoded non-existent domain. Caller resolves + validates it.

  if (job.audio_url_cdn) {
    // audio_url_cdn is a relative R2 path like "audio/brief/2026/05/slug__brief.mp3"
    urls.push(`${cdnBase}/${job.audio_url_cdn}`);
  }
  if (job.transcript_url) {
    // transcript_url is a relative R2 path like "transcripts/2026/05/slug__brief.txt"
    urls.push(`${cdnBase}/${job.transcript_url}`);
    // Also purge the SRT variant
    urls.push(`${cdnBase}/${job.transcript_url.replace(".txt", ".srt")}`);
  }

  return urls;
}

// ─── Alert helpers ────────────────────────────────────────────────────────────

async function sendSentryAlert(
  dsn: string,
  message: string,
  extra: Record<string, unknown>,
): Promise<void> {
  // Sentry envelope API
  const [, key, host, projectId] = dsn.match(/https:\/\/([^@]+)@([^/]+)\/(.+)/) ?? [];
  if (!key || !host || !projectId) return;

  const envelope = [
    JSON.stringify({ dsn, sent_at: new Date().toISOString() }),
    JSON.stringify({ type: "event" }),
    JSON.stringify({
      level: "error",
      message,
      extra,
      timestamp: Date.now() / 1000,
      platform: "javascript",
      logger: "cdn-purge-watchdog",
    }),
  ].join("\n");

  await fetch(`https://${host}/api/${projectId}/envelope/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-sentry-envelope",
      "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${key}`,
    },
    body: envelope,
  }).catch(() => {
    // Alert failure is non-fatal
  });
}

async function sendEmailAlert(
  resendApiKey: string,
  to: string,
  subject: string,
  text: string,
): Promise<void> {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "alerts@romas.brief",
      to,
      subject,
      text,
    }),
  }).catch(() => {
    // Alert failure is non-fatal
  });
}

// ─── RSS re-trigger ───────────────────────────────────────────────────────────

async function triggerRssRegeneration(
  tier: string,
  rssPublisherUrl: string,
  token: string,
): Promise<void> {
  await fetch(`${rssPublisherUrl}/regenerate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tier }),
  }).catch((err) => {
    console.warn(`[cdn-purge-watchdog] RSS re-trigger failed for tier ${tier}:`, err);
  });
}

// ─── Main watchdog logic ──────────────────────────────────────────────────────

async function runWatchdog(env: Env): Promise<void> {
  const db = supabase(env);

  // SHIP-15: fail closed if the CDN base is unset rather than purging a fake host.
  if (!env.CDN_BASE_URL || env.CDN_BASE_URL.trim().length === 0) {
    throw new Error(
      "[cdn-purge-watchdog] CDN_BASE_URL is not set — cannot build purge URLs (refusing to purge a fabricated host)",
    );
  }
  const cdnBase = env.CDN_BASE_URL.replace(/\/$/, "");

  const thresholdSec = parseInt(env.PURGE_SLA_THRESHOLD_SEC ?? "90", 10);
  const thresholdTs = new Date(Date.now() - thresholdSec * 1000).toISOString();
  const rssThresholdTs = new Date(Date.now() - 120 * 1000).toISOString();

  // ── 1. Find stale revocations (cdn_purge_at IS NULL after threshold) ────────

  const stalePurges = await db.selectMany<RevocationRow>("revocations", {
    cdn_purge_at: "is.null",
    created_at: `lt.${thresholdTs}`,
    select: "id,audio_job_id,article_id,reason,cdn_purge_at,rss_regenerated_at,created_at",
    limit: "50",
  });

  console.log(`[cdn-purge-watchdog] Found ${stalePurges.length} stale purge(s)`);

  for (const revocation of stalePurges) {
    const ageMs = Date.now() - new Date(revocation.created_at).getTime();
    const ageSec = Math.round(ageMs / 1000);

    console.log(
      `[cdn-purge-watchdog] Processing stale revocation ${revocation.id} ` +
        `(age: ${ageSec}s, audio_job_id: ${revocation.audio_job_id ?? "none"})`,
    );

    let urlsToPurge: string[] = [];

    // Fetch the audio job to get CDN URLs
    if (revocation.audio_job_id) {
      const job = await db.selectOne<AudioJobRow>("audio_jobs", {
        id: `eq.${revocation.audio_job_id}`,
        select: "id,audio_url_cdn,transcript_url,audio_tier",
      });
      if (job) {
        urlsToPurge = buildCdnUrls(job, cdnBase);
      }
    }

    // Retry the purge
    const purgeResult = await purgeCdnUrls(
      urlsToPurge,
      env.CLOUDFLARE_ZONE_ID,
      env.CF_PURGE_API_TOKEN,
    );

    if (purgeResult.success) {
      await db.update("revocations", revocation.id, {
        cdn_purge_at: new Date().toISOString(),
      });
      console.log(
        `[cdn-purge-watchdog] Purge confirmed for revocation ${revocation.id} ` +
          `(${urlsToPurge.length} URL(s))`,
      );
    } else {
      // SLA breach — alert
      const alertMsg =
        `CDN purge SLA breach: revocation ${revocation.id} ` +
        `(age: ${ageSec}s) failed purge after retry. ` +
        `Error: ${purgeResult.error ?? "unknown"}. ` +
        `URLs: ${urlsToPurge.join(", ")}`;

      console.error(`[cdn-purge-watchdog] SLA BREACH: ${alertMsg}`);

      if (env.SENTRY_DSN) {
        await sendSentryAlert(env.SENTRY_DSN, alertMsg, {
          revocation_id: revocation.id,
          audio_job_id: revocation.audio_job_id,
          age_sec: ageSec,
          urls: urlsToPurge,
          purge_error: purgeResult.error,
        });
      }

      if (env.RESEND_API_KEY && env.ALERT_EMAIL) {
        await sendEmailAlert(
          env.RESEND_API_KEY,
          env.ALERT_EMAIL,
          `[ROMAS Wire] CDN Purge SLA Breach — Revocation ${revocation.id}`,
          alertMsg,
        );
      }
    }
  }

  // ── 2. Find revocations where rss_regenerated_at IS NULL after 120s ─────────

  const staleRss = await db.selectMany<RevocationRow>("revocations", {
    rss_regenerated_at: "is.null",
    created_at: `lt.${rssThresholdTs}`,
    select: "id,audio_job_id,article_id,reason,cdn_purge_at,rss_regenerated_at,created_at",
    limit: "20",
  });

  console.log(`[cdn-purge-watchdog] Found ${staleRss.length} stale RSS regeneration(s)`);

  for (const revocation of staleRss) {
    const ageMs = Date.now() - new Date(revocation.created_at).getTime();
    const ageSec = Math.round(ageMs / 1000);

    console.warn(
      `[cdn-purge-watchdog] RSS not regenerated for revocation ${revocation.id} ` +
        `(age: ${ageSec}s) — re-triggering`,
    );

    // Determine which tier(s) to regenerate
    let tier = "audio-brief"; // default
    if (revocation.audio_job_id) {
      const job = await db.selectOne<AudioJobRow>("audio_jobs", {
        id: `eq.${revocation.audio_job_id}`,
        select: "id,audio_url_cdn,transcript_url,audio_tier",
      });
      if (job) {
        tier = job.audio_tier.replace("_", "-");
      }
    }

    if (env.RSS_PUBLISHER_URL && env.RSS_PUBLISHER_TOKEN) {
      await triggerRssRegeneration(tier, env.RSS_PUBLISHER_URL, env.RSS_PUBLISHER_TOKEN);
    } else {
      console.warn(
        `[cdn-purge-watchdog] RSS_PUBLISHER_URL not set — cannot re-trigger RSS for revocation ${revocation.id}`,
      );
    }
  }

  // ── 3. Health summary ────────────────────────────────────────────────────────

  const totalStale = stalePurges.length + staleRss.length;
  if (totalStale === 0) {
    console.log("[cdn-purge-watchdog] All revocations within SLA — no action needed");
  }
}

// ─── Worker export ────────────────────────────────────────────────────────────

export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      runWatchdog(env).catch((err) => {
        console.error(
          "[cdn-purge-watchdog] Unhandled error:",
          err instanceof Error ? err.message : String(err),
        );
      }),
    );
  },

  // Health-check fetch handler
  async fetch(_request: Request, _env: Env): Promise<Response> {
    return new Response(
      JSON.stringify({ status: "ok", worker: "cdn-purge-watchdog", version: "1.0.0" }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  },
};
