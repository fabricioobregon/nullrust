"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FieldOption } from "@/lib/aspects/types";

// Grid-based cards replaced a hard index cutoff (DEFAULT_VISIBLE = 6) that
// hid any option past the 6th regardless of how it'd actually lay out —
// disputed earlier for exactly that reason. Below this threshold, every
// option just renders, full stop. Above it, search appears immediately
// (not gated behind expanding first) and only CAPPED_VISIBLE_COUNT render
// until "Show all" is clicked — same slice mechanism as before, just a
// higher, grid-appropriate count instead of a flat "6".
const MANY_OPTIONS_THRESHOLD = 10;
const CAPPED_VISIBLE_COUNT = 9;

const MAX_TILT_DEG = 8;

// A small, fixed, literal set of Tailwind classes — Tailwind v4 needs
// literal class strings in source to generate the utility, so this can't be
// templated at runtime (no `bg-${x}-100`). Deliberately excludes emerald
// (recommended/success), amber (pending-change warning), and red
// (destructive) — this decorative palette must never collide with those
// existing semantic meanings elsewhere in the app.
const MONOGRAM_PALETTE = [
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-teal-100 text-teal-700",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function monogramClasses(key: string): string {
  return MONOGRAM_PALETTE[hashString(key) % MONOGRAM_PALETTE.length];
}

// prefers-reduced-motion is a browser-only external store — read via
// useSyncExternalStore (not useState+useEffect) for a safe `false` during
// SSR with no hydration mismatch, same technique as
// business-context-editor.tsx's api-key read.
function subscribeToReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot(): boolean {
  return false;
}

function OptionCard({
  opt,
  inputType,
  fieldId,
  checked,
  reducedMotion,
  inputRef,
}: {
  opt: FieldOption;
  inputType: "radio" | "checkbox";
  fieldId: string;
  checked: boolean;
  reducedMotion: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
}) {
  // Pointer-only, decorative: writes the transform directly on the DOM node
  // (not via React state) so a fast mousemove never triggers a re-render,
  // same performance reasoning OptionCloud uses in its own animation loop.
  // Never touches focus, hit-testing, or the native input underneath.
  function handleMouseMove(e: React.MouseEvent<HTMLLabelElement>) {
    if (reducedMotion) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 2 * MAX_TILT_DEG;
    const rotateX = -(py - 0.5) * 2 * MAX_TILT_DEG;
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(14px)`;
  }
  function handleMouseLeave(e: React.MouseEvent<HTMLLabelElement>) {
    e.currentTarget.style.transform = "";
  }

  return (
    <label
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={
        "flex cursor-pointer flex-col gap-1 rounded-xl border bg-white p-3 text-sm transition-transform duration-150 ease-out hover:shadow-md " +
        "has-[:checked]:scale-[1.02] has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700 has-[:checked]:shadow-lg " +
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-400 has-[:focus-visible]:ring-offset-2 " +
        (opt.recommended ? "border-emerald-200" : "border-slate-200")
      }
    >
      <span className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          type={inputType}
          name={fieldId}
          value={opt.value}
          defaultChecked={checked}
          className="accent-indigo-600"
        />
        {opt.icon ? (
          <svg viewBox="0 0 24 24" width={18} height={18} fill={opt.icon.hex} aria-hidden="true" className="shrink-0">
            <path d={opt.icon.path} />
          </svg>
        ) : (
          <span
            aria-hidden="true"
            className={
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold " +
              monogramClasses(opt.group ?? opt.value)
            }
          >
            {opt.label.slice(0, 2).toUpperCase()}
          </span>
        )}
        <span className="flex-1">{opt.label}</span>
        {opt.recommended && (
          <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
            Recommended
          </span>
        )}
      </span>
      {opt.description && <span className="pl-[30px] text-xs text-slate-500">{opt.description}</span>}
    </label>
  );
}

export function SearchableOptions({
  options,
  selected,
  fieldId,
  inputType,
  onValueChange,
  value,
}: {
  options: FieldOption[];
  selected: Set<string>;
  fieldId: string;
  inputType: "radio" | "checkbox";
  /** Fires with the field's new value (string for radio, string[] for checkbox) — lets a parent form re-narrow sibling fields live, before saving. */
  onValueChange?: (value: string | string[]) => void;
  /**
   * The authoritative current value, if the parent wants to veto a pick
   * (e.g. a "this will clear X, continue?" prompt the user declined).
   * Mirrors OptionCloud's same controlled-revert prop. Omit for
   * uncontrolled use — every current caller does.
   */
  value?: string;
}) {
  const reducedMotion = useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);

  // If an already-saved answer would land past the capped slice, start
  // expanded so nothing the user previously chose silently disappears.
  const hasHiddenSelection =
    options.length > MANY_OPTIONS_THRESHOLD &&
    options.some((o, i) => selected.has(o.value) && i >= CAPPED_VISIBLE_COUNT);
  const [expanded, setExpanded] = useState(hasHiddenSelection);
  const [query, setQuery] = useState("");

  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  useEffect(() => {
    if (value === undefined) return;
    const input = inputRefs.current.get(value);
    if (input && !input.checked) input.checked = true;
  }, [value]);

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const showSearch = options.length > MANY_OPTIONS_THRESHOLD;
  const capped = !expanded && !searching && options.length > MANY_OPTIONS_THRESHOLD;
  const visible = searching
    ? options.filter((o) => o.label.toLowerCase().includes(q))
    : capped
      ? options.slice(0, CAPPED_VISIBLE_COUNT)
      : options;

  return (
    <div className="mt-2 space-y-2">
      {showSearch && (
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${options.length} options...`}
          className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}

      <div className="relative">
        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
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
            <OptionCard
              key={opt.value}
              opt={opt}
              inputType={inputType}
              fieldId={fieldId}
              checked={selected.has(opt.value)}
              reducedMotion={reducedMotion}
              inputRef={(el) => {
                if (el) inputRefs.current.set(opt.value, el);
                else inputRefs.current.delete(opt.value);
              }}
            />
          ))}
        </div>
        {searching && visible.length === 0 && (
          <p className="text-sm text-slate-400">No options match &ldquo;{query}&rdquo;.</p>
        )}
        {/* Purely decorative — nothing real is clipped beneath it, every
            interactive option that isn't shown here simply isn't rendered
            at all (see `visible` above), so there's no invisible-but-
            focusable element for a keyboard user to land on. */}
        {capped && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>

      {capped && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Show all {options.length} options
        </button>
      )}
    </div>
  );
}
