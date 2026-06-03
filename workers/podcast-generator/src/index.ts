/**
 * podcast-generator · ROMAS Wire — NB pipeline / Tier-3 audio (D-POD-1)
 *
 * Generates the full-length conversational podcast via the Jellypod API, then
 * lands the MP3 in R2 and opens an audio_jobs row at `in_review` so it enters
 * the inviolable Rule-6 QA gate (NEVER auto-published).
 *
 *   POST /generate  { slug, articleId?, episode:{chapters:[{title,turns:[…]}]} }
 *     → buildScript() → Jellypod generate → return 202 {episodeId}
 *     → finalize in ctx.waitUntil(): poll → download → R2 → audio_jobs(in_review)
 *
 * LONG-RENDER CAVEAT: a 30–60 min episode render takes minutes; ctx.waitUntil()
 * extends the worker past the response but Cloudflare still caps its lifetime.
 * For production-grade long renders this finalize step should move to a
 * Cloudflare Queue consumer / Workflow (or a cron poller against a `generating`
 * audio_jobs state + a stored jellypod_episode_id column — needs a migration).
 * Documented in Docs/specs/podcast-video-pipeline.md §6.
 *
 * RUNTIME gated on: JELLYPOD_API_KEY + JELLYPOD_PODCAST_ID, the AUDIO_CDN R2
 * binding, and SUPABASE_* service role. The buildScript() logic is unit-tested
 * (src/script.test.ts).
 */
import { buildScript, ScriptError, type EpisodeInput } from "./script.ts";
import { downloadAudio, generateEpisode, pollEpisode } from "./jellypod.ts";

export interface Env {
  JELLYPOD_API_KEY: string;
  JELLYPOD_PODCAST_ID: string;
  AUDIO_CDN: R2Bucket;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  /** Shared bearer authenticating the /generate trigger (e.g. from the CMS). */
  PODCAST_GENERATOR_SECRET?: string;
}

interface GenerateRequest {
  slug: string;
  articleId?: string;
  episode: EpisodeInput;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Constant-time bearer check (avoids timing leaks; Workers lack node crypto). */
function authed(req: Request, env: Env): boolean {
  const expected = env.PODCAST_GENERATOR_SECRET;
  if (!expected) return false; // fail closed when unconfigured
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (got.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= got.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

/** Open an audio_jobs row at in_review (Rule 6 — handoff to audio-qa-reviewer). */
async function openAudioJob(
  env: Env,
  args: { articleId: string | null; cdnPath: string; durationSec: number | null },
): Promise<void> {
  const base = env.SUPABASE_URL.replace(/\/$/, "");
  const res = await fetch(`${base}/rest/v1/audio_jobs`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      article_id: args.articleId,
      audio_tier: "podcast",
      audio_status: "in_review",
      audio_url_cdn: args.cdnPath,
      duration_sec: args.durationSec,
    }),
  });
  if (!res.ok) {
    throw new Error(`[podcast-generator] audio_jobs HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

/** Poll the episode, download the MP3, store it in R2, open the QA job. */
async function finalize(env: Env, episodeId: string, req: GenerateRequest): Promise<void> {
  try {
    const { downloadUrl, durationSec } = await pollEpisode(env, episodeId);
    const bytes = await downloadAudio(downloadUrl);
    const cdnPath = `audio/podcast/${req.slug}.mp3`;
    await env.AUDIO_CDN.put(cdnPath, bytes, {
      httpMetadata: { contentType: "audio/mpeg" },
    });
    await openAudioJob(env, {
      articleId: req.articleId ?? null,
      cdnPath,
      durationSec: durationSec ?? null,
    });
    console.log(`[podcast-generator] episode ${episodeId} → ${cdnPath} (in_review)`);
  } catch (err) {
    console.error("[podcast-generator] finalize failed:", err instanceof Error ? err.message : String(err));
  }
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/health") {
      return json({ status: "ok", worker: "podcast-generator", version: "1.0.0" });
    }
    if (req.method !== "POST" || url.pathname !== "/generate") {
      return json({ error: "not found" }, 404);
    }
    if (!authed(req, env)) return json({ error: "unauthorized" }, 401);

    let body: GenerateRequest;
    try {
      body = (await req.json()) as GenerateRequest;
    } catch {
      return json({ error: "invalid JSON" }, 400);
    }
    if (!body?.slug || !body?.episode) {
      return json({ error: "slug and episode are required" }, 400);
    }

    // Validate + build the script up front so a bad episode never hits the paid API.
    let script;
    try {
      script = buildScript(body.episode);
    } catch (e) {
      return json({ error: e instanceof ScriptError ? e.message : "script build failed" }, 400);
    }

    let episodeId: string;
    try {
      episodeId = await generateEpisode(env, script);
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "generate failed" }, 502);
    }

    // Render is long → finalize in the background; return the episode id now.
    ctx.waitUntil(finalize(env, episodeId, body));
    return json({ episodeId, status: "generating", slug: body.slug }, 202);
  },
};
