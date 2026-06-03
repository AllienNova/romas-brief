// =====================================================================
// GET /api/notices/board · NoticeBoard v2 (NB-4 / review arch C-1)
// Serves the BoardPayload. getBoard() is unstable_cache(60s, tag
// 'notices-board'), so revalidateTag invalidates this route's data too.
// No manual s-maxage header: a separate CDN cache would NOT observe the tag
// invalidation and could serve a stale board after publish/approve.
// =====================================================================
import { NextResponse } from "next/server";
import { getBoard } from "@/lib/notice-board/get-board";

export const revalidate = 60;

export async function GET() {
  const board = await getBoard();
  return NextResponse.json(board);
}
