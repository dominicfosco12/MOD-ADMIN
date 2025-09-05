import { createClient } from "@/utils/supabaseServer";
import UsersClient from "./UsersClient";

export const revalidate = 0;

export default async function Page() {
  const supabase = await createClient();

  const { data: usersData } = await supabase
    .from("users")
    .select("id, email, display_name, is_active, created_at, avatar_url")
    .order("created_at", { ascending: false });

  const [{ data: rolesData }, { data: userRolesData }] = await Promise.all([
    supabase.from("org_roles").select("id, name"),
    supabase.from("user_roles").select("user_id, role_id"),
  ]);

  const [{ data: teamsData }, { data: teamMembersData }] = await Promise.all([
    supabase.from("teams").select("id, name"),
    supabase.from("team_members").select("user_id, team_id"),
  ]);

  const users = usersData ?? [];
  const roles = rolesData ?? [];
  const userRoles = userRolesData ?? [];
  const teams = teamsData ?? [];
  const teamMembers = teamMembersData ?? [];

  const roleMap = new Map<string, string>();
  for (const r of roles as any[]) if (r?.id && r?.name) roleMap.set(String(r.id), String(r.name));

  const teamMap = new Map<string, string>();
  for (const t of teams as any[]) if (t?.id && t?.name) teamMap.set(String(t.id), String(t.name));

  const rolesByUser = new Map<string, string[]>();
  for (const link of userRoles as any[]) {
    const uid = String(link?.user_id ?? "");
    const roleName = roleMap.get(String(link?.role_id ?? ""));
    if (!uid || !roleName) continue;
    (rolesByUser.get(uid) ?? rolesByUser.set(uid, []).get(uid)!)!.push(roleName);
  }

  const teamsByUser = new Map<string, string[]>();
  for (const tm of teamMembers as any[]) {
    const uid = String(tm?.user_id ?? "");
    const teamName = teamMap.get(String(tm?.team_id ?? ""));
    if (!uid || !teamName) continue;
    (teamsByUser.get(uid) ?? teamsByUser.set(uid, []).get(uid)!)!.push(teamName);
  }

  const rows = (users as any[]).map((u) => ({
    id: String(u.id),
    email: String(u.email ?? ""),
    name: (u.display_name as string | null) ?? null,          // ✅ display_name
    is_active: !!u.is_active,
    created_at: String(u.created_at ?? ""),
    avatar_url: (u.avatar_url as string | null) ?? null,      // ✅ avatar_url
    roles: rolesByUser.get(String(u.id)) ?? [],
    teams: teamsByUser.get(String(u.id)) ?? [],
  }));

  return (
    <div className="px-2">
      <h1 className="text-xl font-semibold mb-4">Users</h1>
      <UsersClient rows={rows} />
    </div>
  );
}
