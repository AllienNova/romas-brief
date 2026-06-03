"use client";
// =====================================================================
// NoticeBoardBoundary — render-time error boundary for the grid (review M-3 /
// spec §2). getBoard() already guards DATA failures with a static fallback;
// this catches RENDER failures (e.g. a motion hydration error) so a broken
// grid degrades to a quiet line instead of taking the homepage down.
// =====================================================================
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export class NoticeBoardBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown): void {
    console.error("[NoticeBoard] render error:", error);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <p className="text-sm" style={{ color: "var(--rb-text-tertiary)" }}>
          Notices are temporarily unavailable.
        </p>
      );
    }
    return this.props.children;
  }
}
