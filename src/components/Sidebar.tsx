import { createRSCClient } from "@/utils/supabaseServer";
import SidebarClient from "@/components/SidebarClient";
import { sidebarSections } from "@/config/sidebar";

export default async function Sidebar() {
  const supabase = await createRSCClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = "User";
  let email = "";
  let avatarUrl: string | null = null;

  if (user?.email) {
    email = user.email;
    const { data } = await supabase
      .from("users")
      .select("display_name, avatar_url")
      .eq("email", user.email)
      .maybeSingle();

    name = data?.display_name ?? user.email.split("@")[0];
    avatarUrl = data?.avatar_url ?? null;
  }

  return (
    <SidebarClient
      sections={sidebarSections}
      user={{ name, email, avatarUrl }}
      logo={{ src: "/logo.png", alt: "MOD Admin" }}
      width={236}
    />
  );
}
