/**
 * email-canary · ROMAS Brief
 * RESERVED placeholder — handler logic NOT YET IMPLEMENTED in this repo.
 *
 * Scope when implemented (T-310A-A..E, Phase 7):
 *   - Resend API client
 *   - signup confirmation, unsubscribe receipt, audio-revocation notice, password reset
 *   - React-Email templates
 *   - RFC 8058 one-click unsubscribe
 *
 * Status (2026-05-28): reserved workspace post /team-qa cycle-6 reconciliation.
 * Note: tasks.md references this as `email-transactional`; on-disk name is `email-canary`.
 * See `tasks.md` Phase 7 and `Docs/specs/qa-report.md` cycle-6 ADDENDUM.
 */

export interface Env {
  RESEND_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export default {
  async fetch(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    return new Response(
      JSON.stringify({
        error: "not_implemented",
        worker: "email-canary",
        message:
          "Reserved workspace. Implementation pending T-310A-A..E (Phase 7). See tasks.md and Docs/specs/qa-report.md cycle-6.",
      }),
      {
        status: 501,
        headers: { "content-type": "application/json" },
      },
    );
  },
};
