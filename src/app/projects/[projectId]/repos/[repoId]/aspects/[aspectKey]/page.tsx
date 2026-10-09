import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAspect, getAspects, isAspectInRepoScope } from "@/lib/aspects/registry";
import { getRepoAnswers } from "@/lib/preferences";
import { saveAspect } from "@/app/actions";
import { getRepoKind, isRepoKind } from "@/lib/repos";
import { AspectForm } from "@/components/aspect-form";

export const dynamic = "force-dynamic";

export default async function AspectPage({
  params,
}: {
  params: Promise<{ projectId: string; repoId: string; aspectKey: string }>;
}) {
  const { projectId, repoId, aspectKey } = await params;

  const [project, repo, aspect, allAspects] = await Promise.all([
    db.project.findUnique({ where: { id: projectId } }),
    db.repo.findUnique({ where: { id: repoId } }),
    getAspect(aspectKey),
    getAspects(),
  ]);
  if (!project || !repo || repo.projectId !== projectId) notFound();
  if (!isRepoKind(repo.kind)) notFound();
  const repoKind = repo.kind;
  if (!aspect || !isAspectInRepoScope(aspect, repoKind)) notFound();

  const kind = getRepoKind(repoKind)!;
  const repoAnswers = await getRepoAnswers(repoId);
  const action = saveAspect.bind(null, repoId, aspectKey);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <a
          href={`/projects/${projectId}/repos/${repoId}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          &larr; {project.name} / {repo.name}
        </a>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold">
          <span>{aspect.icon}</span> {aspect.title}
        </h1>
        <p className="mt-1 text-slate-600">{aspect.tagline}</p>
        <p className="mt-1 text-sm text-slate-400">
          Nothing here is permanent &mdash; every answer can be changed later.
        </p>
      </div>

      <AspectForm
        aspect={aspect}
        allAspects={allAspects}
        initialAnswers={repoAnswers}
        repoKind={repoKind}
        repoTitle={kind.title}
        action={action}
      />
    </div>
  );
}
