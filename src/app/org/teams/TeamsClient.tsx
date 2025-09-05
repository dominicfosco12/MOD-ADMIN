"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Users, Pencil, Check, X, Plus } from "lucide-react";
import { setMembers, setParent, renameTeam, createTeam } from "./actions";
import type { TeamNode, Option } from "./types";
import MultiSelect from "@/app/org/users/MultiSelect";

type Props = {
  roots: TeamNode[];
  teamOptions: Option[];
  userOptions: Option[];
};

export default function TeamsClient({ roots, teamOptions, userOptions }: Props) {
  const [q, setQ] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [addOpen, setAddOpen] = useState(false);

  const toggle = (id: string) => setCollapsed((s) => ({ ...s, [id]: !s[id] }));

  const filteredRoots = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return roots;

    const matchTree = (n: TeamNode): TeamNode | null => {
      const self =
        n.name.toLowerCase().includes(s) ||
        n.members.some(
          (m) =>
            (m.name || "").toLowerCase().includes(s) ||
            (m.email || "").toLowerCase().includes(s)
        );
      const kids = n.children.map(matchTree).filter(Boolean) as TeamNode[];
      if (self || kids.length) return { ...n, children: kids.length ? kids : n.children };
      return null;
    };
    return roots.map(matchTree).filter(Boolean) as TeamNode[];
  }, [q, roots]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search teams or members…"
          className="w-full max-w-md rounded-xl bg-neutral-900/60 border border-white/10 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900/60 px-3 py-2 text-sm hover:bg-neutral-900"
        >
          <Plus className="h-4 w-4" />
          Add Team
        </button>
      </div>

      <div className="rounded-xl border border-white/10 p-4">
        {filteredRoots.length === 0 ? (
          <div className="text-sm text-neutral-400">No teams found.</div>
        ) : (
          <div className="space-y-6">
            {filteredRoots.map((r) => (
              <Tree
                key={r.id}
                node={r}
                collapsed={collapsed}
                onToggle={toggle}
                teamOptions={teamOptions}
                userOptions={userOptions}
              />
            ))}
          </div>
        )}
      </div>

      {addOpen && <AddTeamModal teamOptions={teamOptions} onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function Tree({
  node,
  collapsed,
  onToggle,
  teamOptions,
  userOptions,
}: {
  node: TeamNode;
  collapsed: Record<string, boolean>;
  onToggle: (id: string) => void;
  teamOptions: Option[];
  userOptions: Option[];
}) {
  const isCollapsed = !!collapsed[node.id];
  return (
    <div className="pl-0">
      <NodeCard
        node={node}
        isCollapsed={isCollapsed}
        onToggle={() => onToggle(node.id)}
        teamOptions={teamOptions}
        userOptions={userOptions}
      />
      {!isCollapsed && node.children.length > 0 && (
        <div className="relative ml-6 mt-3 pl-6">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10" />
          <div className="space-y-3">
            {node.children.map((c) => (
              <div key={c.id} className="relative">
                <div className="absolute -left-3 top-5 w-6 h-px bg-white/10" />
                <Tree
                  node={c}
                  collapsed={collapsed}
                  onToggle={onToggle}
                  teamOptions={teamOptions}
                  userOptions={userOptions}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NodeCard({
  node,
  isCollapsed,
  onToggle,
  teamOptions,
  userOptions,
}: {
  node: TeamNode;
  isCollapsed: boolean;
  onToggle: () => void;
  teamOptions: Option[];
  userOptions: Option[];
}) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(node.name);

  const [parentId, setParentId] = useState<string | null>(node.parent_id);
  const [memberIds, setMemberIds] = useState<string[]>(
    node.members.map((m) => m.id)
  );
  const [saving, setSaving] = useState(false);

  async function saveParent() {
    setSaving(true);
    try {
      await setParent(node.id, parentId);
    } finally {
      setSaving(false);
    }
  }

  async function saveMembers() {
    setSaving(true);
    try {
      await setMembers(node.id, memberIds);
    } finally {
      setSaving(false);
    }
  }

  async function saveName() {
    if (!name.trim() || name.trim() === node.name) {
      setEditingName(false);
      return;
    }
    setSaving(true);
    try {
      await renameTeam(node.id, name.trim());
      setEditingName(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-neutral-950/70">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onToggle}
            className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-neutral-900/60 hover:bg-neutral-900"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

            {/* Title / inline rename */}
            {!editingName ? (
              <div className="flex items-center gap-2 min-w-0">
                <div className="font-medium text-neutral-100 truncate">{name}</div>
                <button
                  onClick={() => setEditingName(true)}
                  className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-white/10 bg-neutral-900/60 hover:bg-neutral-900"
                  title="Edit team name"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-48 rounded-md bg-neutral-900/70 border border-white/10 px-2 py-1 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  autoFocus
                />
                <button
                  onClick={saveName}
                  disabled={saving}
                  className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-emerald-600/80 hover:bg-emerald-600 text-white disabled:opacity-60"
                  title="Save"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setName(node.name);
                  }}
                  className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-white/10 bg-neutral-900/60 hover:bg-neutral-900"
                  title="Cancel"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          <div className="text-xs text-neutral-500 ml-2">Team ID {node.id.slice(0, 8)}…</div>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Users className="h-3.5 w-3.5" />
          {node.members.length}
        </div>
      </div>

      <div className="border-t border-white/10 px-3 py-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Parent select — compact */}
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Parent Team</label>
          <div className="flex items-center gap-2">
            <select
              value={parentId ?? ""}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-56 h-8 rounded-lg bg-neutral-900/60 border border-white/10 px-2 text-sm text-neutral-200"
            >
              <option value="">— None (root) —</option>
              {teamOptions
                .filter((t) => t.id !== node.id)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
            </select>
            <button
              onClick={saveParent}
              disabled={saving}
              className="px-2.5 h-8 text-xs rounded-lg border border-white/10 bg-neutral-900/60 hover:bg-neutral-900 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>

        {/* Members */}
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Members</label>
          <div className="flex items-center gap-2">
            <div className="w-full">
              <MultiSelect
                value={memberIds}
                onChange={setMemberIds}
                options={userOptions}
                placeholder="Select members"
              />
            </div>
            <button
              onClick={saveMembers}
              disabled={saving}
              className="px-2.5 h-8 text-xs rounded-lg border border-white/10 bg-neutral-900/60 hover:bg-neutral-900 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------- Add Team Modal (small) -------- */

function AddTeamModal({
  teamOptions,
  onClose,
}: {
  teamOptions: Option[];
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createTeam(name.trim(), parentId);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-5 shadow-2xl">
        <h3 className="text-base font-semibold mb-3">Add Team</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Team Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Finance"
              className="w-full rounded-xl bg-neutral-900/60 border border-white/10 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Parent Team (optional)</label>
            <select
              value={parentId ?? ""}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full h-9 rounded-lg bg-neutral-900/60 border border-white/10 px-2 text-sm text-neutral-200"
            >
              <option value="">— None (root) —</option>
              {teamOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
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
