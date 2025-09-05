import { createClient } from "@/utils/supabaseServer";
import SidebarClient from "@/components/SidebarClient";

type DbUserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export default async function Sidebar() {
  const supabase = await createClient(); // ⬅️ await

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let profile: DbUserRow | null = null;

  if (authUser?.id) {
    const { data } = await supabase
      .from("users")
      .select("id, email, full_name, avatar_url")
      .eq("id", authUser.id as unknown as string)
      .maybeSingle();

    if (data) {
      profile = {
        id: String((data as any).id),
        email: (data as any).email ?? null,
        full_name: (data as any).full_name ?? null,
        avatar_url: (data as any).avatar_url ?? null,
      };
    }
  }

  const email = profile?.email ?? authUser?.email ?? "user@modfintech.com";
  const name = profile?.full_name ?? (email ? email.split("@")[0] : "User");
  const avatarUrl = profile?.avatar_url ?? null;

  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: "Gauge" as const },
    { href: "/dashboard/users", label: "Users", icon: "Users" as const },
    { href: "/dashboard/settings", label: "Settings", icon: "Settings" as const },
  ];

  return (
    <SidebarClient
      nav={nav}
      user={{ name, email, avatarUrl }}
      logo={{ src: "/logo.png", alt: "MOD" }}
    />
  );
}
