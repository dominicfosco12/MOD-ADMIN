import type { ReactNode } from "react";
import "../globals.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh antialiased bg-neutral-950">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_0%,rgba(255,255,255,0.06),rgba(0,0,0,0))]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.0),rgba(0,0,0,.25))]" />
        </div>
        <main className="relative grid min-h-dvh place-items-center p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
