/**
 * source-health · ROMAS Brief
 * RESERVED placeholder — source-health logic currently lives inside cron-ingest.
 *
 * Scope when extracted (T-120):
 *   - Daily report generator reading from `source_health` table
 *   - Writes daily summary to R2 / sends to ops dashboard
 *   - Separates concerns from cron-ingest (currently couples ingest + reporting)
 *
 * Status (2026-05-28): reserved workspace post /team-qa cycle-6 reconciliation.
 * Live source-health writes happen inside `workers/cron-ingest/src/index.ts` per HealthSummary.
 * See `tasks.md` and `Docs/specs/qa-report.md` cycle-6 ADDENDUM.
 */

export interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export default {
  async fetch(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    return new Response(
      JSON.stringify({
        error: "not_implemented",
        worker: "source-health",
        message:
          "Reserved workspace. Source-health logic currently lives inside cron-ingest (writes source_health rows). Extraction pending T-120. See tasks.md and Docs/specs/qa-report.md cycle-6.",
      }),
      {
        status: 501,
        headers: { "content-type": "application/json" },
      },
    );
  },
};
