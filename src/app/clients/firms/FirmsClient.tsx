"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ArrowUpDown,
  Plus,
  Pencil,
  Check,
  X,
  Link2,
  Power,
  PowerOff,
} from "lucide-react";
import { createFirm, updateFirm, setFirmRoles } from "./actions";
import type { FirmRow } from "./types";

const ROLE_OPTIONS = [
  "client",
  "prime_broker",
  "executing_broker",
  "custodian",
  "fund_admin",
  "data_vendor",
  "other",
] as const;

type SortKey = "name" | "is_active" | "projects_count" | "created_at";

export default function FirmsClient({ rows }: { rows: FirmRow[] }) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);
  const [data, setData] = useState<FirmRow[]>(rows);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(s) ||
        (r.contact_email || "").toLowerCase().includes(s) ||
        r.roles.join(" ").toLowerCase().includes(s)
    );
  }, [q, data]);

  const sorted = useMemo(() => {
    const dir = asc ? 1 : -1;
    const copy = [...filtered];
    copy.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "is_active":
          return (Number(a.is_active) - Number(b.is_active)) * dir;
        case "projects_count":
          return (a.projects_count - b.projects_count) * dir;
        default: {
          const av = a.created_at ?? "";
          const bv = b.created_at ?? "";
          return (av > bv ? 1 : -1) * dir;
        }
      }
    });
    return copy;
  }, [filtered, sortKey, asc]);

  const setSort = (k: SortKey) => {
    if (sortKey === k) setAsc(!asc);
    else {
      setSortKey(k);
      setAsc(true);
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
            placeholder="Search firms, roles, emails…"
            className="w-full rounded-xl bg-neutral-900/60 border border-white/10 pl-10 pr-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900/60 px-3 py-2 text-sm hover:bg-neutral-900"
        >
          <Plus className="h-4 w-4" />
          Add Firm
        </button>
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
                className="w-[26%]"
              >
                Firm
              </Th>
              <th className="px-4 py-3 text-left w-[22%]">Roles</th>
              <th className="px-4 py-3 text-left w-[26%]">Contact</th>
              <Th
                onClick={() => setSort("projects_count")}
                active={sortKey === "projects_count"}
                asc={asc}
                className="w-[8%]"
              >
                Projects
              </Th>
              <Th
                onClick={() => setSort("is_active")}
                active={sortKey === "is_active"}
                asc={asc}
                className="w-[8%]"
              >
                Status
              </Th>
              <Th
                onClick={() => setSort("created_at")}
                active={sortKey === "created_at"}
                asc={asc}
                className="w-[10%]"
              >
                Created
              </Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map((r) => (
              <FirmRowItem
                key={r.id}
                row={r}
                onRowUpdate={(u) =>
                  setData((cur) => cur.map((x) => (x.id === u.id ? u : x)))
                }
                onToggleStatus={async (id, next) => {
                  // optimistic
                  setData((cur) =>
                    cur.map((x) => (x.id === id ? { ...x, is_active: next } : x))
                  );
                  const rollback = () =>
                    setData((cur) =>
                      cur.map((x) =>
                        x.id === id ? { ...x, is_active: !next } : x
                      )
                    );
                  try {
                    await updateFirm(id, { is_active: next });
                  } catch {
                    rollback();
                    alert("Failed to update status.");
                  }
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <AddFirmModal
          onClose={() => setAddOpen(false)}
          onCreated={(f) => setData((cur) => [f, ...cur])}
        />
      )}
    </div>
  );
}

function FirmRowItem({
  row,
  onRowUpdate,
  onToggleStatus,
}: {
  row: FirmRow;
  onRowUpdate: (r: FirmRow) => void;
  onToggleStatus: (id: string, next: boolean) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(row.name);
  const [email, setEmail] = useState(row.contact_email ?? "");
  const [website, setWebsite] = useState(row.website ?? "");
  const [roles, setRoles] = useState<string[]>(row.roles);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateFirm(row.id, {
        name: name.trim() || row.name,
        contact_email: email.trim() || null,
        website: website.trim() || null,
      });
      await setFirmRoles(row.id, roles);
      onRowUpdate({
        ...row,
        name: name || row.name,
        contact_email: email || null,
        website: website || null,
        roles,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const createdLabel = row.created_at
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(row.created_at))
    : "";

  return (
    <tr className="hover:bg-neutral-900/50">
      <td className="px-4 py-3">
        {!editing ? (
          <div className="flex items-center gap-2">
            <div className="font-medium text-neutral-200 truncate">{row.name}</div>
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-white/10 bg-neutral-900/60 hover:bg-neutral-900"
              title="Edit firm"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-48 rounded-md bg-neutral-900/70 border border-white/10 px-2 py-1 text-sm text-neutral-200"
            />
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-emerald-600/80 hover:bg-emerald-600 text-white"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setName(row.name);
                setEmail(row.contact_email ?? "");
                setWebsite(row.website ?? "");
                setRoles(row.roles);
              }}
              className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-white/10 bg-neutral-900/60 hover:bg-neutral-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </td>

      <td className="px-4 py-3">
        {!editing ? (
          <div className="flex flex-wrap gap-1.5">
            {row.roles.length ? (
              row.roles.map((r, i) => (
                <span
                  key={i}
                  className="rounded-full px-2 py-0.5 text-[11px] bg-neutral-800/70 text-neutral-300 ring-1 ring-white/10"
                >
                  {r}
                </span>
              ))
            ) : (
              <span className="text-neutral-500">—</span>
            )}
          </div>
        ) : (
          <RolePicker value={roles} onChange={setRoles} />
        )}
      </td>

      <td className="px-4 py-3">
        {!editing ? (
          <div className="flex items-center gap-2 text-neutral-300">
            {row.website ? (
              <a
                href={row.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200"
              >
                <Link2 className="h-4 w-4" /> website
              </a>
            ) : (
              <span className="text-neutral-500">no site</span>
            )}
            <span className="text-neutral-500">•</span>
            <span>{row.contact_email || "—"}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://…"
              className="w-40 rounded-md bg-neutral-900/70 border border-white/10 px-2 py-1 text-sm text-neutral-200"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@firm.com"
              className="w-48 rounded-md bg-neutral-900/70 border border-white/10 px-2 py-1 text-sm text-neutral-200"
            />
          </div>
        )}
      </td>

      <td className="px-4 py-3 text-neutral-300">{row.projects_count}</td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={[
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs",
              row.is_active
                ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20"
                : "bg-neutral-700/40 text-neutral-300 ring-1 ring-white/10",
            ].join(" ")}
          >
            {row.is_active ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => onToggleStatus(row.id, !row.is_active)}
            className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-white/10 bg-neutral-900/60 hover:bg-neutral-900"
            title={row.is_active ? "Deactivate" : "Activate"}
          >
            {row.is_active ? (
              <PowerOff className="h-3.5 w-3.5" />
            ) : (
              <Power className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </td>

      <td className="px-4 py-3 text-neutral-300">{createdLabel}</td>
    </tr>
  );
}

function RolePicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {ROLE_OPTIONS.map((r) => {
        const on = value.includes(r);
        return (
          <button
            key={r}
            onClick={() =>
              onChange(on ? value.filter((x) => x !== r) : [...value, r])
            }
            className={[
              "rounded-full px-2 py-0.5 text-[11px] ring-1",
              on
                ? "bg-cyan-600/30 text-cyan-100 ring-cyan-500/30"
                : "bg-neutral-800/70 text-neutral-300 ring-white/10",
            ].join(" ")}
          >
            {r}
          </button>
        );
      })}
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

/* ---------- Add Firm Modal ---------- */

function AddFirmModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (row: FirmRow) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const created = await createFirm({
        name: name.trim(),
        contact_email: email || null,
        website: website || null,
        roles,
      });
      onCreated({
        id: created.id,
        name: created.name,
        contact_email: created.contact_email ?? null,
        website: created.website ?? null,
        is_active: !!created.is_active,
        created_at: created.created_at ?? null,
        roles,
        projects_count: 0,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-5 shadow-2xl">
        <h3 className="text-base font-semibold mb-3">Add Firm</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-neutral-900/60 border border-white/10 px-3 py-2 text-sm text-neutral-200"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                Website
              </label>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-xl bg-neutral-900/60 border border-white/10 px-3 py-2 text-sm text-neutral-200"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                Contact Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@firm.com"
                className="w-full rounded-xl bg-neutral-900/60 border border-white/10 px-3 py-2 text-sm text-neutral-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Roles</label>
            <RolePicker value={roles} onChange={setRoles} />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-lg border border-white/10 bg-neutral-900/60 hover:bg-neutral-900"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving || !name.trim()}
            className="px-3 py-1.5 text-sm rounded-lg bg-cyan-600/80 hover:bg-cyan-600 text-white disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
