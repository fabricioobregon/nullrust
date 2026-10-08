import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAspect, isAspectInRepoScope } from "@/lib/aspects/registry";
import { getRepoAnswers } from "@/lib/preferences";
import { saveAspect } from "@/app/actions";
import { AspectField, FieldOption } from "@/lib/aspects/types";
import { compatibleOptions, narrowingReasons, RepoAnswers } from "@/lib/aspects/compatibility";
import { RepoKind, getRepoKind, isRepoKind } from "@/lib/repos";
import { OptionCloud } from "@/components/option-cloud";
import { SearchableOptions } from "@/components/searchable-options";

export const dynamic = "force-dynamic";

function Field({
  field,
  value,
  repoAnswers,
  repoKind,
  repoTitle,
}: {
  field: AspectField;
  value: string | string[] | undefined;
  repoAnswers: RepoAnswers;
  repoKind: RepoKind;
  repoTitle: string;
}) {
  if (field.type === "text") {
    return (
      <div>
        <label htmlFor={field.id} className="block text-sm font-medium text-slate-700">
          {field.label}
        </label>
        {field.description && <p className="mt-0.5 text-sm text-slate-500">{field.description}</p>}
        <input
          id={field.id}
          name={field.id}
          defaultValue={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    );
  }

  const selected = new Set(Array.isArray(value) ? value : value ? [value] : []);
  const inputType = field.type === "multi" ? "checkbox" : "radio";

  // Narrow to compatible options, but never drop an already-selected value from
  // view just because an upstream answer changed after the fact — it stays
  // visible (and still saved) until the user picks something else.
  const filtered = compatibleOptions(field, repoAnswers, repoKind);
  const stale = (field.options ?? []).filter(
    (o) => selected.has(o.value) && !filtered.some((f) => f.value === o.value)
  );
  const displayOptions: FieldOption[] = [...filtered, ...stale];
  const reasons =
    filtered.length < (field.options?.length ?? 0)
      ? narrowingReasons(field, repoAnswers, repoKind, repoTitle)
      : [];

  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700">{field.label}</legend>
      {field.description && <p className="mt-0.5 text-sm text-slate-500">{field.description}</p>}
      {reasons.length > 0 && (
        <p className="mt-0.5 text-xs text-indigo-600">Narrowed based on {reasons.join(", ")}.</p>
      )}
      {field.display === "cloud" ? (
        <OptionCloud
          options={displayOptions}
          selected={selected}
          fieldId={field.id}
          inputType={inputType as "radio" | "checkbox"}
        />
      ) : (
        <SearchableOptions
          options={displayOptions}
          selected={selected}
          fieldId={field.id}
          inputType={inputType as "radio" | "checkbox"}
        />
      )}
    </fieldset>
  );
}

export default async function AspectPage({
  params,
}: {
  params: Promise<{ projectId: string; repoId: string; aspectKey: string }>;
}) {
  const { projectId, repoId, aspectKey } = await params;

  const [project, repo, aspect] = await Promise.all([
    db.project.findUnique({ where: { id: projectId } }),
    db.repo.findUnique({ where: { id: repoId } }),
    Promise.resolve(getAspect(aspectKey)),
  ]);
  if (!project || !repo || repo.projectId !== projectId) notFound();
  if (!isRepoKind(repo.kind)) notFound();
  const repoKind = repo.kind;
  if (!aspect || !isAspectInRepoScope(aspect, repoKind)) notFound();

  const kind = getRepoKind(repoKind)!;
  const repoAnswers = await getRepoAnswers(repoId);
  const answers = repoAnswers[aspectKey] ?? {};
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

      <form action={action} className="space-y-6">
        {aspect.cards.map((card) => (
          <div key={card.id} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="font-medium">{card.title}</h2>
              {card.description && <p className="mt-0.5 text-sm text-slate-500">{card.description}</p>}
            </div>
            {card.fields.map((field) => (
              <Field
                key={field.id}
                field={field}
                value={answers[field.id]}
                repoAnswers={repoAnswers}
                repoKind={repoKind}
                repoTitle={kind.title}
              />
            ))}
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-500"
          >
            Save preferences
          </button>
        </div>
      </form>
    </div>
  );
}
