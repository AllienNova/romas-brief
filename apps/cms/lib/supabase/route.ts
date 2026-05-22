// =====================================================================
// apps/cms/lib/supabase/route.ts · ROMAS Brief
// R-114 (remediation-plan M1) · D-026 close · /team-build M1-closeout cycle
// Anchors: @supabase/ssr@0.10.3 createServerClient with full getAll/setAll
//   cookie adapter (per official docs fetched 2026-05-22 via context7).
// =====================================================================
//
// Route Handler client factory. Use from any route handler under
// `app/api/**/route.ts` that needs to read OR write auth cookies
// (sign-in form POST, sign-out, password recovery callback, OAuth
// callback, magic-link verification).
//
//   import { createRouteSupabaseClient } from "@/lib/supabase/route";
//
//   export async function POST(request: Request) {
//     const supabase = createRouteSupabaseClient();
//     const formData = await request.formData();
//     const { error } = await supabase.auth.signInWithPassword({
//       email: String(formData.get("email") ?? ""),
//       password: String(formData.get("password") ?? ""),
//     });
//     if (error) return Response.redirect("/sign-in?error=invalid", 303);
//     return Response.redirect("/", 303);
//   }
//
// Unlike the Server Component factory, Route Handlers CAN write cookies
// (cookies().set() is allowed inside route handlers per Next 14 App
// Router rules). The full getAll + setAll adapter shape lets @supabase/ssr
// rotate refresh tokens transparently.

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

export function createRouteSupabaseClient(): SupabaseClient<Database> {
  const cookieStore = cookies();

  const supabaseUrl = process.env["SUPABASE_URL"];
  const supabaseAnonKey = process.env["SUPABASE_ANON_KEY"];

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables. " +
        "See .env.example for the manifest; secrets live in Cloudflare " +
        "Worker Secrets in production (NOT in .env).",
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
