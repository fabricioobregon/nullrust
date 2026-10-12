import { login } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from, error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-6">
      <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold">
            AGENTS<span className="text-indigo-600">.md</span> Builder
          </h1>
          <p className="mt-1 text-sm text-slate-500">Enter the password to continue.</p>
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</div>
        )}

        <form action={login} className="space-y-4">
          <input type="hidden" name="from" value={from ?? "/"} />
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="Password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
