/**
 * beehiiv-webhook · ROMAS Brief
 * RESERVED placeholder — handler logic NOT YET IMPLEMENTED in this repo.
 *
 * Scope when implemented (T-310C-A..C, Phase 7):
 *   - Verify HMAC-SHA256 signature against BEEHIIV_WEBHOOK_SECRET
 *   - Sync subscriber state to Supabase `subscribers` table
 *   - Idempotency on Beehiiv event ID
 *
 * Status (2026-05-28): reserved workspace post /team-qa cycle-6 reconciliation.
 * See `tasks.md` Phase 7 and `Docs/specs/qa-report.md` cycle-6 ADDENDUM.
 */

export interface Env {
  BEEHIIV_WEBHOOK_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export default {
  async fetch(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    return new Response(
      JSON.stringify({
        error: "not_implemented",
        worker: "beehiiv-webhook",
        message:
          "Reserved workspace. Implementation pending T-310C-A..C (Phase 7). See tasks.md and Docs/specs/qa-report.md cycle-6.",
      }),
      {
        status: 501,
        headers: { "content-type": "application/json" },
      },
    );
  },
};
