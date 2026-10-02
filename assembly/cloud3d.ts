// Real 3D math for the word-cloud effect, compiled to WebAssembly.
// Keeps the heavy-ish per-frame work (rotate + perspective-project every
// point, every animation frame) out of the JS main-thread hot path. At this
// item count (dozens, not thousands) a plain JS version would be plenty
// fast too — this exists because the point was specifically to do this
// piece in WASM, not because JS couldn't keep up.

const MAX_POINTS: i32 = 256;

// Unit-sphere base coordinates, set once by initSphere().
const baseX = new Float32Array(MAX_POINTS);
const baseY = new Float32Array(MAX_POINTS);
const baseZ = new Float32Array(MAX_POINTS);

// Per-frame output: screen-space position, depth-scale, and raw depth
// (the latter so the caller can derive opacity/z-index on the JS side).
const outX = new Float32Array(MAX_POINTS);
const outY = new Float32Array(MAX_POINTS);
const outScale = new Float32Array(MAX_POINTS);
const outDepth = new Float32Array(MAX_POINTS);

let pointCount: i32 = 0;

/**
 * Distributes `n` points evenly across a unit sphere using a Fibonacci
 * spiral (golden-angle spacing), which — unlike naive latitude/longitude
 * grids — avoids bunching points up at the poles, so the cloud looks
 * uniformly scattered from every viewing angle.
 */
export function initSphere(n: i32): void {
  pointCount = n < MAX_POINTS ? n : MAX_POINTS;
  const goldenAngle: f32 = 2.39996323; // pi * (3 - sqrt(5))

  for (let i = 0; i < pointCount; i++) {
    const t: f32 = (<f32>i + 0.5) / <f32>pointCount;
    const incl: f32 = Mathf.acos(1.0 - 2.0 * t);
    const azim: f32 = goldenAngle * <f32>i;
    const sinIncl: f32 = Mathf.sin(incl);

    baseX[i] = sinIncl * Mathf.cos(azim);
    baseY[i] = sinIncl * Mathf.sin(azim);
    baseZ[i] = Mathf.cos(incl);
  }
}

/**
 * Rotates every point by (angleX, angleY) around the sphere's center, then
 * perspective-projects it onto the screen. Results land in outX/outY/
 * outScale/outDepth — read them from WASM linear memory via the pointer
 * getters below. Call once per animation frame.
 */
export function project(angleX: f32, angleY: f32, radius: f32, focalLength: f32): void {
  const cosX: f32 = Mathf.cos(angleX);
  const sinX: f32 = Mathf.sin(angleX);
  const cosY: f32 = Mathf.cos(angleY);
  const sinY: f32 = Mathf.sin(angleY);

  for (let i = 0; i < pointCount; i++) {
    const x: f32 = baseX[i] * radius;
    const y: f32 = baseY[i] * radius;
    const z: f32 = baseZ[i] * radius;

    // Rotate around the Y axis (left/right spin).
    const x1: f32 = x * cosY + z * sinY;
    const z1: f32 = -x * sinY + z * cosY;

    // Rotate around the X axis (up/down tilt).
    const y1: f32 = y * cosX - z1 * sinX;
    const z2: f32 = y * sinX + z1 * cosX;

    const denom: f32 = focalLength + z2;
    const scale: f32 = denom > 0.001 ? focalLength / denom : focalLength / 0.001;

    outX[i] = x1 * scale;
    outY[i] = y1 * scale;
    outScale[i] = scale;
    outDepth[i] = z2;
  }
}

export function getPointCount(): i32 {
  return pointCount;
}

// Pointer getters: JS wraps these in `new Float32Array(memory.buffer, ptr, n)`
// to read the results without copying.
export function getOutXPtr(): usize {
  return outX.dataStart;
}
export function getOutYPtr(): usize {
  return outY.dataStart;
}
export function getOutScalePtr(): usize {
  return outScale.dataStart;
}
export function getOutDepthPtr(): usize {
  return outDepth.dataStart;
}

/**
 * Eased 0..1 progress for the "charge" confirmation ring: clicking an
 * option doesn't select it immediately, it starts a timed ring that must
 * complete uninterrupted before the choice is treated as confirmed. Smoothstep
 * (ease in, ease out) reads as a more deliberate "charging up" than a linear
 * fill would. Stateless/pure — the caller tracks elapsed time and calls this
 * once per frame; no WASM-side timer state to get out of sync with the DOM.
 */
export function chargeProgress(elapsedMs: f32, durationMs: f32): f32 {
  if (durationMs <= 0) return 1.0;
  let t: f32 = elapsedMs / durationMs;
  if (t > 1.0) t = 1.0;
  if (t < 0.0) t = 0.0;
  return t * t * (3.0 - 2.0 * t);
}
