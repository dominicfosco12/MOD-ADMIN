import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// RSC-safe client: use in page/layout/server components (no cookie writes)
export async function createRSCClient() {
  const store = await cookies(); // <- async in Next 15

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        // writes are no-op in RSC
        set(_name: string, _value: string, _opts: CookieOptions) {},
        remove(_name: string, _opts: CookieOptions) {},
      },
    }
  );
}

// Action/Route client: ONLY use in "use server" actions or route handlers
export async function createActionClient() {
  const store = await cookies(); // <- async in Next 15

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          store.set({ name, value, ...options } as any);
        },
        remove(name: string, _opts: CookieOptions) {
          store.delete(name);
        },
      },
    }
  );
}
