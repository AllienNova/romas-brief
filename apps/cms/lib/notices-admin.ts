// =====================================================================
// notices-admin.ts — admin data layer for NoticeBoard (§14). Reads notices
// across ALL statuses (the reader's RLS is published-only; admin reads run as
// the authed editor/admin session). The `notices` table isn't in the CMS
// generated Database types yet, so queries cast through SupabaseClient — same
// TODO(gen-types) pattern as the reader's get-board. Every path degrades to an
// empty/null result on error or missing env (never throws to the page).
// =====================================================================
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "./supabase/server";

export interface AdminNotice {
  id: string;
  type: string;
  title: string;
  summary: string;
  status: string;
  priority: string;
  is_sponsored: boolean;
  publish_at: string | null;
  expires_at: string | null;
  sponsor_id: string | null;
  sponsor_disclosure: string | null;
  approved_by: string | null;
  conference_key: string | null;
  cta_label: string | null;
  cta_url: string | null;
  updated_at: string | null;
}

const COLUMNS =
  "id,type,title,summary,status,priority,is_sponsored,publish_at,expires_at,sponsor_id,sponsor_disclosure,approved_by,conference_key,cta_label,cta_url,updated_at";

export async function listNotices(): Promise<AdminNotice[]> {
  try {
    const sb = (await createServerSupabaseClient()) as unknown as SupabaseClient;
    const { data, error } = await sb
      .from("notices")
      .select(COLUMNS)
      .order("updated_at", { ascending: false })
      .limit(200)
      .returns<AdminNotice[]>();
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getNotice(id: string): Promise<AdminNotice | null> {
  try {
    const sb = (await createServerSupabaseClient()) as unknown as SupabaseClient;
    const { data } = await sb
      .from("notices")
      .select(COLUMNS)
      .eq("id", id)
      .single<AdminNotice>();
    return data ?? null;
  } catch {
    return null;
  }
}
