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
// than a click. Without this, setPointerCapture engages on every press —
// including a plain click — which retargets the subsequent click event to
// the container instead of the label/input, silently breaking selection.
const DRAG_THRESHOLD = 6;

// How long a click must go uninterrupted before it's treated as confirmed,
// rather than just the most recent tap. See the "charge" ring in the render.
const CHARGE_DURATION_MS = 3000;

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function mapRange(v: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) return outMin;
  const t = (v - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

function labelVariantClasses(isSelected: boolean, enhanced: boolean, groupClass: string): string {
  return [
    isSelected ? "bg-indigo-50 ring-2 ring-indigo-600" : groupClass,
    !enhanced && !isSelected && "hover:ring-2 hover:ring-indigo-400",
  ]
    .filter(Boolean)
    .join(" ");
}

function captionVariantClasses(isSelected: boolean, weightClass: string): string {
  return [weightClass, isSelected ? "text-indigo-700" : "text-slate-600"].join(" ");
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
  const captionRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const ringRefs = useRef<Array<SVGRectElement | null>>([]);
  const hoveredIndex = useRef<number | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  // Mirrors `enhanced` into a ref so the effect's long-lived closures (set
  // up once, before `enhanced` first flips true) can read its current value
  // instead of the one captured when those closures were created.
  const enhancedRef = useRef(enhanced);
  enhancedRef.current = enhanced;

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
    // keeps the plain flat cloud instead of a spinning one. Drag is still
    // user-initiated, not ambient, so it would be fine either way, but
    // there's no 3D engine to drag without this running, so we just skip
    // the whole upgrade and keep the accessible 2D fallback. The charge/
    // confirm ring is part of that same upgrade — skipped here too, so a
    // plain click selects immediately, same as it always has.
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

    // Confirmation state: a click doesn't select immediately — it starts a
    // timed "charge" on that item, visible as a ring drawing itself around
    // it. Only once it completes uninterrupted does that item become the
    // confirmed selection (styled + treated as checked going forward); a
    // different click before then cancels it and starts charging the new
    // one instead. This applies the same way whether nothing was selected
    // yet or an existing choice is being changed.
    let confirmedIndex = options.findIndex((o) => selected.has(o.value));
    if (confirmedIndex === -1) confirmedIndex = null as unknown as number;
    let chargingIndex: number | null = null;
    let chargeStart = 0;

    function resetRing(i: number | null) {
      if (i === null) return;
      const ring = ringRefs.current[i];
      if (!ring) return;
      ring.style.opacity = "0";
      ring.style.strokeDashoffset = "100";
    }

    function confirmIndex(i: number) {
      options.forEach((opt, idx) => {
        const label = labelRefs.current[idx];
        const caption = captionRefs.current[idx];
        if (!label || !caption) return;
        const isSel = idx === i;
        label.className = buildLabelBaseClasses(idx, enhancedRef.current) + " " + labelVariantClasses(isSel, enhancedRef.current, groupClassFor(opt.group));
        caption.className = captionVariantClasses(isSel, WEIGHT_TEXT_CLASSES[opt.weight ?? "md"]);
      });
      confirmedIndex = i;
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
      // onPointerMove) engages capture, so a plain click/tap reaches the
      // label/input exactly like a normal, uncaptured click would.
    }
    function onPointerMove(e: PointerEvent) {
      if (!pointerDown) return;
      if (!dragging) {
        const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
        if (dist < DRAG_THRESHOLD) return;
        dragging = true;
        container!.setPointerCapture(e.pointerId);
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
    }
    function onFocusIn() {
      pausedForFocus = true;
    }
    function onFocusOut() {
      pausedForFocus = false;
    }
    function onChange(e: Event) {
      hasSelection = true;

      if (!wasm) return; // WASM never loaded — fall back to instant native selection.

      const value = (e.target as HTMLInputElement).value;
      const index = options.findIndex((o) => o.value === value);
      if (index === -1 || index === confirmedIndex) return;

      if (chargingIndex !== null && chargingIndex !== index) resetRing(chargingIndex);
      chargingIndex = index;
      chargeStart = performance.now();
    }

    function tick(time: number) {
      if (cancelled || !wasm) return;
      const dt = lastTime ? Math.min(time - lastTime, 50) : 16;
      lastTime = time;

      if (!dragging && !pausedForFocus && !hasSelection) {
        angleY += dt * 0.00025;
      }

      if (chargingIndex !== null) {
        const progress = wasm.chargeProgress(time - chargeStart, CHARGE_DURATION_MS);
        const ring = ringRefs.current[chargingIndex];
        if (ring) {
          ring.style.opacity = "1";
          ring.style.strokeDashoffset = String(100 * (1 - progress));
        }
        if (progress >= 1) {
          const justConfirmed = chargingIndex;
          chargingIndex = null;
          confirmIndex(justConfirmed);
          resetRing(justConfirmed);
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

    const resizeObserver = new ResizeObserver(() => sizeToContainer());
    resizeObserver.observe(container);
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    container.addEventListener("focusin", onFocusIn);
    container.addEventListener("focusout", onFocusOut);
    container.addEventListener("change", onChange);

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
    };
    // `selected` is intentionally read only for its initial value (whether
    // to start already-frozen/already-confirmed); live changes come from the
    // "change" listener above, not from re-running this effect, so it's
    // excluded here on purpose — including it would tear down and rebuild
    // the whole 3D engine (and reset rotation/drag/charge state) on every
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

  return (
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
            title={opt.description ?? opt.label}
            onPointerEnter={() => {
              hoveredIndex.current = i;
            }}
            onPointerLeave={() => {
              hoveredIndex.current = null;
            }}
            className={
              buildLabelBaseClasses(i, enhanced) +
              " " +
              labelVariantClasses(isSelected, enhanced, groupClassFor(opt.group))
            }
          >
            <input
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
                  stroke="#4f46e5"
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
            <span
              ref={(el) => {
                captionRefs.current[i] = el;
              }}
              className={captionVariantClasses(isSelected, WEIGHT_TEXT_CLASSES[opt.weight ?? "md"])}
            >
              {opt.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
