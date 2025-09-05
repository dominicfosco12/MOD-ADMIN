"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ArrowUpDown,
  Link2,
  Mail,
  ServerCog,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { testConnection } from "@/app/clients/projects/actions";

type Row = {
  id: string;
  name: string;
  supabase_url: string;
  contact_email: string;
  created_at: string | null;   // ✅ allow null
  created_label: string;
};

type SortKey = "name" | "created_at";

export default function ProjectsClient({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [asc, setAsc] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<
    Record<string, "ok" | "fail" | undefined>
  >({});

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        r.supabase_url.toLowerCase().includes(s) ||
        r.contact_email.toLowerCase().includes(s)
    );
  }, [q, rows]);

  const sorted = useMemo(() => {
    const dir = asc ? 1 : -1;
    const copy = [...filtered];
    copy.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      const av = a.created_at ?? "";
      const bv = b.created_at ?? "";
      return (av > bv ? 1 : -1) * dir;
    });
    return copy;
  }, [filtered, sortKey, asc]);

  const setSort = (key: SortKey) => {
    if (sortKey === key) setAsc(!asc);
    else {
      setSortKey(key);
      setAsc(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects, URLs, contacts…"
            className="w-full rounded-xl bg-neutral-900/60 border border-white/10 pl-10 pr-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-neutral-950/80 backdrop-blur border-b border-white/10">
            <tr className="text-neutral-400">
              <Th
                onClick={() => setSort("name")}
                active={sortKey === "name"}
                asc={asc}
                className="w-[28%]"
              >
                Project
              </Th>
              <th className="px-4 py-3 text-left w-[34%]">URL</th>
              <th className="px-4 py-3 text-left w-[20%]">Contact</th>
              <Th
                onClick={() => setSort("created_at")}
                active={sortKey === "created_at"}
                asc={asc}
                className="w-[10%]"
              >
                Created
              </Th>
              <th className="px-4 py-3 text-right w-[8%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-neutral-400"
                >
                  No projects.
                </td>
              </tr>
            ) : (
              sorted.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-900/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-200 truncate">
                      {r.name}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      ID {r.id.slice(0, 8)}…
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={r.supabase_url}
                      target="_blank"
                      className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200"
                    >
                      <Link2 className="h-4 w-4" />
                      <span className="truncate">{r.supabase_url}</span>
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-2 text-neutral-300">
                      <Mail className="h-4 w-4 text-neutral-400" />
                      <span className="truncate">
                        {r.contact_email || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-300">
                    {r.created_label}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        disabled={busy === r.id}
                        onClick={async () => {
                          setBusy(r.id);
                          try {
                            const ok = await testConnection(r.id);
                            setStatus((s) => ({
                              ...s,
                              [r.id]: ok ? "ok" : "fail",
                            }));
                          } finally {
                            setBusy(null);
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs border border-white/10 bg-neutral-900/60 hover:bg-neutral-900 disabled:opacity-50"
                        title="Test Connection"
                      >
                        <ServerCog className="h-3.5 w-3.5" />
                        Test
                      </button>

                      {status[r.id] === "ok" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-300">
                          <CheckCircle2 className="h-4 w-4" /> OK
                        </span>
                      ) : status[r.id] === "fail" ? (
                        <span className="inline-flex items-center gap-1 text-rose-300">
                          <XCircle className="h-4 w-4" /> Fail
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  asc,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  asc?: boolean;
  className?: string;
}) {
  return (
    <th
      onClick={onClick}
      className={[
        "px-4 py-3 text-left select-none",
        onClick ? "cursor-pointer" : "",
        className,
      ].join(" ")}
    >
      <span className="inline-flex items-center gap-1.5">
        <span>{children}</span>
        <ArrowUpDown
          className={[
            "h-3.5 w-3.5",
            active ? "text-neutral-300" : "text-neutral-500",
          ].join(" ")}
        />
        {active ? (
          <span className="sr-only">{asc ? "ascending" : "descending"}</span>
        ) : null}
      </span>
    </th>
  );
}
