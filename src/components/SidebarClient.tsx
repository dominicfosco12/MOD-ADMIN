"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Gauge, Users, Layers, BookOpen, BarChart, Building2, UserSquare2,
  Contact, BriefcaseBusiness, Waypoints, ShieldCheck, FolderCog, ServerCog,
  ChevronDown, LogOut,
} from "lucide-react";
import type { SidebarGroup, SidebarItem, IconKey } from "@/types/sidebar";

const ICONS: Record<IconKey, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  gauge: Gauge,
  users: Users,
  layers: Layers,
  bookOpen: BookOpen,
  barChart: BarChart,
  building2: Building2,
  userSquare2: UserSquare2,
  contact: Contact,
  briefcaseBusiness: BriefcaseBusiness,
  waypoints: Waypoints,
  shieldCheck: ShieldCheck,
  folderCog: FolderCog,
  serverCog: ServerCog,
};

const FOOTER_H = 76;
const LS_KEY = "mod.sidebar.openGroups";

interface Props {
  groups: SidebarGroup[];
  user: { name: string; email: string; avatarUrl: string | null };
  logo: { src: string; alt: string };
  width?: number;
}

export default function SidebarClient({ groups, user, logo, width = 236 }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href);

  /** -------------------- HYDRATION-SAFE OPEN STATE -------------------- */
  const [open, setOpen] = useState<Set<string>>(() => new Set(["root", "org"]));

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      if (Array.isArray(saved) && saved.length) {
        setOpen(new Set(saved.map(String)));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(Array.from(open)));
  }, [open]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  /** ------------------------------------------------------------------- */

  return (
    <>
      <aside
        className="fixed top-0 left-0 z-40 h-screen bg-neutral-950/90 backdrop-blur border-r border-white/10 text-neutral-200"
        style={{ width }}
      >
        {/* Brand */}
        <div className="flex items-center h-14 px-3 border-b border-white/10">
          <div className="h-8 w-8 overflow-hidden rounded-md ring-1 ring-white/10 bg-neutral-900 grid place-items-center">
            <img src={logo.src} alt={logo.alt} className="h-6 w-6 object-contain" />
          </div>
        </div>

        {/* Scrollable nav */}
        <div className="h-[calc(100vh-56px)] overflow-y-auto text-[13px]" style={{ paddingBottom: FOOTER_H + 12 }}>
          <nav className="py-3 space-y-3">
            {groups.map((group: SidebarGroup) => (
              <div key={group.id}>
                {group.title ? (
                  <button
                    onClick={() => toggle(group.id)}
                    className="w-full flex items-center justify-between px-3 text-[10px] font-medium uppercase tracking-wider text-neutral-400"
                    aria-expanded={open.has(group.id)}
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      className={[
                        "h-4 w-4 transition-transform",
                        open.has(group.id) ? "rotate-0" : "-rotate-90",
                      ].join(" ")}
                    />
                  </button>
                ) : null}

                <ul
                  className={[
                    "mt-2 px-2 space-y-1 transition-[grid-template-rows] duration-200",
                    group.title ? "" : "mt-0",
                    open.has(group.id) ? "grid grid-rows-[1fr]" : "grid grid-rows-[0fr]",
                  ].join(" ")}
                >
                  <div className="overflow-hidden">
                    {group.items.map((item: SidebarItem) => {
                      const active = isActive(item.href);
                      const Icon = ICONS[item.icon];
                      return (
                        <li key={item.href}>
                          <a
                            href={item.href}
                            className={[
                              "flex items-center gap-2.5 rounded-lg px-3 py-2",
                              active
                                ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
                                : "text-neutral-300 hover:bg-white/5 hover:text-white",
                            ].join(" ")}
                          >
                            <Icon className="h-4.5 w-4.5 shrink-0 opacity-90" />
                            <span className="truncate">{item.label}</span>
                          </a>
                        </li>
                      );
                    })}
                  </div>
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 inset-x-0 border-t border-white/10 p-2.5 bg-neutral-950/95 backdrop-blur" style={{ height: FOOTER_H }}>
          <div className="flex items-center gap-2.5 px-1">
            <div className="h-8 w-8 rounded-full overflow-hidden ring-1 ring-white/10 bg-neutral-800 grid place-items-center">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                />
              ) : (
                <span className="text-[11px] text-neutral-300">
                  {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                </span>
              )}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="text-[12px] font-medium truncate">{user.name}</div>
              <div className="text-[10px] text-neutral-400 truncate">{user.email}</div>
            </div>
            <a href="/auth/signout" className="ml-auto p-1.5 rounded-md hover:bg-white/10" title="Sign out">
              <LogOut className="h-4 w-4" />
            </a>
          </div>
        </div>
      </aside>

      {/* Content offset */}
      <div style={{ width }} className="hidden lg:block" />
    </>
  );
}
