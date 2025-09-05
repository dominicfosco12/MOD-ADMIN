// src/components/SidebarClient.tsx
"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  Gauge,
  Settings,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: "Gauge" | "Users" | "Settings" };
type Props = {
  nav: NavItem[];
  user: { name: string; email: string; avatarUrl: string | null };
  logo: { src: string; alt: string };
};

const Icon = ({ name, className }: { name: NavItem["icon"]; className?: string }) => {
  if (name === "Gauge") return <Gauge className={className} />;
  if (name === "Users") return <Users className={className} />;
  return <Settings className={className} />;
};

export default function SidebarClient({ nav, user, logo }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-3 py-2 bg-neutral-900/70 backdrop-blur border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="p-2 rounded-lg hover:bg-white/10"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="h-8 w-8 rounded-lg overflow-hidden ring-1 ring-white/10 shadow">
            <img src={logo.src} alt={logo.alt} className="h-full w-full object-cover" />
          </div>
          <span className="font-semibold">MOD Admin</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={[
          "fixed z-50 lg:z-30 top-0 left-0 h-full",
          "bg-neutral-950/80 backdrop-blur border-r border-white/10",
          "transition-[width] duration-300",
          mobileOpen ? "w-72" : "w-0 lg:w-[--sb-w]",
        ].join(" ")}
        style={
          {
            ["--sb-w" as any]: collapsed ? "80px" : "264px",
          } as React.CSSProperties
        }
        onClick={() => {
          if (mobileOpen) setMobileOpen(false);
        }}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="hidden lg:flex items-center gap-3 h-16 px-4 border-b border-white/10">
            <div className="h-9 w-9 rounded-xl overflow-hidden ring-1 ring-white/10 shadow">
              <img src={logo.src} alt={logo.alt} className="h-full w-full object-cover" />
            </div>
            {!collapsed && <span className="font-semibold tracking-tight">MOD Admin</span>}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="ml-auto p-2 rounded-lg hover:bg-white/10"
              aria-label="Collapse"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Mobile header spacer */}
          <div className="lg:hidden h-12" />

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="px-2 space-y-1">
              {nav.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={[
                        "group flex items-center gap-3 rounded-xl px-3 py-2",
                        active
                          ? "bg-white/10 text-white"
                          : "text-neutral-300 hover:bg-white/5 hover:text-white",
                      ].join(" ")}
                    >
                      <Icon name={item.icon} className="h-5 w-5 shrink-0 opacity-90" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User block */}
          <div className="mt-auto border-t border-white/10 p-3">
            <div className="flex items-center gap-3 px-2">
              <div className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-white/10 bg-neutral-800 flex items-center justify-center">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-xs text-neutral-300">
                    {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </span>
                )}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-tight truncate">{user.name}</div>
                  <div className="text-xs text-neutral-400 truncate">{user.email}</div>
                </div>
              )}
              {!collapsed && (
                <a
                  href="/auth/signout"
                  className="ml-auto p-2 rounded-lg hover:bg-white/10"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Content offset for desktop */}
      <div
        className="hidden lg:block"
        style={
          {
            width: collapsed ? 80 : 264,
          } as React.CSSProperties
        }
      />
    </>
  );
}
