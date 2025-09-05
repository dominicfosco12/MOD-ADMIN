// src/app/org/layout.tsx
import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { getUserOrRedirect } from "@/utils/auth";

export default async function OrgLayout({ children }: { children: ReactNode }) {
  await getUserOrRedirect();

  return (
    <div className="min-h-screen flex bg-neutral-950 text-neutral-100">
      {/* Sidebar column (fixed inside) */}
      <aside className="w-[236px] shrink-0">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
