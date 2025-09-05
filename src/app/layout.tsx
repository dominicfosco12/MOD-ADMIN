import type { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-neutral-950 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
