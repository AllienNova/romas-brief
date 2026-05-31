// =====================================================================
// apps/cms/components/AudioQAChecklist.tsx · ROMAS Wire · SHIP-10
// Renders the 5-condition publish gate as accessible pass/fail rows with
// the actual measured value. allPass drives whether the operator may
// publish. Gate logic is imported from lib/audio-qa-gate.ts (shared with
// the route handler) so UI and server agree by construction.
//
// Accessibility: each row carries a text status word ("Pass"/"Blocked")
// and aria-label — color and the check/cross glyph are never the sole
// signal. No emojis (brand rule).
// =====================================================================

import { evaluatePublishGate, type AudioJobRow } from "@/lib/audio-qa-gate";

export function AudioQAChecklist({ job }: { job: AudioJobRow }) {
  const { conditions, allPass, failed } = evaluatePublishGate(job);

  return (
    <section aria-labelledby="qa-gate-heading" className="rounded-lg border border-neutral-200">
      <h2
        id="qa-gate-heading"
        className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold tracking-tight"
      >
        Publish gate (5 conditions)
      </h2>

      <ul className="divide-y divide-neutral-100">
        {conditions.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900">{c.label}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{c.detail}</p>
            </div>
            <span
              aria-label={c.pass ? "Pass" : "Blocked"}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                c.pass ? "bg-[#D5F2F5] text-[#006B7A]" : "bg-red-50 text-[#B91C1C]"
              }`}
            >
              <span aria-hidden="true">{c.pass ? "✓" : "✗"}</span>
              {c.pass ? "Pass" : "Blocked"}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-neutral-200 px-4 py-3">
        {allPass ? (
          <p role="status" className="text-sm font-medium text-[#006B7A]">
            All conditions pass. This audio job can be published.
          </p>
        ) : (
          <div role="status" className="text-sm text-[#B91C1C]">
            <p className="font-medium">
              Publish blocked. {failed.length} of {conditions.length}{" "}
              {failed.length === 1 ? "condition" : "conditions"} not met:
            </p>
            <ul className="mt-1 list-inside list-disc text-xs text-neutral-600">
              {conditions
                .filter((c) => !c.pass)
                .map((c) => (
                  <li key={c.id}>{c.label}</li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export default AudioQAChecklist;
