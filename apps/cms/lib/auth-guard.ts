// =====================================================================
// auth-guard.ts — server-side RBAC guard for NoticeBoard admin (§14). Reads the
// signed-in user's role from Supabase auth app_metadata (the trusted, server-set
// claim — never a client-supplied value) and checks it against the hierarchy.
// All admin routes call requireRole() server-side; client role claims are never
// trusted. Returns null (not throw) so pages render a graceful access state.
// =====================================================================
import { createServerSupabaseClient } from "./supabase/server";
import { hasRole, isRole, type Role } from "./rbac";

export interface AuthContext {
  userId: string;
  role: Role;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const sb = await createServerSupabaseClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return null;
    const raw = (user.app_metadata as { role?: unknown } | null)?.role;
    return { userId: user.id, role: isRole(raw) ? raw : "viewer" };
  } catch {
    return null;
  }
}

/** Returns the auth context iff the user meets `required`, else null. */
export async function requireRole(required: Role): Promise<AuthContext | null> {
  const ctx = await getAuthContext();
  return ctx && hasRole(ctx.role, required) ? ctx : null;
}
