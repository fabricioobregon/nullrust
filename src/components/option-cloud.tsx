"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FieldOption } from "@/lib/aspects/types";
import { createCloud3dInstance, Cloud3dExports } from "@/lib/wasm-cloud3d";

const WEIGHT_ICON_PX: Record<NonNullable<FieldOption["weight"]>, number> = {
  xl: 60,
  lg: 48,
  md: 38,
  sm: 30,
};
const WEIGHT_TEXT_CLASSES: Record<NonNullable<FieldOption["weight"]>, string> = {
  xl: "text-sm",
  lg: "text-sm",
  md: "text-xs",
  sm: "text-xs",
};

// Deterministic (not random) so the pre-hydration layout never shifts
// between renders — cycling through a small set of tilts is what gives the
// "scattered" feel before the 3D engine (if it loads) takes over.
const ROTATIONS = ["-rotate-3", "rotate-2", "rotate-0", "-rotate-1", "rotate-3", "rotate-1", "-rotate-2"];

// Background tint per `group`, assigned by order of first appearance so this
// stays domain-agnostic (not hardcoded to language category names).
const GROUP_BG_CLASSES = [
  "bg-orange-50",
  "bg-violet-50",
  "bg-emerald-50",
  "bg-sky-50",
  "bg-rose-50",
  "bg-amber-50",
];

// Distance (px) a pointer must travel before a press counts as a drag rather
// than a hold/click. Without this, setPointerCapture engages on every
// press — which retargets subsequent events to the container instead of
// the label/input — and a hold-in-progress would get confused with the
// user just steadying their finger.
const DRAG_THRESHOLD = 6;

// A hold specifically gets a much more generous movement allowance before
// it's cancelled. DRAG_THRESHOLD is tuned for telling a quick click apart
// from the *start* of an intentional drag — but holding a position within
// 6px for a full 3 seconds straight is an unrealistic bar for any real
// hand/trackpad; ordinary tremor over that long would cross it well before
// the ring ever completed, cancelling it almost immediately every time.
const HOLD_CANCEL_DISTANCE = 24;

