// src/app/org/layout.tsx
import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { getUserOrRedirect } from "@/utils/auth";

export default async function OrgLayout({ children }: { children: ReactNode }) {
  await getUserOrRedirect();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Sidebar is fixed at width=236px */}
      <Sidebar />

      {/* Offset content by the sidebar width; no extra top padding */}
      <main className="ml-[236px] p-6">
        {children}
      </main>
    </div>
  );
}
