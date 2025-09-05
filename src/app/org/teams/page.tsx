// Server component: fetch data + build tree
import { createRSCClient } from "@/utils/supabaseServer";
import TeamsClient from "./TeamsClient";
import type { Team, TeamEdge, TeamNode, User, Option } from "./types";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createRSCClient();

  const [{ data: teamsRaw = [] }, { data: edgesRaw = [] }, { data: membersRaw = [] }, { data: usersRaw = [] }] =
    await Promise.all([
      supabase.from("teams").select("id,name,created_at,firm_id").order("name", { ascending: true }),
      supabase.from("team_hierarchy").select("child_id,parent_id"),
      supabase.from("team_members").select("user_id,team_id"),
      supabase.from("users").select("id,display_name,email,avatar_url,is_active"),
    ]);

  const teams: Team[] = (teamsRaw as any[]).map((t) => ({
    id: String(t.id),
    name: String(t.name),
    created_at: (t.created_at ?? null) as string | null,
    firm_id: (t.firm_id ?? null) as string | null,
  }));

  const edges: TeamEdge[] = (edgesRaw as any[]).map((e) => ({
    child_id: String(e.child_id),
    parent_id: e.parent_id ? String(e.parent_id) : null,
  }));

  const users: User[] = (usersRaw as any[]).map((u) => ({
    id: String(u.id),
    name: String(u.display_name ?? ""),
    email: String(u.email ?? ""),
    avatar_url: (u.avatar_url ?? null) as string | null,
    is_active: !!u.is_active,
  }));

  // membersByTeam
  const membersByTeam = new Map<string, User[]>();
  for (const m of membersRaw as { user_id: string; team_id: string }[]) {
    const uid = String(m.user_id);
    const tid = String(m.team_id);
    const u = users.find((x) => x.id === uid);
    if (!u) continue;
    if (!membersByTeam.has(tid)) membersByTeam.set(tid, []);
    membersByTeam.get(tid)!.push(u);
  }

  // parent map
  const parentByChild = new Map<string, string | null>();
  edges.forEach((e) => parentByChild.set(e.child_id, e.parent_id ?? null));

  // nodes
  const nodes = new Map<string, TeamNode>();
  teams.forEach((t) =>
    nodes.set(t.id, {
      ...t,
      parent_id: parentByChild.get(t.id) ?? null,
      members: membersByTeam.get(t.id) ?? [],
      children: [],
    })
  );

  // build forest
  const roots: TeamNode[] = [];
  for (const n of nodes.values()) {
    if (n.parent_id && nodes.has(n.parent_id)) {
      nodes.get(n.parent_id)!.children.push(n);
    } else {
      roots.push(n);
    }
  }

  // stable sort
  const sortTree = (n: TeamNode) => {
    n.children.sort((a, b) => a.name.localeCompare(b.name));
    n.children.forEach(sortTree);
  };
  roots.sort((a, b) => a.name.localeCompare(b.name));
  roots.forEach(sortTree);

  const teamOptions: Option[] = teams.map((t) => ({ id: t.id, label: t.name }));
  const userOptions: Option[] = users.map((u) => ({ id: u.id, label: u.name || u.email }));

  return (
    <div className="px-2">
      <h1 className="text-xl font-semibold mb-4">Teams</h1>
      <TeamsClient roots={roots} teamOptions={teamOptions} userOptions={userOptions} />
    </div>
  );
}
