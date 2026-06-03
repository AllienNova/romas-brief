// =====================================================================
// POST /api/internal/revalidate-board · NoticeBoard v2 (NB-4/§7)
// On-demand invalidation of the `notices-board` cache tag so an editor
// publish/expire/approve (or the scheduler, NB-5) updates the homepage within
// seconds instead of on the next 60s TTL. Guarded by a shared bearer secret
// (constant-time compared); 503 until ROMAS_REVALIDATE_SECRET is configured.
// =====================================================================
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function POST(req: Request): Promise<NextResponse> {
  const secret = process.env["ROMAS_REVALIDATE_SECRET"];
  if (!secret) {
    return NextResponse.json({ error: "revalidation not configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!constantTimeEqual(provided, secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  revalidateTag("notices-board");
  return NextResponse.json({ revalidated: true, tag: "notices-board" });
}
