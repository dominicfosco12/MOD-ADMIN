"use client";

import { useMemo, useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";

type Row = {
  id: string;
  name: string;
  description: string | null;
  members: number;
  is_active: boolean;
  created_at: string;   // ISO string or date-like
};

type SortKey = "name" | "members" | "created_at" | "is_active";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default function TeamsClient({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [asc, setAsc] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let data = rows;
    if (query) {
      data = rows.filter((r) => {
        const blob = [r.name, r.description ?? "", r.is_active ? "active" : "inactive"]
          .join(" ")
          .toLowerCase();
        return blob.includes(query);
      });
    }
    const sorted = [...data].sort((a, b) => {
      const dir = asc ? 1 : -1;
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "members":
          return (a.members - b.members) * dir;
        case "is_active":
          return (Number(a.is_active) - Number(b.is_active)) * dir;
        default:
          return (a.created_at > b.created_at ? 1 : -1) * dir;
      }
    });
    return sorted;
  }, [rows, q, sortKey, asc]);

  const setSort = (key: SortKey) => {
    if (sortKey === key) setAsc(!asc);
    else {
      setSortKey(key);
      setAsc(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search teams…"
            className="w-full rounded-xl bg-neutral-900/60 border border-white/10 py-2 pl-9 pr-3 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-neutral-300">
            <tr>
              <Th onClick={() => setSort("name")} active={sortKey === "name"} asc={asc} className="w-[28%]">
                Team
              </Th>
              <th className="text-left py-2.5 px-3">Description</th>
              <Th onClick={() => setSort("members")} active={sortKey === "members"} asc={asc} className="w-[12%]">
                Members
              </Th>
              <Th onClick={() => setSort("is_active")} active={sortKey === "is_active"} asc={asc} className="w-[12%]">
                Status
              </Th>
              <Th onClick={() => setSort("created_at")} active={sortKey === "created_at"} asc={asc} className="w-[14%]">
                Created
              </Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="py-2.5 px-3 font-medium text-neutral-100">{r.name}</td>
                <td className="py-2.5 px-3 text-neutral-300">{r.description ?? "—"}</td>
                <td className="py-2.5 px-3">{r.members}</td>
                <td className="py-2.5 px-3">
                  <span
                    className={[
                      "inline-flex items-center rounded-md px-2 py-0.5 text-xs",
                      r.is_active ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20" : "bg-neutral-700/30 text-neutral-300 ring-1 ring-white/10",
                    ].join(" ")}
                  >
                    {r.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-neutral-400 text-xs">
                  {dateFmt.format(new Date(r.created_at))}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 px-3 text-center text-neutral-400">
                  No teams match your search.
                </td>
              </tr>
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
  onClick: () => void;
  active: boolean;
  asc: boolean;
  className?: string;
}) {
  return (
    <th
      onClick={onClick}
      className={[
        "text-left py-2.5 px-3 select-none cursor-pointer",
        active ? "text-white" : "",
        className,
      ].join(" ")}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown className={["h-3.5 w-3.5", active ? "opacity-80" : "opacity-40"].join(" ")} />
      </span>
    </th>
  );
}
