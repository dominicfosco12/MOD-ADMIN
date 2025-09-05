// src/app/clients/projects/page.tsx
import { createRSCClient } from "@/utils/supabaseServer";
import ProjectsClient from "./ProjectsClient";

type DbRow = {
  id: string;
  name: string;
  supabase_url: string;
  contact_email: string | null;
  created_at: string | null;
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createRSCClient();

  const { data = [] } = await supabase
    .from("client_projects")
    .select("id,name,supabase_url,contact_email,created_at")
    .order("created_at", { ascending: false });

  const fmt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const rows = (data as DbRow[]).map((p) => ({
    id: p.id,
    name: p.name,
    supabase_url: p.supabase_url,
    contact_email: p.contact_email ?? "",
    created_at: p.created_at ?? null, // ✅ always string|null
    created_label: p.created_at ? fmt.format(new Date(p.created_at)) : "",
  }));

  return (
    <div className="px-2">
      <h1 className="text-xl font-semibold mb-4">Client Projects</h1>
      <ProjectsClient rows={rows} />
    </div>
  );
}
