// =====================================================================
// POST /api/notices/events · NoticeBoard telemetry ingest (NB-6 / §12)
// Privacy-first: persists ONLY {notice_id, kind, surface} (parseEventPayload
// strips everything else). Anon insert is RLS-gated to live notices (migration
// 0015). No-ops when no DB env (dev/mock). ALWAYS returns 204 and never
// surfaces an error to the client — telemetry must not affect the reader.
// =====================================================================
import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { hasDbEnv } from "@/lib/notice-board/get-board";
import { parseEventPayload } from "@/lib/notice-board/telemetry";

export const runtime = "nodejs";

const NO_CONTENT = new NextResponse(null, { status: 204 });

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    // sendBeacon may send text/plain; parse the raw text rather than trusting Content-Type.
    body = JSON.parse(await req.text());
  } catch {
    return NO_CONTENT;
  }

  const events = parseEventPayload(body);
  if (events.length === 0 || !hasDbEnv()) return NO_CONTENT;

  try {
    const sb = createPublicSupabaseClient() as unknown as SupabaseClient;
    await sb
      .from("notice_events")
      .insert(events.map((e) => ({ notice_id: e.noticeId, kind: e.kind, surface: e.surface })));
  } catch {
    // Swallow — RLS rejects telemetry for non-live notices; never leak to client.
  }
  return new NextResponse(null, { status: 204 });
}
