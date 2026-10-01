"use client";

import { useEffect, useRef, useState } from "react";
import { FieldOption } from "@/lib/aspects/types";
import { createCloud3dInstance, Cloud3dExports } from "@/lib/wasm-cloud3d";

const WEIGHT_CLASSES: Record<NonNullable<FieldOption["weight"]>, string> = {
  xl: "text-3xl sm:text-4xl",
  lg: "text-2xl sm:text-3xl",
  md: "text-xl sm:text-2xl",
  sm: "text-base sm:text-lg",
};

// Deterministic (not random) so the pre-hydration layout never shifts
// between renders — cycling through a small set of tilts is what gives the
// "scattered" feel before the 3D engine (if it loads) takes over.
const ROTATIONS = ["-rotate-3", "rotate-2", "rotate-0", "-rotate-1", "rotate-3", "rotate-1", "-rotate-2"];

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
    let dragging = false;
    let pausedForFocus = false;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let radius = 100;
    let focalLength = 260;
    let minScale = 0.6;
    let maxScale = 1.6;

    function sizeToContainer() {
      const rect = container!.getBoundingClientRect();
      const half = Math.min(rect.width, rect.height) / 2;
      radius = Math.max(half * 0.72, 60);
      focalLength = radius * 2.3;
      minScale = focalLength / (focalLength + radius);
      maxScale = focalLength / (focalLength - radius);
    }

    function onPointerDown(e: PointerEvent) {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      container!.setPointerCapture(e.pointerId);
    }
    function onPointerMove(e: PointerEvent) {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      angleY += dx * 0.01;
      angleX += dy * 0.01;
    }
    function onPointerUp() {
      dragging = false;
    }
    function onFocusIn() {
      pausedForFocus = true;
    }
    function onFocusOut() {
      pausedForFocus = false;
    }

    function tick(time: number) {
      if (cancelled || !wasm) return;
      const dt = lastTime ? Math.min(time - lastTime, 50) : 16;
      lastTime = time;

      if (!dragging && !pausedForFocus) {
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

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("focusin", onFocusIn);
      container.removeEventListener("focusout", onFocusOut);
    };
  }, [options.length]);

  return (
    <div
      ref={containerRef}
      className={
        enhanced
          ? "relative h-[360px] touch-none select-none sm:h-[440px]"
          : "flex flex-wrap items-baseline justify-center gap-x-6 gap-y-3 px-4 py-8"
      }
      style={enhanced ? { cursor: "grab" } : undefined}
    >
      {options.map((opt, i) => {
        const isSelected = selected.has(opt.value);
        return (
          <label
            key={opt.value}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            title={opt.description}
            onPointerEnter={() => {
              hoveredIndex.current = i;
            }}
            onPointerLeave={() => {
              hoveredIndex.current = null;
            }}
            className={[
              "cursor-pointer select-none rounded-md px-1 font-semibold transition-colors duration-150 ease-out",
              enhanced ? "absolute left-1/2 top-1/2 whitespace-nowrap" : "relative inline-block transition-transform",
              WEIGHT_CLASSES[opt.weight ?? "md"],
              !enhanced && ROTATIONS[i % ROTATIONS.length],
              isSelected
                ? "text-indigo-700 underline underline-offset-4"
                : "text-slate-400 hover:text-indigo-600",
              !enhanced && "hover:z-10 hover:scale-125 hover:rotate-0",
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
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
