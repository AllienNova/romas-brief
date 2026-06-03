// =====================================================================
// GET /api/notices/board · NoticeBoard v2 (NB-4)
// Serves the BoardPayload (selection engine over live notices). 60s cache +
// `notices-board` tag (revalidated on publish/expire/approve via
// /api/internal/revalidate-board). The homepage RSC calls getBoard() directly;
// this route exists for client/archive surfaces + cache-tag participation.
// =====================================================================
import { NextResponse } from "next/server";
import { getBoard } from "@/lib/notice-board/get-board";

export const revalidate = 60;

export async function GET() {
  const board = await getBoard();
  return NextResponse.json(board, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
