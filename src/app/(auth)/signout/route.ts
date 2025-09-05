import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabaseServer";

function to(path: string) {
  return new URL(path, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
}

export async function GET() {
  const supabase = await createClient();
  await supabase.auth.signOut();            // clear session cookies
  return NextResponse.redirect(to("/login"));
}

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(to("/login"));
}