// How long an option must be held down, uninterrupted, before it's
// confirmed as the selection. See the charge ring in the render.
const HOLD_DURATION_MS = 3000;
const RING_COLOR = "#059669"; // emerald-600 — matches the app's existing success/confirm color

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function mapRange(v: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) return outMin;
  const t = (v - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

// The cloud itself never shows a persistent "selected" look anymore — that
// moved to the dedicated display above it (see the component's return).
// Items here only ever show their group tint, hover, and (while actively
// held) the charge ring.
function labelVariantClasses(enhanced: boolean, groupClass: string): string {
  return [groupClass, !enhanced && "hover:ring-2 hover:ring-indigo-400"].filter(Boolean).join(" ");
}

export function OptionCloud({
  options,
  selected,
  fieldId,
  inputType,
}: {
  options: FieldOption[];
  selected: Set<string>;
  fieldId: string;
  inputType: "radio" | "checkbox";
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<Array<HTMLLabelElement | null>>([]);
  const ringRefs = useRef<Array<SVGRectElement | null>>([]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const hoveredIndex = useRef<number | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  // The current selection, shown above the cloud instead of inside it — with
  // 20+ scattered, rotating items, spotting which one is "selected" inside
  // the cloud itself was hard to see at a glance. Only meaningful for
  // single-select (radio) fields; multi-select fields don't have a single
  // "the" selection to headline.
  const [confirmedValue, setConfirmedValue] = useState<string | null>(
    () => options.find((o) => selected.has(o.value))?.value ?? null
  );
  // Mirrors `enhanced` into a ref so the effect's long-lived closures (set
  // up once, before `enhanced` first flips true) can read its current value
  // instead of the one captured when those closures were created. Updated
  // in its own effect rather than during render, which refs shouldn't be
  // mutated in.
  const enhancedRef = useRef(enhanced);
  useEffect(() => {
    enhancedRef.current = enhanced;
  }, [enhanced]);

  const groupClassFor = useMemo(() => {
    const order: string[] = [];
    for (const opt of options) {
      if (opt.group && !order.includes(opt.group)) order.push(opt.group);
    }
    const map = new Map<string, string>();
    order.forEach((g, i) => map.set(g, GROUP_BG_CLASSES[i % GROUP_BG_CLASSES.length]));
    return (group: string | undefined) => map.get(group ?? "") ?? "bg-slate-50";
  }, [options]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || options.length === 0) return;

    // Decorative ambient motion — an explicit reduced-motion preference
    // keeps the plain flat cloud instead of a spinning one, and skips the
    // whole hold-to-confirm upgrade too: a plain click selects immediately,
    // same as it always has. (There's also no 3D engine to drag without
    // this running.)
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let raf = 0;
    let wasm: Cloud3dExports | null = null;
    let angleX = 0.15;
    let angleY = 0;
    let pointerDown = false;
    let dragging = false;
    let pausedForFocus = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let radius = 100;
    let focalLength = 260;
    let minScale = 0.6;
    let maxScale = 1.6;
    // Once any option is (or becomes) selected, the ambient auto-rotation
    // stops — a moving target is why clicking was unreliable in the first
    // place, and once a choice exists there's no reason to keep spinning.
    let hasSelection = selected.size > 0;

    // Hold-to-confirm: a click doesn't select an option — pressing and
    // holding it does, for HOLD_DURATION_MS straight. holdingIndex tracks
    // which item is currently being held; the ring only advances while the
    // same pointer stays down on that item and the gesture hasn't turned
    // into a cloud-rotate drag. Releasing early cancels it with no change.
    let holdingIndex: number | null = null;
    let holdPointerId: number | null = null;
    let holdStart = 0;

    function resetRing(i: number | null) {
      if (i === null) return;
      const ring = ringRefs.current[i];
      if (!ring) return;
      ring.style.opacity = "0";
      ring.style.strokeDashoffset = "100";
    }

    function cancelHold() {
      resetRing(holdingIndex);
      holdingIndex = null;
      holdPointerId = null;
    }

    function sizeToContainer() {
      const rect = container!.getBoundingClientRect();
      const half = Math.min(rect.width, rect.height) / 2;
      radius = Math.max(half * 0.72, 60);
      focalLength = radius * 2.3;
      minScale = focalLength / (focalLength + radius);
      maxScale = focalLength / (focalLength - radius);
    }

    function onPointerDown(e: PointerEvent) {
      pointerDown = true;
      dragging = false;
      startX = lastX = e.clientX;
      startY = lastY = e.clientY;
      // Deliberately NOT capturing yet — only a confirmed drag (see
      // onPointerMove) engages capture, so a plain press/hold reaches the
      // label/input exactly like a normal, uncaptured press would.
    }
    function onPointerMove(e: PointerEvent) {
      if (!pointerDown) return;
      if (!dragging) {
        const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
        const threshold = holdingIndex !== null ? HOLD_CANCEL_DISTANCE : DRAG_THRESHOLD;
        if (dist < threshold) {
          // Still within tolerance — track position so that if this *does*
          // later cross the threshold, the resulting rotation is just the
          // latest incremental move, not a jump from the original press point.
          lastX = e.clientX;
          lastY = e.clientY;
          return;
        }
        dragging = true;
        container!.setPointerCapture(e.pointerId);
        if (holdingIndex !== null) cancelHold(); // turned into a rotate-drag, not a hold
      }
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      angleY += dx * 0.01;
      angleX += dy * 0.01;
    }
    function onPointerUp() {
      pointerDown = false;
      dragging = false;
      if (holdingIndex !== null) cancelHold();
    }
    function onFocusIn() {
      pausedForFocus = true;
    }
    function onFocusOut() {
      pausedForFocus = false;
    }
    function onChange(e: Event) {
      // Fires both for our own programmatic commit (after a completed hold)
      // and for genuine native changes (keyboard arrow-key navigation within
      // the radio group) — updating the top display here, unconditionally,
      // covers both without making keyboard users wait through a hold they
      // have no way to perform.
      hasSelection = true;
      const input = e.target as HTMLInputElement;
      if (inputType === "radio") setConfirmedValue(input.value);
    }

    function tick(time: number) {
      if (cancelled || !wasm) return;
      const dt = lastTime ? Math.min(time - lastTime, 50) : 16;
      lastTime = time;

      if (!dragging && !pausedForFocus && !hasSelection) {
        angleY += dt * 0.00025;
      }

      if (holdingIndex !== null && !dragging) {
        const progress = wasm.chargeProgress(time - holdStart, HOLD_DURATION_MS);
        const ring = ringRefs.current[holdingIndex];
        if (ring) {
          ring.style.opacity = "1";
          ring.style.strokeDashoffset = String(100 * (1 - progress));
        }
        if (progress >= 1) {
          const input = inputRefs.current[holdingIndex];
          resetRing(holdingIndex);
          holdingIndex = null;
          holdPointerId = null;
          if (input) {
            input.checked = inputType === "checkbox" ? !input.checked : true;
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      }

      wasm.project(angleX, angleY, radius, focalLength);
      const n = wasm.getPointCount();
      const xs = new Float32Array(wasm.memory.buffer, wasm.getOutXPtr(), n);
      const ys = new Float32Array(wasm.memory.buffer, wasm.getOutYPtr(), n);
      const scales = new Float32Array(wasm.memory.buffer, wasm.getOutScalePtr(), n);

      for (let i = 0; i < n; i++) {
        const el = labelRefs.current[i];
        if (!el) continue;
        const isHovered = hoveredIndex.current === i;
        const s = isHovered ? scales[i] * 1.35 : scales[i];
        el.style.transform = `translate(-50%, -50%) translate3d(${xs[i]}px, ${ys[i]}px, 0) scale(${s})`;
        el.style.opacity = String(clamp(mapRange(scales[i], minScale, maxScale, 0.35, 1), 0.35, 1));
        el.style.zIndex = String(isHovered ? 9999 : Math.round(scales[i] * 1000));
      }

      raf = requestAnimationFrame(tick);
    }

    (async () => {
      try {
        const instance = await createCloud3dInstance();
        if (cancelled) return;
        instance.initSphere(options.length);
        sizeToContainer();
        wasm = instance;
        enhancedRef.current = true;
        setEnhanced(true);
        raf = requestAnimationFrame(tick);
      } catch (err) {
        console.warn("3D cloud effect unavailable, showing flat layout instead:", err);
      }
    })();

    // Per-item hold tracking lives on the container (delegated) so it shares
    // state cleanly with the drag system above — same pointerId, same
    // dragging flag. e.target is traced back to which option's label (if
    // any) was actually pressed via a data attribute set on each label.
    function onItemPointerDown(e: PointerEvent) {
      if (!wasm) return; // no engine loaded — fall back to instant native selection
      const label = (e.target as HTMLElement).closest<HTMLElement>("[data-option-index]");
      if (!label) return;
      const index = Number(label.dataset.optionIndex);
      if (holdingIndex !== null && holdingIndex !== index) cancelHold();
      holdingIndex = index;
      holdPointerId = e.pointerId;
      holdStart = performance.now();
    }
    function onItemPointerUp(e: PointerEvent) {
      if (holdingIndex !== null && holdPointerId === e.pointerId) cancelHold();
    }
    // No pointerleave-based cancellation: it fires on every internal child
    // boundary crossing too (e.g. icon -> caption text within the same
    // label, from nothing more than ordinary hand tremor), which cancelled
    // holds almost as soon as they started — the drag-distance check above
    // (now with its own, more generous threshold while holding) is what
    // actually decides whether the gesture turned into a rotate-drag.
    function onItemClick(e: MouseEvent) {
      // The hold is what selects; suppress the label's default instant
      // click-to-check so pointer/touch users can't shortcut past it. Native
      // keyboard interaction doesn't dispatch click to get here, so it's
      // unaffected.
      if (enhancedRef.current) e.preventDefault();
    }

    const resizeObserver = new ResizeObserver(() => sizeToContainer());
    resizeObserver.observe(container);
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    container.addEventListener("focusin", onFocusIn);
    container.addEventListener("focusout", onFocusOut);
    container.addEventListener("change", onChange);
    container.addEventListener("pointerdown", onItemPointerDown);
    container.addEventListener("pointerup", onItemPointerUp);
    container.addEventListener("pointercancel", onItemPointerUp);
    container.addEventListener("click", onItemClick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("focusin", onFocusIn);
      container.removeEventListener("focusout", onFocusOut);
      container.removeEventListener("change", onChange);
      container.removeEventListener("pointerdown", onItemPointerDown);
      container.removeEventListener("pointerup", onItemPointerUp);
      container.removeEventListener("pointercancel", onItemPointerUp);
      container.removeEventListener("click", onItemClick);
    };
    // `selected` is intentionally read only for its initial value (whether
    // to start already-frozen/already-confirmed); live changes come from the
    // "change" listener above, not from re-running this effect, so it's
    // excluded here on purpose — including it would tear down and rebuild
    // the whole 3D engine (and reset rotation/drag/hold state) on every
    // parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length]);

  function buildLabelBaseClasses(i: number, isEnhanced: boolean): string {
    return [
      "flex cursor-pointer select-none flex-col items-center gap-1 rounded-xl p-2 font-semibold transition-all duration-150 ease-out",
      isEnhanced ? "absolute left-1/2 top-1/2 whitespace-nowrap" : "relative inline-flex",
      !isEnhanced && ROTATIONS[i % ROTATIONS.length],
      !isEnhanced && "hover:z-10 hover:scale-110 hover:rotate-0",
      "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-400 has-[:focus-visible]:ring-offset-2",
    ]
      .filter(Boolean)
      .join(" ");
  }

  const confirmedOption = options.find((o) => o.value === confirmedValue);

  return (
    <div>
      {inputType === "radio" && (
        <div className="mb-4 flex items-center justify-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3">
          {confirmedOption?.icon ? (
            <svg viewBox="0 0 24 24" width={28} height={28} fill={confirmedOption.icon.hex} aria-hidden="true">
              <path d={confirmedOption.icon.path} />
            </svg>
          ) : null}
          <span className="font-semibold text-indigo-700">
            {confirmedOption ? confirmedOption.label : "Nothing selected yet"}
          </span>
        </div>
      )}

      <div
        ref={containerRef}
        className={
          enhanced
            ? "relative h-[380px] touch-none select-none sm:h-[460px]"
            : "flex flex-wrap items-start justify-center gap-3 px-4 py-8"
        }
        style={enhanced ? { cursor: "grab" } : undefined}
      >
        {options.map((opt, i) => {
          const isSelected = selected.has(opt.value);
          const iconPx = WEIGHT_ICON_PX[opt.weight ?? "md"];
          return (
            <label
              key={opt.value}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              data-option-index={i}
              title={opt.description ?? opt.label}
              onPointerEnter={() => {
                hoveredIndex.current = i;
              }}
              onPointerLeave={() => {
                hoveredIndex.current = null;
              }}
              className={
                buildLabelBaseClasses(i, enhanced) + " " + labelVariantClasses(enhanced, groupClassFor(opt.group))
              }
            >
              <input
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type={inputType}
                name={fieldId}
                value={opt.value}
                defaultChecked={isSelected}
                className="sr-only"
              />
              {enhanced && (
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <rect
                    ref={(el) => {
                      ringRefs.current[i] = el;
                      if (el) {
                        el.style.opacity = "0";
                        el.style.strokeDashoffset = "100";
                      }
                    }}
                    x="2"
                    y="2"
                    width="96"
                    height="96"
                    rx="14"
                    fill="none"
                    stroke={RING_COLOR}
                    strokeWidth="4"
                    pathLength={100}
                    strokeDasharray={100}
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {opt.icon ? (
                <svg
                  viewBox="0 0 24 24"
                  width={iconPx}
                  height={iconPx}
                  fill={opt.icon.hex}
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path d={opt.icon.path} />
                </svg>
              ) : null}
              <span className={WEIGHT_TEXT_CLASSES[opt.weight ?? "md"] + " text-slate-600"}>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
