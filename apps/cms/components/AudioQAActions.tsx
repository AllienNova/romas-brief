"use client";

// =====================================================================
// apps/cms/components/AudioQAActions.tsx · ROMAS Brief · SHIP-10
// Client action bar for the audio QA detail page. POSTs to
// /api/audio-qa/[id]; the route handler re-validates the gate server-side
// (defense-in-depth). Publish is enabled only when the gate passes;
// Skip/Revoke each require a non-empty reason. No emojis (brand rule).
// =====================================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Action = "publish" | "skip" | "revoke";

export function AudioQAActions({
  jobId,
  canPublish,
  status,
}: {
  jobId: string;
  canPublish: boolean;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [skipReason, setSkipReason] = useState("");
  const [revokeReason, setRevokeReason] = useState("");

  const isInReview = status === "in_review";
  const isPublished = status === "published";
  const loading = busy || pending;

  async function submit(action: Action, reason?: string) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/audio-qa/${jobId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(reason ? { action, reason } : { action }),
      });
      const data: { ok?: boolean; failed?: string[]; error?: string } = await res
        .json()
        .catch(() => ({}));

      if (!res.ok || data.ok === false) {
        const detail = data.failed?.length
          ? `Gate failed: ${data.failed.join(", ")}`
          : data.error ?? `Request failed (${res.status})`;
        setMessage({ kind: "error", text: detail });
        return;
      }
      setMessage({ kind: "ok", text: `Action "${action}" applied.` });
      startTransition(() => router.refresh());
    } catch {
      setMessage({ kind: "error", text: "Network error. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <p
          role="status"
          className={`rounded-md px-3 py-2 text-sm ${
            message.kind === "ok"
              ? "bg-[#D5F2F5] text-[#006B7A]"
              : "bg-red-50 text-[#B91C1C]"
          }`}
        >
          {message.text}
        </p>
      )}

      {isInReview && (
        <>
          <div>
            <button
              type="button"
              disabled={!canPublish || loading}
              onClick={() => submit("publish")}
              className="rounded-md bg-[#006B7A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#005562] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B7A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            >
              {loading ? "Working..." : "Publish audio"}
            </button>
            {!canPublish && (
              <p className="mt-1 text-xs text-neutral-500">
                Publish is disabled until all five gate conditions pass.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 p-4">
            <label
              htmlFor="skip-reason"
              className="block text-sm font-medium text-neutral-900"
            >
              Skip this audio job
            </label>
            <textarea
              id="skip-reason"
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              rows={2}
              placeholder="Reason for skipping (required)"
              className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-[#006B7A] focus:outline-none focus:ring-1 focus:ring-[#006B7A]"
            />
            <button
              type="button"
              disabled={loading || skipReason.trim().length === 0}
              onClick={() => submit("skip", skipReason.trim())}
              className="mt-2 rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Skip audio
            </button>
          </div>
        </>
      )}

      {isPublished && (
        <div className="rounded-lg border border-red-200 p-4">
          <label
            htmlFor="revoke-reason"
            className="block text-sm font-medium text-neutral-900"
          >
            Revoke published audio
          </label>
          <p className="mt-1 text-xs text-neutral-500">
            Withdraws audio from the CDN. Requires a reason.
          </p>
          <textarea
            id="revoke-reason"
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            rows={2}
            placeholder="Reason for revocation (required)"
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-[#B91C1C] focus:outline-none focus:ring-1 focus:ring-[#B91C1C]"
          />
          <button
            type="button"
            disabled={loading || revokeReason.trim().length === 0}
            onClick={() => submit("revoke", revokeReason.trim())}
            className="mt-2 rounded-md bg-[#DC2626] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Revoke audio
          </button>
        </div>
      )}

      {!isInReview && !isPublished && (
        <p className="text-sm text-neutral-500">
          No actions available for this status.
        </p>
      )}
    </div>
  );
}

export default AudioQAActions;
