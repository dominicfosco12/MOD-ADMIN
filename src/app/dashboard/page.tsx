// src/app/dashboard/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function DashboardPage() {
  const cookieStore = await cookies(); // ✅ FIXED: Await this!

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set() {}, // no-op in RSC
        remove() {}, // no-op in RSC
      }
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="text-white min-h-screen flex flex-col items-center justify-center text-center">
      {user ? (
        <>
          <h1 className="text-2xl font-bold mb-2">Welcome to MOD Dashboard</h1>
          <p className="text-sm text-gray-400">Logged in as: <span className="text-blue-400">{user.email}</span></p>
        </>
      ) : (
        <p className="text-red-500 text-sm">You are not logged in.</p>
      )}
    </main>
  );
}
