"use server";

import { createActionClient } from "@/utils/supabaseServer";

export async function createFirm(payload: {
  name: string;
  contact_email?: string | null;
  website?: string | null;
  is_active?: boolean;
  roles?: string[];
}) {
  const sb = await createActionClient();

  const { data, error } = await sb
    .from("mod_firm")
    .insert({
      name: payload.name,
      contact_email: payload.contact_email ?? null,
      website: payload.website ?? null,
      is_active: payload.is_active ?? true,
    })
    .select("id,name,contact_email,website,is_active,created_at")
    .single();
  if (error) throw error;

  if (payload.roles?.length) {
    const rows = payload.roles.map((role) => ({ firm_id: data.id, role }));
    const { error: rErr } = await sb.from("firm_roles").insert(rows);
    if (rErr) throw rErr;
  }

  return data;
}

export async function updateFirm(firmId: string, patch: {
  name?: string;
  contact_email?: string | null;
  website?: string | null;
  is_active?: boolean;
}) {
  const sb = await createActionClient();
  const { error } = await sb.from("mod_firm").update(patch).eq("id", firmId);
  if (error) throw error;
  return true;
}

export async function setFirmRoles(firmId: string, roles: string[]) {
  const sb = await createActionClient();

  const { data: existing = [], error: selErr } = await sb
    .from("firm_roles").select("role").eq("firm_id", firmId);
  if (selErr) throw selErr;

  const before = new Set((existing as { role: string }[]).map((x) => x.role));
  const after = new Set(roles);

  const toAdd = [...after].filter((x) => !before.has(x));
  const toRemove = [...before].filter((x) => !after.has(x));

  if (toRemove.length) {
    const { error: delErr } = await sb
      .from("firm_roles")
      .delete()
      .eq("firm_id", firmId)
      .in("role", toRemove);
    if (delErr) throw delErr;
  }

  if (toAdd.length) {
    const rows = toAdd.map((role) => ({ firm_id: firmId, role }));
    const { error: insErr } = await sb.from("firm_roles").insert(rows);
    if (insErr) throw insErr;
  }

  return true;
}
