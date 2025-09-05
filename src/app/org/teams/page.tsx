import { createRSCClient } from "@/utils/supabaseServer";

export const revalidate = 0;

export default async function Page() {
  const supabase = await createRSCClient();

  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, name, description, created_at");

  // safe fallback
  const teams = teamsData ?? [];

  const rows = (teams as any[]).map((t) => ({
    id: String(t.id),
    name: String(t.name ?? ""),
    description: (t.description as string | null) ?? null,
    created_at: String(t.created_at ?? ""),
  }));

  return (
    <div className="px-2">
      <h1 className="text-xl font-semibold mb-4">Teams</h1>
      {/* render rows with your TeamsClient or table */}
      <pre className="text-xs text-neutral-400">{JSON.stringify(rows, null, 2)}</pre>
    </div>
  );
}
