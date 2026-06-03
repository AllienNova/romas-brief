// =====================================================================
// apps/cms/app/notices/page.tsx · NoticeBoard admin list (NB-7 / §14)
// Server component, RBAC-guarded (editor+). Lists notices across all statuses,
// grouped, with a sponsored marker. RLS + auth gate the data; with no session
// or no DB env it degrades to the access/empty state and never throws.
// =====================================================================
import Link from "next/link";
import type { Route } from "next";
import { requireRole } from "@/lib/auth-guard";
import { listNotices, type AdminNotice } from "@/lib/notices-admin";

export const dynamic = "force-dynamic";

const STATUS_ORDER = ["pending_review", "scheduled", "published", "draft", "expired", "archived"];
const STATUS_LABEL: Record<string, string> = {
  pending_review: "Pending review",
  scheduled: "Scheduled",
  published: "Published",
  draft: "Draft",
  expired: "Expired",
  archived: "Archived",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-neutral-600">
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function NoticeRow({ notice }: { notice: AdminNotice }) {
  return (
    <li>
      <Link
        href={`/notices/${notice.id}` as Route}
        className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B7A]"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-900">{notice.title}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-neutral-500">
            {notice.type}
            {notice.is_sponsored && " · Sponsored"}
            {notice.is_sponsored && !notice.approved_by && " · awaiting approval"}
          </p>
        </div>
        <StatusBadge status={notice.status} />
      </Link>
    </li>
  );
}

function AccessDenied() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Notice Board admin</h1>
      <div className="mt-6 rounded-lg border border-dashed border-neutral-200 px-4 py-8 text-center">
        <p className="text-sm font-medium text-neutral-700">Editor access required</p>
        <p className="mt-1 text-xs text-neutral-500">
          Sign in with an editor, sponsor_manager, or admin role. Access is gated by Cloudflare
          Access + Supabase auth (server-side; client role claims are not trusted).
        </p>
      </div>
    </main>
  );
}

export default async function NoticesAdmin() {
  const ctx = await requireRole("editor");
  if (!ctx) return <AccessDenied />;

  const notices = await listNotices();
  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    rows: notices.filter((n) => n.status === status),
  })).filter((g) => g.rows.length > 0);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Notice Board</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">Notices</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Signed in as <span className="font-medium">{ctx.role}</span>. Sponsored notices require a
          sponsor_manager approval before they can be scheduled.
        </p>
      </header>

      {byStatus.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-neutral-200 px-4 py-8 text-center">
          <p className="text-sm font-medium text-neutral-700">No notices yet</p>
          <p className="mt-1 text-xs text-neutral-500">
            If you expected notices here, confirm the DB is provisioned and migration 0015/0016 are applied.
          </p>
        </div>
      ) : (
        byStatus.map((group) => (
          <section key={group.status} className="mt-8">
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
              {STATUS_LABEL[group.status] ?? group.status}
            </h2>
            <ul className="mt-3 space-y-2">
              {group.rows.map((n) => (
                <NoticeRow key={n.id} notice={n} />
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
