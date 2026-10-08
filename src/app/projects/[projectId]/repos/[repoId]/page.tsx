import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { aspectsForRepo, fieldCount, answeredFieldCount } from "@/lib/aspects/registry";
import { getRepoAnswers } from "@/lib/preferences";
import { getRepoKind, isRepoKind } from "@/lib/repos";

export const dynamic = "force-dynamic";

export default async function RepoAspectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; repoId: string }>;
  searchParams: Promise<{ saved?: string; cleared?: string }>;
}) {
  const { projectId, repoId } = await params;
  const { saved, cleared } = await searchParams;

  const repo = await db.repo.findUnique({ where: { id: repoId } });
  if (!repo || repo.projectId !== projectId || !isRepoKind(repo.kind)) notFound();

  const kind = getRepoKind(repo.kind)!;
  const aspects = aspectsForRepo(repo.kind);
  const answersByAspect = await getRepoAnswers(repoId);
  const totalFields = aspects.reduce((sum, a) => sum + fieldCount(a), 0);
  const totalAnswered = aspects.reduce(
    (sum, a) => sum + answeredFieldCount(a, answersByAspect[a.key] ?? {}),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <span>{kind.icon}</span> {repo.name}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {kind.title}
          </span>
        </h2>
        <p className="mt-1 text-slate-600">
          {totalAnswered} of {totalFields} preferences configured across {aspects.length} aspects
          scoped to {kind.title.toLowerCase()} repos.
        </p>
      </div>

      {saved && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-800">
          Saved &ldquo;{aspects.find((a) => a.key === saved)?.title ?? saved}&rdquo;.
        </div>
      )}

      {cleared && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-amber-900">
          <p className="font-medium">
            Cleared selections that no longer match your new answer:
          </p>
          <ul className="mt-1 list-inside list-disc text-sm">
            {cleared.split("; ").map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {aspects.map((aspect) => {
          const answers = answersByAspect[aspect.key] ?? {};
          const total = fieldCount(aspect);
          const answered = answeredFieldCount(aspect, answers);
          const complete = total > 0 && answered === total;

          return (
            <li key={aspect.key}>
              <a
                href={`/projects/${projectId}/repos/${repoId}/aspects/${aspect.key}`}
                className="block h-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-400 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{aspect.icon}</span>
                  {complete ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Complete
                    </span>
                  ) : answered > 0 ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {answered}/{total}
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                      Not started
                    </span>
                  )}
                </div>
                <div className="mt-3 font-medium">{aspect.title}</div>
                <p className="mt-1 text-sm text-slate-500">{aspect.tagline}</p>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
