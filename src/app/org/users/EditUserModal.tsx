"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabaseBrowser";
import MultiSelect, { type Option } from "./MultiSelect";

type Row = {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  avatar_url: string | null;
  roles: string[];
  roles_ids: string[];
  teams: string[];
  teams_ids: string[];
  created_at: string;
  created_at_label: string;
};

export default function EditUserModal({
  open,
  row,
  roleOptions,
  teamOptions,
  onClose,
}: {
  open: boolean;
  row: Row | null;                // null => create
  roleOptions: Option[];
  teamOptions: Option[];
  onClose: (updated?: Row) => void;
}) {
  const supabase = createBrowserSupabaseClient();

  const [name, setName] = useState(row?.name ?? "");
  const [email, setEmail] = useState(row?.email ?? "");
  const [isActive, setIsActive] = useState<boolean>(row?.is_active ?? true);
  const [roleIds, setRoleIds] = useState<string[]>(row?.roles_ids ?? []);
  const [teamIds, setTeamIds] = useState<string[]>(row?.teams_ids ?? []);
  const [saving, setSaving] = useState(false);

  // Baselines to compute diffs on update
  const baselineRoleIds = useMemo(() => row?.roles_ids ?? [], [row]);
  const baselineTeamIds = useMemo(() => row?.teams_ids ?? [], [row]);

  useEffect(() => {
    setName(row?.name ?? "");
    setEmail(row?.email ?? "");
    setIsActive(row?.is_active ?? true);
    setRoleIds(row?.roles_ids ?? []);
    setTeamIds(row?.teams_ids ?? []);
  }, [row, open]);

  if (!open) return null;

  const roleNameById = new Map(roleOptions.map((o) => [o.id, o.label]));
  const teamNameById = new Map(teamOptions.map((o) => [o.id, o.label]));

  function close(updated?: Row) {
    onClose(updated);
  }

  const computeDiff = (before: string[], after: string[]) => {
    const beforeSet = new Set(before);
    const afterSet = new Set(after);
    const toAdd = [...afterSet].filter((x) => !beforeSet.has(x));
    const toRemove = [...beforeSet].filter((x) => !afterSet.has(x));
    return { toAdd, toRemove };
  };

  async function save() {
    setSaving(true);
    try {
      let userId = row?.id ?? null;

      if (row) {
        // Update core user fields
        const { error } = await supabase
          .from("users")
          .update({ display_name: name || null, is_active: isActive })
          .eq("id", row.id);
        if (error) throw error;

        // Roles diff
        const { toAdd: addRoles, toRemove: rmRoles } = computeDiff(baselineRoleIds, roleIds);
        if (rmRoles.length) {
          const { error: delErr } = await supabase.from("user_roles").delete().in("role_id", rmRoles).eq("user_id", row.id);
          if (delErr) throw delErr;
        }
        if (addRoles.length) {
          const { error: insErr } = await supabase.from("user_roles").insert(
            addRoles.map((role_id) => ({ user_id: row.id, role_id }))
          );
          if (insErr) throw insErr;
        }

        // Teams diff
        const { toAdd: addTeams, toRemove: rmTeams } = computeDiff(baselineTeamIds, teamIds);
        if (rmTeams.length) {
          const { error: delT } = await supabase.from("team_members").delete().in("team_id", rmTeams).eq("user_id", row.id);
          if (delT) throw delT;
        }
        if (addTeams.length) {
          const { error: insT } = await supabase.from("team_members").insert(
            addTeams.map((team_id) => ({ user_id: row.id, team_id }))
          );
          if (insT) throw insT;
        }

        userId = row.id;
      } else {
        // Create minimal user (adjust flow to your auth model as needed)
        const { data: created, error: createErr } = await supabase
          .from("users")
          .insert({ email, display_name: name || null, is_active: isActive })
          .select("id,email,display_name,is_active,avatar_url,created_at")
          .single();
        if (createErr) throw createErr;

        userId = created.id;

        if (roleIds.length) {
          const { error: insErr } = await supabase
            .from("user_roles")
            .insert(roleIds.map((role_id) => ({ user_id: userId, role_id })));
          if (insErr) throw insErr;
        }
        if (teamIds.length) {
          const { error: insT } = await supabase
            .from("team_members")
            .insert(teamIds.map((team_id) => ({ user_id: userId, team_id })));
          if (insT) throw insT;
        }

        // Prepare update row for table
        const created_at_label = created.created_at
          ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(
              new Date(created.created_at)
            )
          : "";

        const rolesNames = roleIds.map((id) => roleNameById.get(id)!).filter(Boolean);
        const teamsNames = teamIds.map((id) => teamNameById.get(id)!).filter(Boolean);

        close({
          id: userId,
          email: created.email ?? "",
          name: created.display_name ?? null,
          is_active: !!created.is_active,
          avatar_url: created.avatar_url ?? null,
          roles: rolesNames,
          roles_ids: roleIds,
          teams: teamsNames,
          teams_ids: teamIds,
          created_at: created.created_at ?? "",
          created_at_label,
        });
        return;
      }

      // For edits, return updated row for table
      if (userId) {
        const rolesNames = roleIds.map((id) => roleNameById.get(id)!).filter(Boolean);
        const teamsNames = teamIds.map((id) => teamNameById.get(id)!).filter(Boolean);
        close({
          id: userId,
          email: row?.email ?? email,
          name: name || null,
          is_active: isActive,
          avatar_url: row?.avatar_url ?? null,
          roles: rolesNames,
          roles_ids: roleIds,
          teams: teamsNames,
          teams_ids: teamIds,
          created_at: row?.created_at ?? "",
          created_at_label: row?.created_at_label ?? "",
        });
      } else {
        close();
      }
    } catch (e) {
      console.error(e);
      alert("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => close()} />
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-950 p-5 shadow-2xl">
        <h3 className="text-base font-semibold mb-4">{row ? "Edit User" : "Add User"}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-neutral-900/60 border border-white/10 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!row}
              className="w-full rounded-xl bg-neutral-900/60 border border-white/10 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="user@modfs.com"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Roles</label>
            <MultiSelect value={roleIds} onChange={setRoleIds} options={roleOptions} placeholder="Select roles" />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Teams</label>
            <MultiSelect value={teamIds} onChange={setTeamIds} options={teamOptions} placeholder="Select teams" />
          </div>

          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-neutral-900"
              />
              Active
            </label>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => close()} className="px-3 py-1.5 text-sm rounded-lg border border-white/10 bg-neutral-900/60 hover:bg-neutral-900">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="px-3 py-1.5 text-sm rounded-lg bg-cyan-600/80 hover:bg-cyan-600 text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
