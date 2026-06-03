// =====================================================================
// rbac.ts — NoticeBoard admin role hierarchy (spec §14). Pure + testable.
// viewer < editor < sponsor_manager < admin.
//   editor          — create/edit/schedule editorial notices
//   sponsor_manager — + manage sponsors, approve sponsored notices
//   admin           — + feature flags (full-width, rotation)
// The server-side guard (reads the signed-in user's role) lives in
// auth-guard.ts; this module has zero server imports so it unit-tests in node.
// =====================================================================
export const ROLES = ["viewer", "editor", "sponsor_manager", "admin"] as const;
export type Role = (typeof ROLES)[number];

const RANK: Record<Role, number> = {
  viewer: 0,
  editor: 1,
  sponsor_manager: 2,
  admin: 3,
};

export function isRole(v: unknown): v is Role {
  return typeof v === "string" && (ROLES as readonly string[]).includes(v);
}

/** True when `actual` meets or exceeds `required` in the hierarchy. */
export function hasRole(actual: Role | null | undefined, required: Role): boolean {
  if (!actual) return false;
  return RANK[actual] >= RANK[required];
}

/** Editorial create/edit/schedule needs editor+. */
export function canEditNotices(role: Role | null | undefined): boolean {
  return hasRole(role, "editor");
}

/** Approving a sponsored notice for publish needs sponsor_manager+ (§11/§14). */
export function canApproveSponsored(role: Role | null | undefined): boolean {
  return hasRole(role, "sponsor_manager");
}

/** Feature flags (full-width, rotation) are admin-only (§14). */
export function canManageFlags(role: Role | null | undefined): boolean {
  return hasRole(role, "admin");
}
