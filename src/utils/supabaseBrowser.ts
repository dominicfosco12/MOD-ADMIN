import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";
// If you have the generated type, use it. Otherwise fallback to any.
// import type { Database } from "@/types/supabase";
type Database = any;

/** Browser-side Supabase client (for client components). */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) {
    throw new Error("Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)");
  }
  return _createBrowserClient<Database>(url, anon);
}

export const createBrowserSupabaseClient = createClient;
export default createClient;
