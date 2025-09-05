import { redirect } from "next/navigation";
import { createRSCClient } from "@/utils/supabaseServer";

export async function getUserOrRedirect() {
  const supabase = await createRSCClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return user;
}
