"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, ArrowUpDown, MoreHorizontal, Pencil, Power, PowerOff, Plus } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import EditUserModal from "./EditUserModal";
import { createBrowserSupabaseClient } from "@/utils/supabaseBrowser";

type Option = { id: string; label: string };

type Row = {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  avatar_url: string | null;
  roles: string[];
  roles_ids: string[];
  teams: string[];
  teams_ids: string[];
  created_at: string;
  created_at_label: string;
};

type Props = {
  rows: Row[];
  roleOptions: Option[];
  teamOptions: Option[];
};

type SortKey = "name" | "email" | "is_active" | "created_at";

export default function UsersClient({ rows, roleOptions, teamOptions }: Props) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [asc, setAsc] = useState(false);
  const [data, setData] = useState<Row[]>(rows);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [confirm, setConfirm] = useState<{ id: string | null; name: string | null; nextActive: boolean }>({
    id: null,
    name: null,
    nextActive: false,
  });

  const [editing, setEditing] = useState<{ open: boolean; row: Row | null }>({ open: false, row: null });

  useEffect(() => setData(rows), [rows]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return data;
    return data.filter((r) => {
      return (
        (r.name ?? "").toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        r.roles.join(" ").toLowerCase().includes(query) ||
        r.teams.join(" ").toLowerCase().includes(query)
      );
    });
  }, [q, data]);

  const sorted = useMemo(() => {
    const dir = asc ? 1 : -1;
    const copy = [...filtered];
    copy.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return ((a.name ?? "").localeCompare(b.name ?? "")) * dir;
        case "email":
          return a.email.localeCompare(b.email) * dir;
        case "is_active":
          return (Number(a.is_active) - Number(b.is_active)) * dir;
        default:
          return ((a.created_at ?? "") > (b.created_at ?? "") ? 1 : -1) * dir;
      }
    });
    return copy;
  }, [filtered, sortKey, asc]);

  const total = sorted.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = (page - 1) * pageSize;
  const paged = sorted.slice(pageStart, pageStart + pageSize);

  const setSort = (key: SortKey) => {
    if (sortKey === key) setAsc(!asc);
    else {
      setSortKey(key);
      setAsc(false);
    }
  };

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  async function toggleActive(id: string, nextActive: boolean) {
    setData((cur) => cur.map((r) => (r.id === id ? { ...r, is_active: nextActive } : r)));
    const { error } = await supabase.from("users").update({ is_active: nextActive }).eq("id", id);
    if (error) {
      setData((cur) => cur.map((r) => (r.id === id ? { ...r, is_active: !nextActive } : r)));
      console.error(error);
      alert("Failed to update user status.");
    }
  }

  function openEdit(row: Row | null) {
    setEditing({ open: true, row });
  }

  function closeEdit(updated?: Row) {
    setEditing({ open: false, row: null });
    if (updated) {
      setData((cur) => cur.map((r) => (r.id === updated.id ? updated : r)));
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Search users, roles, teams…"
            className="w-full rounded-xl bg-neutral-900/60 border border-white/10 pl-10 pr-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900/60 px-3 py-2 text-sm hover:bg-neutral-900"
          onClick={() => openEdit(null)}
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-neutral-950/80 backdrop-blur border-b border-white/10">
              <tr className="text-neutral-400">
                <Th onClick={() => setSort("name")} active={sortKey === "name"} asc={asc} className="w-[28%]">Name</Th>
                <Th onClick={() => setSort("email")} active={sortKey === "email"} asc={asc} className="w-[24%]">Email</Th>
                <th className="px-4 py-3 text-left w-[18%]">Roles</th>
                <th className="px-4 py-3 text-left w-[18%]">Teams</th>
                <Th onClick={() => setSort("is_active")} active={sortKey === "is_active"} asc={asc} className="w-[6%]">Status</Th>
                <Th onClick={() => setSort("created_at")} active={sortKey === "created_at"} asc={asc} className="w-[10%]">Created</Th>
                <th className="px-4 py-3 text-right w-[6%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-neutral-400">No users match your search.</td>
                </tr>
              ) : (
                paged.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-900/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar url={r.avatar_url} name={r.name ?? r.email} />
                        <div className="min-w-0">
                          <div className="font-medium text-neutral-200 truncate">{r.name ?? "—"}</div>
                          <div className="text-xs text-neutral-400 truncate">{r.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-300">{r.email}</td>
                    <td className="px-4 py-3"><Pills items={r.roles} emptyLabel="—" /></td>
                    <td className="px-4 py-3"><Pills items={r.teams} emptyLabel="—" /></td>
                    <td className="px-4 py-3">
                      <span className={["inline-flex items-center rounded-full px-2 py-0.5 text-xs",
                        r.is_active ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20" : "bg-neutral-700/40 text-neutral-300 ring-1 ring-white/10",
                      ].join(" ")}>
                        {r.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-300">{r.created_at_label}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs border border-white/10 bg-neutral-900/60 hover:bg-neutral-900"
                          onClick={() => openEdit(r)}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs border border-white/10 bg-neutral-900/60 hover:bg-neutral-900"
                          onClick={() => setConfirm({ id: r.id, name: r.name ?? r.email, nextActive: !r.is_active })}
                          title={r.is_active ? "Deactivate" : "Activate"}
                        >
                          {r.is_active ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                          {r.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button className="inline-flex items-center justify-center rounded-lg p-1.5 border border-white/10 bg-neutral-900/60 hover:bg-neutral-900" title="More">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-950/70 border-t border-white/10">
          <div className="text-xs text-neutral-400">
            Showing <span className="text-neutral-200">{total === 0 ? 0 : pageStart + 1}</span>–
            <span className="text-neutral-200">{Math.min(pageStart + pageSize, total)}</span> of{" "}
            <span className="text-neutral-200">{total}</span>
          </div>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-xs rounded-lg border border-white/10 disabled:opacity-40 bg-neutral-900/60 hover:bg-neutral-900">Prev</button>
            <div className="text-xs text-neutral-300">Page <span className="text-neutral-200">{page}</span> / <span className="text-neutral-200">{maxPage}</span></div>
            <button disabled={page >= maxPage} onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
              className="px-3 py-1.5 text-xs rounded-lg border border-white/10 disabled:opacity-40 bg-neutral-900/60 hover:bg-neutral-900">Next</button>
          </div>
        </div>
      </div>

      {/* Confirm & Edit */}
      <ConfirmDialog
        open={!!confirm.id}
        title={confirm.nextActive ? "Activate user?" : "Deactivate user?"}
        description={
          confirm.nextActive
            ? `This will allow ${confirm.name ?? "the user"} to access the portal.`
            : `This will immediately disable access for ${confirm.name ?? "the user"}.`
        }
        confirmText={confirm.nextActive ? "Activate" : "Deactivate"}
        onCancel={() => setConfirm({ id: null, name: null, nextActive: false })}
        onConfirm={async () => {
          if (confirm.id == null) return;
          await toggleActive(confirm.id, confirm.nextActive);
          setConfirm({ id: null, name: null, nextActive: false });
        }}
      />

      <EditUserModal
        open={editing.open}
        row={editing.row}
        roleOptions={roleOptions}
        teamOptions={teamOptions}
        onClose={closeEdit}
      />
    </div>
  );
}

function Th({
  children, onClick, active, asc, className = "",
}: { children: React.ReactNode; onClick?: () => void; active?: boolean; asc?: boolean; className?: string }) {
  return (
    <th onClick={onClick} className={["px-4 py-3 text-left select-none", onClick ? "cursor-pointer" : "", className].join(" ")}>
      <span className="inline-flex items-center gap-1.5">
        <span>{children}</span>
        {onClick ? <ArrowUpDown className={["h-3.5 w-3.5", active ? "text-neutral-300" : "text-neutral-500"].join(" ")} /> : null}
        {active ? <span className="sr-only">{asc ? "ascending" : "descending"}</span> : null}
      </span>
    </th>
  );
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  if (url) return <img src={url} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10" />;
  const initial = (name?.[0] ?? "?").toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full grid place-items-center bg-gradient-to-br from-cyan-500/30 to-blue-600/30 text-neutral-100 ring-1 ring-white/10">
      <span className="text-sm font-semibold">{initial}</span>
    </div>
  );
}

function Pills({ items, emptyLabel = "—" }: { items: string[]; emptyLabel?: string }) {
  if (!items || items.length === 0) return <span className="text-neutral-500">{emptyLabel}</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((x, i) => (
        <span key={i} className="rounded-full px-2 py-0.5 text-[11px] bg-neutral-800/70 text-neutral-300 ring-1 ring-white/10">
          {x}
        </span>
      ))}
    </div>
  );
}
