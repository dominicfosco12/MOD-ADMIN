// src/app/clients/layout.tsx
import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { getUserOrRedirect } from "@/utils/auth";

export default async function ClientsLayout({ children }: { children: ReactNode }) {
  await getUserOrRedirect();

  return (
    <div className="min-h-screen flex bg-neutral-950 text-neutral-100">
      <aside className="w-[236px] shrink-0">
        <Sidebar />
      </aside>
      <main className="flex-1 min-w-0 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
