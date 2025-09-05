"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

export type Option = { id: string; label: string };

export default function MultiSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  options: Option[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return options;
    return options.filter((o) => o.label.toLowerCase().includes(s));
  }, [q, options]);

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id]);
  };

  const clear = () => onChange([]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-xl bg-neutral-900/60 border border-white/10 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-900 flex items-center justify-between"
      >
        <span className="truncate">
          {value.length === 0
            ? <span className="text-neutral-500">{placeholder}</span>
            : `${value.length} selected`}
        </span>
        <ChevronDown className="h-4 w-4 text-neutral-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-neutral-950 shadow-2xl">
          <div className="p-2 border-b border-white/10">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-lg bg-neutral-900/60 border border-white/10 px-2.5 py-1.5 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
            />
          </div>

          <ul className="max-h-56 overflow-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-neutral-500">No results</li>
            ) : (
              filtered.map((o) => {
                const active = value.includes(o.id);
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => toggle(o.id)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-900 flex items-center gap-2"
                    >
                      <span className={["h-4 w-4 grid place-items-center rounded border",
                        active ? "border-cyan-400 text-cyan-300" : "border-white/20 text-transparent"
                      ].join(" ")}>
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="text-neutral-200">{o.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <div className="flex items-center justify-between gap-2 border-t border-white/10 p-2">
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 text-xs text-neutral-300 hover:text-neutral-100"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-white/10 bg-neutral-900/60 hover:bg-neutral-900"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
