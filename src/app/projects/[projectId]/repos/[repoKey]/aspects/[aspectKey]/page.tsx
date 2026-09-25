import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAspect, isAspectInRepoScope } from "@/lib/aspects/registry";
import { getRepoAnswers } from "@/lib/preferences";
import { saveAspect } from "@/app/actions";
import { AspectField, FieldOption } from "@/lib/aspects/types";
import { compatibleOptions, wasNarrowed, RepoAnswers } from "@/lib/aspects/compatibility";
import { getRepo, isRepoKey } from "@/lib/repos";

export const dynamic = "force-dynamic";

function Field({
  field,
  value,
  repoAnswers,
}: {
  field: AspectField;
  value: string | string[] | undefined;
  repoAnswers: RepoAnswers;
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
  const filtered = compatibleOptions(field, repoAnswers);
  const stale = (field.options ?? []).filter(
    (o) => selected.has(o.value) && !filtered.some((f) => f.value === o.value)
  );
  const displayOptions: FieldOption[] = [...filtered, ...stale];
  const narrowed = wasNarrowed(field, repoAnswers);

  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700">{field.label}</legend>
      {field.description && <p className="mt-0.5 text-sm text-slate-500">{field.description}</p>}
      {narrowed && (
        <p className="mt-0.5 text-xs text-indigo-600">
          Narrowed based on this repo&rsquo;s Language/Framework selection.
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {displayOptions.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700"
            title={opt.description}
          >
            <input
              type={inputType}
              name={field.id}
              value={opt.value}
              defaultChecked={selected.has(opt.value)}
              className="accent-indigo-600"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default async function AspectPage({
  params,
}: {
  params: Promise<{ projectId: string; repoKey: string; aspectKey: string }>;
}) {
  const { projectId, repoKey, aspectKey } = await params;
  if (!isRepoKey(repoKey)) notFound();

  const [project, aspect] = await Promise.all([
    db.project.findUnique({ where: { id: projectId } }),
    Promise.resolve(getAspect(aspectKey)),
  ]);
  if (!project || !aspect || !isAspectInRepoScope(aspect, repoKey)) notFound();

  const repo = getRepo(repoKey)!;
  const repoAnswers = await getRepoAnswers(projectId, repoKey);
  const answers = repoAnswers[aspectKey] ?? {};
  const action = saveAspect.bind(null, projectId, repoKey, aspectKey);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <a
          href={`/projects/${projectId}/repos/${repoKey}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          &larr; {project.name} / {repo.title}
        </a>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold">
          <span>{aspect.icon}</span> {aspect.title}
        </h1>
        <p className="mt-1 text-slate-600">{aspect.tagline}</p>
      </div>

      <form action={action} className="space-y-6">
        {aspect.cards.map((card) => (
          <div key={card.id} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="font-medium">{card.title}</h2>
              {card.description && <p className="mt-0.5 text-sm text-slate-500">{card.description}</p>}
            </div>
            {card.fields.map((field) => (
              <Field key={field.id} field={field} value={answers[field.id]} repoAnswers={repoAnswers} />
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
