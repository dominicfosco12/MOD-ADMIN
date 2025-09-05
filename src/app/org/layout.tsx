import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { getUserOrRedirect } from "@/utils/auth";

export default async function OrgLayout({ children }: { children: ReactNode }) {
  await getUserOrRedirect();
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Sidebar />
      <main className="px-6 py-8" style={{ marginLeft: 236 }}>
        {children}
      </main>
    </div>
  );
}
