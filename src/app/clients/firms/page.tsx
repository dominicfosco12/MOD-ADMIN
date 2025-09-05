// src/app/clients/firms/page.tsx
import { createRSCClient } from "@/utils/supabaseServer";
import FirmsClient from "./FirmsClient";
import type { FirmRow } from "./types";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createRSCClient();

  const [{ data: firmsRaw = [] }, { data: rolesRaw = [] }, { data: projectsRaw = [] }] =
    await Promise.all([
      supabase
        .from("mod_firm")
        .select("id,name,contact_email,website,is_active,created_at")
        .order("name", { ascending: true }),
      supabase
        .from("firm_roles")
        .select("firm_id,role"),
      supabase
        .from("client_projects")
        .select("id,firm_id"),
    ]);

  const roleMap = new Map<string, string[]>();
  (rolesRaw as any[]).forEach((r) => {
    const fid = String(r.firm_id);
    if (!roleMap.has(fid)) roleMap.set(fid, []);
    roleMap.get(fid)!.push(String(r.role));
  });

  const projCount = new Map<string, number>();
  (projectsRaw as any[]).forEach((p) => {
    const fid = p.firm_id ? String(p.firm_id) : null;
    if (!fid) return;
    projCount.set(fid, (projCount.get(fid) ?? 0) + 1);
  });

  const rows: FirmRow[] = (firmsRaw as any[]).map((f) => ({
    id: String(f.id),
    name: String(f.name),
    contact_email: (f.contact_email ?? null) as string | null,
    website: (f.website ?? null) as string | null,
    is_active: !!f.is_active,
    created_at: (f.created_at ?? null) as string | null,
    roles: roleMap.get(String(f.id)) ?? [],
    projects_count: projCount.get(String(f.id)) ?? 0,
  }));

  return (
    <div className="px-2">
      <h1 className="text-xl font-semibold mb-4">Firms</h1>
      <FirmsClient rows={rows} />
    </div>
  );
}
