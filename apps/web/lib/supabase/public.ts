/**
 * apps/web/lib/supabase/public.ts · ROMAS Wire
 * T-302 Reader app
 *
 * Public (anon-key) Supabase client for the reader web app.
 * Only reads from tables with public SELECT RLS policies:
 *   - articles (status = 'published')
 *   - audio_jobs (audio_status = 'published')
 *
 * Environment variables (server-side; the publishable key is never bundled
 * into client JS — reads happen in Server Components per ADR-0015):
 *   SUPABASE_URL       — Supabase project URL (https://<ref>.supabase.co)
 *   SUPABASE_ANON_KEY  — Supabase publishable key (new sb_publishable_… format)
 */

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function createPublicSupabaseClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env["SUPABASE_URL"];
  const anonKey = process.env["SUPABASE_ANON_KEY"];

  if (!supabaseUrl || !anonKey) {
    // In development/preview, return a no-op client so the app renders
    // with mock data without crashing when env vars are not set.
    if (process.env["NODE_ENV"] !== "production") {
      console.warn(
        "[ROMAS Wire] SUPABASE_URL or SUPABASE_ANON_KEY not set. " +
          "The app will render with mock data. Set these in .env.",
      );
      return {
        from: () => ({
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: [], error: null }),
                single: () => Promise.resolve({ data: null, error: { message: "No DB" } }),
              }),
              single: () => Promise.resolve({ data: null, error: { message: "No DB" } }),
              in: () => ({
                order: () => ({
                  limit: () => Promise.resolve({ data: [], error: null }),
                }),
              }),
            }),
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        }),
      } as unknown as SupabaseClient<Database>;
    }

    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_ANON_KEY. " +
        "Set these in the deploy environment (Cloudflare Pages / Vercel).",
    );
  }

  return createClient<Database>(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
