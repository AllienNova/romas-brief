/**
 * notice-scheduler · ROMAS Wire — NB-5 (spec §10)
 *
 * Cloudflare Cron worker. Every 5 minutes it calls the Postgres function
 * notices_run_scheduler() via Supabase RPC (service role), which inside an
 * advisory lock promotes due scheduled→published, expires due published, and
 * keeps the one-live-featured invariant. When any state actually changed it
 * POSTs the reader's revalidate-board route so the homepage board reflects the
 * transition within one cache cycle.
 *
 * RUNTIME (status flips firing on cron) is gated on: migration 0016 applied to
 * the live DB + this worker deployed with its secrets. The transition LOGIC is
 * covered by supabase/tests/notices_scheduler.sql (pgTAP, runs at migrate time).
 */

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  /** Full URL of the reader revalidate-board route (e.g. https://romaswire.com/api/internal/revalidate-board). */
  REVALIDATE_BOARD_URL?: string;
  /** Shared bearer for the revalidate route (see SECRETS.md: ROMAS_REVALIDATE_SECRET). */
  ROMAS_REVALIDATE_SECRET?: string;
}

interface SchedulerResult {
  promoted: number;
  expired: number;
}

async function runScheduler(env: Env): Promise<SchedulerResult> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("[notice-scheduler] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
  }
  const base = env.SUPABASE_URL.replace(/\/$/, "");
  const res = await fetch(`${base}/rest/v1/rpc/notices_run_scheduler`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[notice-scheduler] RPC HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  const rows = (await res.json()) as SchedulerResult[];
  return rows[0] ?? { promoted: 0, expired: 0 };
}

async function revalidateBoard(env: Env): Promise<void> {
  if (!env.REVALIDATE_BOARD_URL || !env.ROMAS_REVALIDATE_SECRET) {
    console.warn("[notice-scheduler] REVALIDATE_BOARD_URL/secret unset — skipping board revalidation");
    return;
  }
  const res = await fetch(env.REVALIDATE_BOARD_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.ROMAS_REVALIDATE_SECRET}` },
  });
  if (!res.ok) {
    console.warn(`[notice-scheduler] revalidate-board HTTP ${res.status}`);
  }
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        try {
          const r = await runScheduler(env);
          if (r.promoted > 0 || r.expired > 0) {
            console.log(`[notice-scheduler] promoted=${r.promoted} expired=${r.expired} — revalidating board`);
            await revalidateBoard(env);
          } else {
            console.log("[notice-scheduler] no due transitions");
          }
        } catch (err) {
          console.error("[notice-scheduler]", err instanceof Error ? err.message : String(err));
        }
      })(),
    );
  },

  async fetch(): Promise<Response> {
    return new Response(
      JSON.stringify({ status: "ok", worker: "notice-scheduler", version: "1.0.0" }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  },
};
