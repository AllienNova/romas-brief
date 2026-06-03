// =====================================================================
// NoticeBoard — RSC shell for the v2 board (spec §4). Async: awaits the
// cached getBoard() (Supabase published rows → selectBoard, with a static
// fallback so it never renders empty/broken — NB-4). Composes header + grid.
// =====================================================================
import "./notice-board.styles.css";
import { getBoard } from "@/lib/notice-board/get-board";
import { NoticeBoardHeader } from "./NoticeBoardHeader";
import { NoticeGrid } from "./NoticeGrid";
import { NoticeBoardBoundary } from "./NoticeBoardBoundary";
import { NoticeTelemetry } from "./NoticeTelemetry";

export default async function NoticeBoard() {
  const board = await getBoard();
  return (
    <section
      aria-label="Notice board"
      className={`border p-6 sm:p-7 ${board.fullWidth ? "notice-board--full" : "rounded-2xl"}`}
      style={{ background: "var(--rb-bg-page)", borderColor: "var(--rb-border-subtle)" }}
    >
      <div className={board.fullWidth ? "mx-auto max-w-7xl px-4 sm:px-6" : undefined}>
        <NoticeBoardHeader />
        <NoticeBoardBoundary>
          <NoticeGrid board={board} />
        </NoticeBoardBoundary>
        <NoticeTelemetry surface="homepage" />
      </div>
    </section>
  );
}
