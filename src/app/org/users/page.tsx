// src/app/org/users/page.tsx
import UsersClient from "./UsersClient";
import { createClient } from "@/utils/supabaseServer";

export default async function Page() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("users")
    .select("id,email,display_name,is_active,avatar_url,created_at");

  // Stable server-side formatting (UTC)
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  const rows = (users ?? []).map((u) => ({
    id: String(u.id),
    email: u.email ?? "",
    name: u.display_name ?? null,
    is_active: !!u.is_active,
    avatar_url: u.avatar_url ?? null,
    roles: [],  // fill as needed
    teams: [],  // fill as needed
    created_at: dateFmt.format(new Date(u.created_at ?? "")), // <-- string already formatted
  }));

  return (
    <div className="px-2">
      <h1 className="text-xl font-semibold mb-4">Users</h1>
      <UsersClient rows={rows} />
    </div>
  );
}
