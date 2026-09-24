import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getRepoAnswers } from "@/lib/preferences";
import { generateAgentsMd } from "@/lib/generate-agents-md";
import { CopyButton } from "@/components/copy-button";
import { getRepo, isRepoKey } from "@/lib/repos";

export const dynamic = "force-dynamic";

export default async function GeneratePage({
  params,
}: {
  params: Promise<{ projectId: string; repoKey: string }>;
}) {
  const { projectId, repoKey } = await params;
  if (!isRepoKey(repoKey)) notFound();

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  const repo = getRepo(repoKey)!;
  const answers = await getRepoAnswers(projectId, repoKey);
  const markdown = generateAgentsMd(project.name, repoKey, repo.title, answers);
  const downloadHref = `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <a
          href={`/projects/${projectId}/repos/${repoKey}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          &larr; {project.name} / {repo.title}
        </a>
        <h1 className="mt-1 text-2xl font-semibold">
          Generated AGENTS.md &mdash; {repo.title}
        </h1>
        <p className="mt-1 text-slate-600">
          Copy this into an <code className="rounded bg-slate-200 px-1">AGENTS.md</code> file at the
          root of the <span className="font-medium">{repo.title.toLowerCase()}</span> repo, or download it directly.
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
    </div>
  );
}
