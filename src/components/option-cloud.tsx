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

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function mapRange(v: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) return outMin;
  const t = (v - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
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
  const hoveredIndex = useRef<number | null>(null);
  const [enhanced, setEnhanced] = useState(false);

  const groupClassFor = useMemo(() => {
    const order: string[] = [];
    for (const opt of options) {
      if (opt.group && !order.includes(opt.group)) order.push(opt.group);
    }
    const map = new Map<string, string>();
    order.forEach((g, i) => map.set(g, GROUP_BG_CLASSES[i % GROUP_BG_CLASSES.length]));
    return (group: string | undefined) => (group ? map.get(group) : undefined);
  }, [options]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || options.length === 0) return;

    // Decorative ambient motion — an explicit reduced-motion preference
    // keeps the plain flat cloud instead of a spinning one. Drag is still
    // user-initiated, not ambient, so it would be fine either way, but
    // there's no 3D engine to drag without this running, so we just skip
    // the whole upgrade and keep the accessible 2D fallback.
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
    function onChange() {
      // A selection was just made (or changed) within this group — freeze
      // ambient rotation from here on, same as if it had loaded pre-selected.
      hasSelection = true;
    }

    function tick(time: number) {
      if (cancelled || !wasm) return;
      const dt = lastTime ? Math.min(time - lastTime, 50) : 16;
      lastTime = time;

      if (!dragging && !pausedForFocus && !hasSelection) {
        angleY += dt * 0.00025;
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
    // to start already-frozen); live changes come from the "change" listener
    // above, not from re-running this effect, so it's excluded here on
    // purpose — including it would tear down and rebuild the whole 3D engine
    // (and reset rotation/drag state) on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length]);

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
            className={[
              "flex cursor-pointer select-none flex-col items-center gap-1 rounded-xl p-2 font-semibold transition-all duration-150 ease-out",
              enhanced ? "absolute left-1/2 top-1/2 whitespace-nowrap" : "relative inline-flex",
              !enhanced && ROTATIONS[i % ROTATIONS.length],
              isSelected ? "bg-indigo-50 ring-2 ring-indigo-600" : (groupClassFor(opt.group) ?? "bg-slate-50"),
              !enhanced && !isSelected && "hover:ring-2 hover:ring-indigo-400",
              !enhanced && "hover:z-10 hover:scale-110 hover:rotate-0",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-400 has-[:focus-visible]:ring-offset-2",
            ].join(" ")}
          >
            <input
              type={inputType}
              name={fieldId}
              value={opt.value}
              defaultChecked={isSelected}
              className="sr-only"
            />
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
            <span className={[WEIGHT_TEXT_CLASSES[opt.weight ?? "md"], isSelected ? "text-indigo-700" : "text-slate-600"].join(" ")}>
              {opt.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
