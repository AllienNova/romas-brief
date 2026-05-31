"use client";

/**
 * FromTheEditor — Daily editorial note with embedded Practice Delta callout.
 * Sits in the left column below the hero article card.
 * Modelled on NEJM Evidence, STAT News, and The BMJ editorial voice cards.
 */

import Link from "next/link";
import { BoltMark } from "./icons";

interface PracticeDelta {
  category: string;
  text: string;
  href?: string;
}

interface EditorNote {
  date: string;
  editorName: string;
  editorTitle: string;
  editorInitials: string;
  note: string;
  deltas: PracticeDelta[];
  readMoreHref?: string;
}

// Today's editorial note — in production this would come from a CMS/API
const TODAY_NOTE: EditorNote = {
  date: "Thursday, May 28, 2026",
  editorName: "Dr. R. Honour",
  editorTitle: "Editor-in-Chief, ROMAS Wire",
  editorInitials: "RH",
  note: `This week's brief is dominated by two converging forces: the maturation of FLASH proton therapy from bench to Phase II clinical evidence, and the regulatory machinery catching up with AI-driven contouring. The SABR-COMET-3 result for oligometastatic liver disease is the most practice-changing finding in SBRT in three years — read it carefully. The ASTRO MR-Linac guideline also lands with teeth: daily online adaptation is now a recommendation, not an aspiration.`,
  deltas: [
    {
      category: "Clinical RT",
      text: "SBRT for oligometastatic liver disease now carries Level I evidence for OS benefit (SABR-COMET-3).",
      href: "/article/sbrt-liver-metastases-phase-iii-results",
    },
    {
      category: "Guidelines",
      text: "ASTRO now recommends daily online adaptation for all MR-Linac prostate cancer patients.",
      href: "/article/mr-linac-adaptive-rt-prostate-astro-guideline",
    },
    {
      category: "Regulatory",
      text: "FDA 510(k) clearance for AI head-and-neck OAR contouring — mean DSC 0.89 across 14 structures.",
      href: "/article/ai-auto-contouring-head-neck-fda-clearance",
    },
  ],
  readMoreHref: "/about/how-it-works",
};

export default function FromTheEditor() {
  const note = TODAY_NOTE;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--rb-bg-surface)",
        border: "1px solid var(--rb-border-subtle)",
        boxShadow: "var(--rb-shadow-card)",
      }}
    >
      {/* Header bar */}
      <div
        className="px-6 py-3 flex items-center gap-3"
        style={{
          background: "linear-gradient(90deg, #001D3D 0%, #003366 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em" }}
        >
          From the Editor
        </span>
        <span
          className="ml-auto text-xs"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {note.date}
        </span>
      </div>

      <div className="p-6">
        {/* Editor identity */}
        <div className="flex items-center gap-3 mb-5">
          {/* Initials avatar */}
          <div
            className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #0066CC 0%, #0F766E 100%)" }}
          >
            {note.editorInitials}
          </div>
          <div>
            <p
              className="text-sm font-semibold leading-tight"
              style={{ color: "var(--rb-text-primary)" }}
            >
              {note.editorName}
            </p>
            <p
              className="text-xs leading-tight mt-0.5"
              style={{ color: "var(--rb-text-tertiary)" }}
            >
              {note.editorTitle}
            </p>
          </div>
        </div>

        {/* Editorial note */}
        <p
          className="text-sm leading-relaxed mb-6"
          style={{ color: "var(--rb-text-secondary)", fontStyle: "italic" }}
        >
          &ldquo;{note.note}&rdquo;
        </p>

        {/* Practice Delta callout */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--rb-bg-raised)",
            border: "1px solid var(--rb-border-subtle)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{
                background: "linear-gradient(90deg, #0066CC18 0%, #0F766E18 100%)",
                color: "#0066CC",
                border: "1px solid #0066CC30",
                letterSpacing: "0.1em",
              }}
            >
              <BoltMark size={12} className="mr-1" /> Practice Deltas This Week
            </span>
          </div>
          <ul className="space-y-3">
            {note.deltas.map((delta, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 mt-0.5 text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--rb-bg-surface)",
                    color: "var(--rb-text-tertiary)",
                    border: "1px solid var(--rb-border-subtle)",
                    fontSize: "10px",
                    letterSpacing: "0.05em",
                  }}
                >
                  {delta.category.toUpperCase()}
                </span>
                {delta.href ? (
                  <Link
                    href={delta.href}
                    className="text-sm leading-snug hover:underline transition-colors"
                    style={{ color: "var(--rb-text-primary)" }}
                  >
                    {delta.text}
                  </Link>
                ) : (
                  <span
                    className="text-sm leading-snug"
                    style={{ color: "var(--rb-text-primary)" }}
                  >
                    {delta.text}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer link */}
        {note.readMoreHref && (
          <div className="mt-4 flex items-center justify-end">
            <Link
              href={note.readMoreHref}
              className="text-xs font-semibold transition-colors hover:opacity-80"
              style={{ color: "var(--rb-accent)" }}
            >
              How we score & curate →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
