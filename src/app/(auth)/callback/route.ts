import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabaseServer";

function to(path: string) {
  return new URL(path, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      return NextResponse.redirect(to("/login?error=callback"));
    }
  }

  return NextResponse.redirect(to(next));
}
