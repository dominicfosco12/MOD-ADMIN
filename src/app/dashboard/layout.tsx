// src/app/dashboard/layout.tsx
import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Sidebar />
      {/* Main content area */}
      <main className="lg:pl-0">
        {/* top spacer for mobile bar */}
        <div className="lg:hidden h-12" />
        <div className="px-6 py-8 lg:ml-[calc(var(--sb-w,264px))]">
          {children}
        </div>
      </main>
    </div>
  );
}
