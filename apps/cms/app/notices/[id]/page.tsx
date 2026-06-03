// =====================================================================
// apps/cms/app/notices/[id]/page.tsx · NoticeBoard admin detail (NB-7 / §14)
// Server component, RBAC-guarded (editor+). Shows the notice, a quarantine-aware
// preview (sponsored → Partner Message label + disclosure), and the sponsor
// approval gate: a sponsored notice in pending_review can be approved only by a
// sponsor_manager+ (sets approved_by + moves it to scheduled, per §10/§11). The
// approval server action re-checks the role server-side — client claims are
// never trusted. Full edit-form CRUD + schedule picker is the BLOCKED remainder
// (needs the gen-types + live auth to build/verify safely).
// =====================================================================
import Link from "next/link";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/auth-guard";
import { getNotice } from "@/lib/notices-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function approveSponsored(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("id") ?? "");
  const ctx = await requireRole("sponsor_manager");
  if (!ctx || !id) return; // RBAC: only sponsor_manager+ may approve
  try {
    const sb = (await createServerSupabaseClient()) as unknown as SupabaseClient;
    await sb
      .from("notices")
      .update({ approved_by: ctx.userId, status: "scheduled" })
      .eq("id", id)
      .eq("is_sponsored", true)
      .eq("status", "pending_review");
    revalidatePath(`/notices/${id}`);
  } catch {
    // swallow — RLS/constraint rejection surfaces nothing to the operator here
  }
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="border-b border-neutral-100 py-2">
      <dt className="text-xs uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-neutral-900">{value ?? "—"}</dd>
    </div>
  );
}

export default async function NoticeDetail(props: { params: Promise<{ id: string }> }) {
  const ctx = await requireRole("editor");
  if (!ctx) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-6 py-10">
        <p className="text-sm font-medium text-neutral-700">Editor access required.</p>
      </main>
    );
  }

  const { id } = await props.params;
  const notice = await getNotice(id);

  if (!notice) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-6 py-10">
        <Link href={"/notices" as Route} className="text-sm text-[#006B7A] hover:underline">
          ← Notices
        </Link>
        <p className="mt-6 text-sm text-neutral-600">Notice not found (or DB not provisioned).</p>
      </main>
    );
  }

  const awaitingApproval = notice.is_sponsored && notice.status === "pending_review";
  const canApprove = ctx.role === "sponsor_manager" || ctx.role === "admin";

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-10">
      <Link href={"/notices" as Route} className="text-sm text-[#006B7A] hover:underline">
        ← Notices
      </Link>

      <header className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          {notice.type}
          {notice.is_sponsored && " · Partner Message · Sponsored"}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">{notice.title}</h1>
        <p className="mt-2 text-sm text-neutral-600">{notice.summary}</p>
      </header>

      {/* Quarantine-aware preview note */}
      {notice.is_sponsored && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Sponsored — firewalled from editorial
          </p>
          <p className="mt-1 text-sm text-amber-900">
            {notice.sponsor_disclosure ?? "Disclosure missing — cannot publish without it."}
          </p>
        </div>
      )}

      <dl className="mt-6">
        <Field label="Status" value={notice.status} />
        <Field label="Priority" value={notice.priority} />
        <Field label="Publish at" value={notice.publish_at} />
        <Field label="Expires at" value={notice.expires_at} />
        <Field label="CTA" value={notice.cta_label ? `${notice.cta_label} → ${notice.cta_url ?? ""}` : null} />
        <Field label="Conference key" value={notice.conference_key} />
        <Field label="Approved by" value={notice.approved_by} />
      </dl>

      {awaitingApproval && (
        <section className="mt-8 rounded-lg border border-neutral-200 p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Sponsor approval</h2>
          <p className="mt-1 text-xs text-neutral-500">
            A sponsored notice must be approved by a sponsor_manager before it can be scheduled (§11).
          </p>
          {canApprove ? (
            <form action={approveSponsored} className="mt-3">
              <input type="hidden" name="id" value={notice.id} />
              <button
                type="submit"
                className="rounded-lg bg-[#006B7A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#005561] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B7A]"
              >
                Approve &amp; schedule
              </button>
            </form>
          ) : (
            <p className="mt-3 text-sm text-neutral-600">
              Your role ({ctx.role}) cannot approve sponsored notices — requires sponsor_manager.
            </p>
          )}
        </section>
      )}

      <p className="mt-8 text-xs text-neutral-400">
        Edit form + schedule picker (tz) land with the gen-types + live-auth pass (NB-7 remainder).
      </p>
    </main>
  );
}
