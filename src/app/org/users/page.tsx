// src/app/org/users/page.tsx
import UsersClient from "./UsersClient";
import { createClient } from "@/utils/supabaseServer";

type DbUser = {
  id: string;
  email: string | null;
  display_name: string | null;
  is_active: boolean | null;
  avatar_url: string | null;
  created_at: string | null;
};

type DbRole = { id: string; name: string };
type DbTeam = { id: string; name: string };
type MapUserRole = { user_id: string; role_id: string };
type MapTeamMember = { user_id: string; team_id: string };

export default async function Page() {
  const supabase = await createClient();

  const [{ data: users = [] }, { data: roles = [] }, { data: teams = [] }, { data: userRoles = [] }, { data: teamMembers = [] }] =
    await Promise.all([
      supabase.from("users").select("id,email,display_name,is_active,avatar_url,created_at").order("created_at", { ascending: false }),
      supabase.from("org_roles").select("id,name"),
      supabase.from("teams").select("id,name"),
      supabase.from("user_roles").select("user_id,role_id"),
      supabase.from("team_members").select("user_id,team_id"),
    ]);

  const roleById = new Map((roles as DbRole[]).map((r) => [r.id, r.name]));
  const teamById = new Map((teams as DbTeam[]).map((t) => [t.id, t.name]));

  const rolesByUser = new Map<string, string[]>();      // names
  const roleIdsByUser = new Map<string, string[]>();    // ids
  const teamsByUser = new Map<string, string[]>();      // names
  const teamIdsByUser = new Map<string, string[]>();    // ids

  (userRoles as MapUserRole[]).forEach(({ user_id, role_id }) => {
    if (!roleIdsByUser.has(user_id)) roleIdsByUser.set(user_id, []);
    if (!rolesByUser.has(user_id)) rolesByUser.set(user_id, []);
    roleIdsByUser.get(user_id)!.push(role_id);
    const n = roleById.get(role_id);
    if (n) rolesByUser.get(user_id)!.push(n);
  });

  (teamMembers as MapTeamMember[]).forEach(({ user_id, team_id }) => {
    if (!teamIdsByUser.has(user_id)) teamIdsByUser.set(user_id, []);
    if (!teamsByUser.has(user_id)) teamsByUser.set(user_id, []);
    teamIdsByUser.get(user_id)!.push(team_id);
    const n = teamById.get(team_id);
    if (n) teamsByUser.get(user_id)!.push(n);
  });

  // Stable (server) formatting to avoid hydration mismatches
  const dateFmt = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

  const rows = (users as DbUser[]).map((u) => {
    const rIds = roleIdsByUser.get(u.id) ?? [];
    const rNames = rolesByUser.get(u.id) ?? [];
    const tIds = teamIdsByUser.get(u.id) ?? [];
    const tNames = teamsByUser.get(u.id) ?? [];
    return {
      id: u.id,
      email: u.email ?? "",
      name: u.display_name ?? null,
      is_active: !!u.is_active,
      avatar_url: u.avatar_url ?? null,
      roles: rNames,
      roles_ids: rIds,
      teams: tNames,
      teams_ids: tIds,
      created_at: u.created_at ?? "",
      created_at_label: u.created_at ? dateFmt.format(new Date(u.created_at)) : "",
    };
  });

  const roleOptions = (roles as DbRole[]).map((r) => ({ id: r.id, label: r.name }));
  const teamOptions = (teams as DbTeam[]).map((t) => ({ id: t.id, label: t.name }));

  return (
    <div className="px-2">
      <h1 className="text-xl font-semibold mb-4">Users</h1>
      <UsersClient rows={rows} roleOptions={roleOptions} teamOptions={teamOptions} />
    </div>
  );
}
