/**
 * apps/web/lib/supabase/public.ts · ROMAS Brief
 * T-302 Reader app
 *
 * Public (anon-key) Supabase client for the reader web app.
 * Only reads from tables with public SELECT RLS policies:
 *   - articles (status = 'published')
 *   - audio_jobs (audio_status = 'published')
 *
 * Environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL       — Supabase project URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  — Supabase anon key
 */

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function createPublicSupabaseClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const anonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

  if (!supabaseUrl || !anonKey) {
    // In development/preview, return a no-op client so the app renders
    // with mock data without crashing when env vars are not set.
    if (process.env["NODE_ENV"] !== "production") {
      console.warn(
        "[ROMAS Brief] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set. " +
          "The app will render with mock data. Set these in .env.local.",
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
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Set these in your Vercel environment variables.",
    );
  }

  return createClient<Database>(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
