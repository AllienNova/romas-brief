// T-115 stub. First ingestion Worker; full implementation lands in T-115.
// See Docs/MASTER_IMPLEMENTATION_PLAN.md §B.1 and SSOT §6 for source domains.

export interface Env {
  // R2 bucket (T-115 wires `RAW` binding to romas-raw)
  // RAW: R2Bucket;
  // Supabase service-role key (Worker Secret)
  // SUPABASE_URL?: string;
  // SUPABASE_SERVICE_ROLE_KEY?: string;
}

export default {
  async scheduled(
    event: ScheduledEvent,
    _env: Env,
    _ctx: ExecutionContext,
  ): Promise<void> {
    console.log(
      `[cron-ingest] scheduled tick at ${new Date(event.scheduledTime).toISOString()} (stub)`,
    );
  },

  async fetch(_request: Request, _env: Env): Promise<Response> {
    // TODO T-115: gate this handler with a shared-secret header or Cloudflare
    // Access service token before wiring real ingestion logic. Stub returns
    // 200 unauthenticated only while the worker has no side effects.
    return new Response("cron-ingest stub — T-101 scaffold", {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  },
};
