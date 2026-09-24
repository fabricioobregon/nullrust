import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { aspectsForRepo, fieldCount, answeredFieldCount } from "@/lib/aspects/registry";
import { getRepoAnswers } from "@/lib/preferences";
import { getRepo, isRepoKey } from "@/lib/repos";

export const dynamic = "force-dynamic";

export default async function RepoAspectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; repoKey: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { projectId, repoKey } = await params;
  const { saved } = await searchParams;
  if (!isRepoKey(repoKey)) notFound();

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  const repo = getRepo(repoKey)!;
  const aspects = aspectsForRepo(repoKey);
  const answersByAspect = await getRepoAnswers(projectId, repoKey);
  const totalFields = aspects.reduce((sum, a) => sum + fieldCount(a), 0);
  const totalAnswered = aspects.reduce(
    (sum, a) => sum + answeredFieldCount(a, answersByAspect[a.key] ?? {}),
    0
  );

  return (
    <div className="space-y-6">
      <p className="text-slate-600">
        {totalAnswered} of {totalFields} preferences configured across {aspects.length} aspects
        scoped to <span className="font-medium">{repo.title}</span>.
      </p>

      {saved && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-800">
          Saved &ldquo;{aspects.find((a) => a.key === saved)?.title ?? saved}&rdquo;.
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
                href={`/projects/${projectId}/repos/${repoKey}/aspects/${aspect.key}`}
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
