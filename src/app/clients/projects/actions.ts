"use server";

import { createRSCClient } from "@/utils/supabaseServer";

/**
 * Server-side connectivity test to a client project using its anon key.
 */
export async function testConnection(projectId: string): Promise<boolean> {
  const admin = await createRSCClient();

  const { data, error } = await admin
    .from("client_projects")
    .select("supabase_url, supabase_anon_key")
    .eq("id", projectId)
    .single();

  if (error || !data) return false;

  const { supabase_url, supabase_anon_key } = data;

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);

    const res = await fetch(`${supabase_url}/rest/v1/`, {
      method: "HEAD",
      headers: {
        apikey: supabase_anon_key,
        Authorization: `Bearer ${supabase_anon_key}`,
      },
      cache: "no-store",
      signal: ctrl.signal,
    });

    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}
