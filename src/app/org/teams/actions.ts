"use server";

import { createActionClient } from "@/utils/supabaseServer";

export async function setParent(childId: string, parentId: string | null) {
  const supabase = await createActionClient();

  const { error: delErr } = await supabase
    .from("team_hierarchy")
    .delete()
    .eq("child_id", childId);
  if (delErr) throw delErr;

  if (parentId) {
    const { error: insErr } = await supabase
      .from("team_hierarchy")
      .insert({ child_id: childId, parent_id: parentId });
    if (insErr) throw insErr;
  }
  return true;
}

export async function setMembers(teamId: string, userIds: string[]) {
  const supabase = await createActionClient();

  const { data: existing = [], error: selErr } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("team_id", teamId);
  if (selErr) throw selErr;

  const before = new Set((existing as { user_id: string }[]).map((x) => String(x.user_id)));
  const after = new Set(userIds);

  const toAdd = [...after].filter((x) => !before.has(x));
  const toRemove = [...before].filter((x) => !after.has(x));

  if (toRemove.length) {
    const { error: delErr } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .in("user_id", toRemove);
    if (delErr) throw delErr;
  }

  if (toAdd.length) {
    const payload = toAdd.map((user_id) => ({ team_id: teamId, user_id }));
    const { error: insErr } = await supabase.from("team_members").insert(payload);
    if (insErr) throw insErr;
  }

  return true;
}

/* NEW: rename team */
export async function renameTeam(teamId: string, name: string) {
  const supabase = await createActionClient();
  const { error } = await supabase.from("teams").update({ name }).eq("id", teamId);
  if (error) throw error;
  return true;
}

/* NEW: create team (optional parent) */
export async function createTeam(name: string, parentId?: string | null) {
  const supabase = await createActionClient();

  const { data: created, error } = await supabase
    .from("teams")
    .insert({ name })
    .select("id,name,created_at,firm_id")
    .single();
  if (error) throw error;

  if (parentId) {
    const { error: linkErr } = await supabase
      .from("team_hierarchy")
      .insert({ child_id: created.id, parent_id: parentId });
    if (linkErr) throw linkErr;
  }

  return created; // { id, name, created_at, firm_id }
}
