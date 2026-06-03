// =====================================================================
// NoticeBoard — RSC shell for the v2 board (spec §4). Async: awaits the
// cached getBoard() (Supabase published rows → selectBoard, with a static
// fallback so it never renders empty/broken — NB-4). Composes header + grid.
// =====================================================================
import "./notice-board.styles.css";
import { getBoard } from "@/lib/notice-board/get-board";
import { NoticeBoardHeader } from "./NoticeBoardHeader";
import { NoticeGrid } from "./NoticeGrid";

export default async function NoticeBoard() {
  const board = await getBoard();
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
