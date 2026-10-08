"use client";

import { useState } from "react";
import { FieldOption } from "@/lib/aspects/types";

// Fewer visible choices makes a decision easier (classic choice-overload
// problem) — so a field with many options shows only this many by default,
// ordered as the registry defines them (already roughly most-common-first in
// practice), with a "show more" expansion for anyone who needs something
// less common. Search only appears once there's something worth searching.
const DEFAULT_VISIBLE = 6;

export function SearchableOptions({
  options,
  selected,
  fieldId,
  inputType,
  onValueChange,
}: {
  options: FieldOption[];
  selected: Set<string>;
  fieldId: string;
  inputType: "radio" | "checkbox";
  /** Fires with the field's new value (string for radio, string[] for checkbox) — lets a parent form re-narrow sibling fields live, before saving. */
  onValueChange?: (value: string | string[]) => void;
}) {
  // If an already-saved answer is hidden in the collapsed set, start expanded
  // so nothing the user previously chose silently disappears from view.
  const hasHiddenSelection = options.slice(DEFAULT_VISIBLE).some((o) => selected.has(o.value));
  const [expanded, setExpanded] = useState(hasHiddenSelection);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const hiddenCount = Math.max(options.length - DEFAULT_VISIBLE, 0);
  const base = expanded || searching ? options : options.slice(0, DEFAULT_VISIBLE);
  const visible = searching ? options.filter((o) => o.label.toLowerCase().includes(q)) : base;

  return (
    <div className="mt-2 space-y-2">
      {(expanded || searching) && options.length > DEFAULT_VISIBLE && (
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${options.length} options...`}
          className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}

      <div
        className="flex flex-wrap gap-2"
        onChange={(e) => {
          if (!onValueChange) return;
          if (inputType === "radio") {
            onValueChange((e.target as HTMLInputElement).value);
            return;
          }
          // Checkbox group: read the live checked set straight from the DOM
          // (includes stale-but-still-rendered options too) rather than
          // tracking a second, parallel piece of React state that could
          // drift out of sync with it.
          const inputs = e.currentTarget.querySelectorAll<HTMLInputElement>(`input[name="${fieldId}"]`);
          onValueChange(Array.from(inputs).filter((i) => i.checked).map((i) => i.value));
        }}
      >
        {visible.map((opt) => (
          <label
            key={opt.value}
            className="flex max-w-[240px] cursor-pointer flex-col gap-0.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700"
          >
            <span className="flex items-center gap-1.5">
              <input
                type={inputType}
                name={fieldId}
                value={opt.value}
                defaultChecked={selected.has(opt.value)}
                className="accent-indigo-600"
              />
              {opt.label}
              {opt.recommended && (
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                  Recommended
                </span>
              )}
            </span>
            {opt.description && <span className="pl-[22px] text-xs text-slate-500">{opt.description}</span>}
          </label>
        ))}
        {searching && visible.length === 0 && (
          <p className="text-sm text-slate-400">No options match &ldquo;{query}&rdquo;.</p>
        )}
      </div>

      {!expanded && !searching && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Show {hiddenCount} more option{hiddenCount === 1 ? "" : "s"}
        </button>
      )}
    </div>
  );
}
