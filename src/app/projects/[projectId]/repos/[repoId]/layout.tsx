import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getRepoKind } from "@/lib/repos";
import { deleteProject } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function RepoLayout({
  params,
  children,
}: {
  params: Promise<{ projectId: string; repoId: string }>;
  children: React.ReactNode;
}) {
  const { projectId, repoId } = await params;

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  const repos = await db.repo.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } });
  const activeRepo = repos.find((r) => r.id === repoId);
  if (!activeRepo) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            &larr; All projects
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{project.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/projects/${projectId}/repos/${repoId}/generate`}
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

      <div className="flex gap-8">
        {/* Repo menu — GitHub-style list of repos under this project. */}
        <nav className="w-56 shrink-0 space-y-1">
          {repos.map((repo) => {
            const kind = getRepoKind(repo.kind);
            const active = repo.id === repoId;
            return (
              <a
                key={repo.id}
                href={`/projects/${projectId}/repos/${repo.id}`}
                className={
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition " +
                  (active
                    ? "bg-indigo-50 font-medium text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100")
                }
              >
                <span>{kind?.icon ?? "📦"}</span>
                <span className="truncate">{repo.name}</span>
              </a>
            );
          })}
          <a
            href={`/projects/${projectId}/repos/new`}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            <span>+</span> Add repo
          </a>
        </nav>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
