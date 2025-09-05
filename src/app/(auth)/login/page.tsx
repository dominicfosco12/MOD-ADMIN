"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient as createBrowserSupabase } from "@/utils/supabaseBrowser";
import { Mail, Lock, LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserSupabase();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* hero logo (small, crisp) */}
      <div className="mb-5 grid place-items-center">
        <div className="relative">
          <img
            src="/MODadmin.png"
            alt="MOD Administrator Portal"
            className="mx-auto w-[260px] max-w-full object-contain"
          />
          <div className="pointer-events-none absolute inset-x-0 -bottom-1 mx-auto h-6 w-1/2 rounded-full blur-xl bg-cyan-500/10" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-6 shadow-2xl backdrop-blur">
        <h1 className="text-base font-semibold leading-tight">Sign in</h1>
        <p className="mt-1 text-[11px] text-neutral-400">Use your MOD admin credentials</p>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <label className="block text-sm">
            <span className="mb-1.5 block text-neutral-300">Email</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@modfintech.com"
                className="w-full rounded-xl bg-neutral-900/70 border border-white/10 py-2.5 pl-9 pr-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-neutral-300">Password</span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-neutral-900/70 border border-white/10 py-2.5 pl-9 pr-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={pending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white py-2.5 text-sm font-medium hover:opacity-95 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
