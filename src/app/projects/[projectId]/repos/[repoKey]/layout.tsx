import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { repos, isRepoKey } from "@/lib/repos";
import { deleteProject } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function RepoLayout({
  params,
  children,
}: {
  params: Promise<{ projectId: string; repoKey: string }>;
  children: React.ReactNode;
}) {
  const { projectId, repoKey } = await params;
  if (!isRepoKey(repoKey)) notFound();

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <a href="/" className="text-sm text-slate-500 hover:text-slate-700">
            &larr; All projects
          </a>
          <h1 className="mt-1 text-2xl font-semibold">{project.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/projects/${projectId}/repos/${repoKey}/generate`}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
          >
            Generate AGENTS.md
          </a>
          <form action={deleteProject.bind(null, projectId)}>
            <button
              type="submit"
              className="rounded-md border border-red-300 px-4 py-2 font-medium text-red-600 hover:bg-red-50"
            >
              Delete project
            </button>
          </form>
        </div>
      </div>

      <nav className="flex gap-1 border-b border-slate-200">
        {repos.map((repo) => {
          const active = repo.key === repoKey;
          return (
            <a
              key={repo.key}
              href={`/projects/${projectId}/repos/${repo.key}`}
              className={
                "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition " +
                (active
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700")
              }
            >
              <span>{repo.icon}</span> {repo.title}
            </a>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
