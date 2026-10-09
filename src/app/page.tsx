import { db } from "@/lib/db";
import { createProject } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12 space-y-6">
        <h1 className="text-2xl font-semibold">AGENTS.md Builder</h1>
        <p className="text-slate-600">
          Configure your stack and conventions, then generate an{" "}
          <code className="rounded bg-slate-200 px-1">AGENTS.md</code> file to guard-rail any coding
          agent working in your repos. Sign in with GitHub to create and manage your projects.
        </p>
        <a
          href="/api/auth/github"
          className="inline-block rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
        >
          Sign in with GitHub
        </a>
      </div>
    );
  }

  const projects = await db.project.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Your projects</h1>
        <p className="mt-1 text-slate-600">
          A project groups the repos that make up one system &mdash; add infra, backend, frontend,
          mobile, or other repos as needed. Configure each one once, then generate an{" "}
          <code className="rounded bg-slate-200 px-1">AGENTS.md</code> to guard-rail any coding agent
          working in it.
        </p>
      </div>

      <form action={createProject} className="flex gap-3">
        <input
          name="name"
          required
          placeholder="e.g. payments-service"
          className="flex-1 rounded-md border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
        >
          New project
        </button>
      </form>

      {projects.length === 0 ? (
        <p className="text-slate-500">No projects yet — create one above to get started.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <li key={p.id}>
              <a
                href={`/projects/${p.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-400 hover:shadow-md"
              >
                <div className="font-medium">{p.name}</div>
                <div className="mt-1 text-sm text-slate-500">
                  Updated {p.updatedAt.toLocaleDateString()}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
