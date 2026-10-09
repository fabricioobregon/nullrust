import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getRepoKind } from "@/lib/repos";
import { deleteProject, deleteRepo } from "@/app/actions";
import { requireProjectOwner } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function RepoLayout({
  params,
  children,
}: {
  params: Promise<{ projectId: string; repoId: string }>;
  children: React.ReactNode;
}) {
  const { projectId, repoId } = await params;

  // Also gates every nested route (aspects/[aspectKey], generate) — neither
  // fetches its own ownership check, both rely on this layout running first.
  const { project } = await requireProjectOwner(projectId);

  const repos = await db.repo.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } });
  const activeRepo = repos.find((r) => r.id === repoId);
  if (!activeRepo) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            &larr; All projects
          </Link>
          <h1 className="mt-1 break-words text-2xl font-semibold">{project.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`/projects/${projectId}/repos/${repoId}/generate`}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
          >
            Generate AGENTS.md
          </a>
          <form action={deleteRepo.bind(null, repoId)}>
            <button
              type="submit"
              className="rounded-md border border-red-300 px-4 py-2 font-medium text-red-600 hover:bg-red-50"
            >
              Delete repo
            </button>
          </form>
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

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        {/* Repo menu — GitHub-style list of repos under this project. Stacks
            above the content on narrow screens instead of competing with it
            for horizontal space. */}
        <nav className="flex flex-col gap-1 md:w-56 md:shrink-0">
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
