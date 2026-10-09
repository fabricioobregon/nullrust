import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getRepoAnswers } from "@/lib/preferences";
import { generateAgentsMd } from "@/lib/generate-agents-md";
import { CopyButton } from "@/components/copy-button";
import { isRepoKind } from "@/lib/repos";
import { setGithubRepo, pushToGithub } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function GeneratePage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; repoId: string }>;
  searchParams: Promise<{ prUrl?: string; pushError?: string }>;
}) {
  const { projectId, repoId } = await params;
  const { prUrl, pushError } = await searchParams;

  const [project, repo] = await Promise.all([
    db.project.findUnique({ where: { id: projectId } }),
    db.repo.findUnique({ where: { id: repoId } }),
  ]);
  if (!project || !repo || repo.projectId !== projectId) notFound();
  if (!isRepoKind(repo.kind)) notFound();

  const answers = await getRepoAnswers(repoId);
  const markdown = await generateAgentsMd(repo.name, repo.kind, answers, repo.businessContext);
  const downloadHref = `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <a
          href={`/projects/${projectId}/repos/${repoId}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          &larr; {project.name} / {repo.name}
        </a>
        <h1 className="mt-1 text-2xl font-semibold">
          Generated AGENTS.md &mdash; {repo.name}
        </h1>
        <p className="mt-1 text-slate-600">
          Copy this into an <code className="rounded bg-slate-200 px-1">AGENTS.md</code> file at the
          root of the <span className="font-medium">{repo.name}</span> repo, or download it directly.
        </p>
      </div>

      <div className="flex gap-3">
        <CopyButton text={markdown} />
        <a
          href={downloadHref}
          download="AGENTS.md"
          className="rounded-md border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100"
        >
          Download
        </a>
      </div>

      <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-6 text-sm whitespace-pre-wrap">
        {markdown}
      </pre>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-medium">Push to GitHub</h2>
        <p className="text-sm text-slate-500">
          Opens a pull request with this file against your repo&rsquo;s default branch &mdash; nothing
          is committed directly.
        </p>

        {prUrl && (
          <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-800">
            Opened{" "}
            <a href={prUrl} target="_blank" rel="noreferrer" className="font-medium underline">
              this pull request
            </a>
            .
          </div>
        )}
        {pushError && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-red-800">
            {pushError}
          </div>
        )}

        <form action={setGithubRepo.bind(null, repoId)} className="flex gap-3">
          <input
            name="githubRepoFullName"
            defaultValue={repo.githubRepoFullName ?? ""}
            placeholder="owner/repo"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Save
          </button>
        </form>

        <form action={pushToGithub.bind(null, repoId)}>
          <button
            type="submit"
            disabled={!repo.githubRepoFullName}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Open pull request
          </button>
        </form>
      </div>
    </div>
  );
}
