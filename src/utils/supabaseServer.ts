import { cookies } from "next/headers";
import { createServerClient as _createServerClient } from "@supabase/ssr";
// If you have a generated Database type, import it; otherwise keep `any`.
type Database = any;

/**
 * Server-side Supabase client for Next App Router (Next 15+ with async cookies()).
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) {
    throw new Error(
      "Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)"
    );
  }

  // Next 15+ returns a Promise here
  const cookieStore = await cookies();

  return _createServerClient<Database>(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: any) {
        cookieStore.set(name, value, options);
      },
      remove(name: string) {
        cookieStore.delete(name);
      },
    },
  });
}

export const createServerSupabaseClient = createClient;
export default createClient;
