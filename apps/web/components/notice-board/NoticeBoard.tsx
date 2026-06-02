// =====================================================================
// NoticeBoard — RSC shell for the v2 board (spec §4). Composes the header +
// grid over a BoardPayload produced by the pure selectBoard() engine.
//
// Data: mock today (NB-3). NB-4 replaces the selectBoard(MOCK…) call with a
// cached `GET /api/notices/board` fetch + error boundary + static fallback.
// The render shape stays identical, so NB-4 is a one-line swap.
// =====================================================================
import "./notice-board.styles.css";
import { selectBoard } from "@/lib/notice-board/select-board";
import { MOCK_NOTICES, MOCK_SLOTS } from "./mock-notices";
import { NoticeBoardHeader } from "./NoticeBoardHeader";
import { NoticeGrid } from "./NoticeGrid";

export default function NoticeBoard() {
  const board = selectBoard(MOCK_NOTICES, MOCK_SLOTS, new Date());
  return (
    <section
      aria-label="Notice board"
      className="rounded-2xl border p-6 sm:p-7"
      style={{ background: "var(--rb-bg-page)", borderColor: "var(--rb-border-subtle)" }}
    >
      <NoticeBoardHeader />
      <NoticeGrid board={board} />
    </section>
  );
}
