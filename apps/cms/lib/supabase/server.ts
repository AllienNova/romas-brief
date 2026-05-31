// =====================================================================
// apps/cms/lib/supabase/server.ts · ROMAS Wire
// R-114 (remediation-plan M1) · D-026 close · /team-build M1-closeout cycle
// Anchors: @supabase/ssr@0.10.3 createServerClient (per official docs
//   fetched 2026-05-22 via context7 /supabase/ssr). ADR-0015 v2 closed-CVE
//   constraint: Auth runs at the Server Component layer ONLY — NOT in
//   Next middleware (closes GHSA-f82v-jwr5-mffw CVE class by construction).
// Depends: @supabase/ssr@0.10.3 · @supabase/supabase-js@2.106.1
// =====================================================================
//
// Server Component client factory. Use from any server component or
// server action that needs to read auth state.
//
//   import { createServerSupabaseClient } from "@/lib/supabase/server";
//
//   export default async function Page() {
//     const supabase = await createServerSupabaseClient();
//     const { data: { user } } = await supabase.auth.getUser();
//     return user ? <Dashboard user={user} /> : <SignIn />;
//   }
//
// Cookie writes are NOT supported from Server Components (Next 14 + React
// Server Components limitation). For routes that need to write auth
// cookies (sign-in, sign-out, password recovery), use the route-handler
// factory in `./route.ts` instead.
//
// Environment variable convention: this scaffold uses unprefixed
// SUPABASE_URL + SUPABASE_ANON_KEY because Auth flows in ROMAS Wire are
// fully server-rendered per ADR-0015 v2. The anon key never reaches the
// browser bundle. If a future cycle adds client-side auth state hydration,
// add NEXT_PUBLIC_* duplicates and update the factory references here.

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function createServerSupabaseClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

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
      // setAll deliberately omitted: cookies cannot be set from Server
      // Components in Next 14. Use ./route.ts factory for routes that
      // need to mutate auth cookies.
    },
  });
}
