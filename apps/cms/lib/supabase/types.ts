// =====================================================================
// apps/cms/lib/supabase/types.ts · ROMAS Brief
// R-114 (remediation-plan M1) · D-026 close · /team-build M1-closeout cycle
// Anchors: @supabase/ssr 0.10.3 generic SupabaseClient<Database> · Supabase
//   docs "Generating types" guide. Regenerate after every migration via:
//     supabase gen types typescript --linked > apps/cms/lib/supabase/types.ts
// =====================================================================
//
// Placeholder Database type until the live Supabase project is provisioned
// and `supabase gen types typescript --linked` can run. Once the project is
// linked, this file is fully overwritten by the generated types — DO NOT
// hand-edit the row/insert/update shapes here.
//
// The `Json` type and the empty `public` schema scaffolding match the
// shape `supabase gen types` produces so swapping the file in does not
// require import-site changes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
