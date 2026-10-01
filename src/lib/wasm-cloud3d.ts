export type Cloud3dExports = {
  memory: WebAssembly.Memory;
  initSphere(n: number): void;
  project(angleX: number, angleY: number, radius: number, focalLength: number): void;
  getPointCount(): number;
  getOutXPtr(): number;
  getOutYPtr(): number;
  getOutScalePtr(): number;
  getOutDepthPtr(): number;
};

// The compiled module (bytecode) is fetched/compiled once and cached; each
// caller gets its own instantiate() with independent memory/state, so
// multiple cloud fields on the same page never share rotation state.
let modulePromise: Promise<WebAssembly.Module> | null = null;

function getModule(): Promise<WebAssembly.Module> {
  if (!modulePromise) {
    modulePromise = WebAssembly.compileStreaming
      ? WebAssembly.compileStreaming(fetch("/wasm/cloud3d.wasm"))
      : fetch("/wasm/cloud3d.wasm")
          .then((r) => r.arrayBuffer())
          .then((buf) => WebAssembly.compile(buf));
  }
  return modulePromise;
}

export async function createCloud3dInstance(): Promise<Cloud3dExports> {
  const mod = await getModule();
  const instance = await WebAssembly.instantiate(mod, {
    env: {
      abort: (msg: number, file: number, line: number, col: number) => {
        console.error("cloud3d wasm abort", { msg, file, line, col });
      },
    },
  });
  return instance.exports as unknown as Cloud3dExports;
}
