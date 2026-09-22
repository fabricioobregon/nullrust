import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAspect } from "@/lib/aspects/registry";
import { getAspectAnswers } from "@/lib/preferences";
import { saveAspect } from "@/app/actions";
import { AspectField } from "@/lib/aspects/types";

export const dynamic = "force-dynamic";

function Field({ field, value }: { field: AspectField; value: string | string[] | undefined }) {
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

  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700">{field.label}</legend>
      {field.description && <p className="mt-0.5 text-sm text-slate-500">{field.description}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {field.options?.map((opt) => (
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
  params: Promise<{ projectId: string; aspectKey: string }>;
}) {
  const { projectId, aspectKey } = await params;

  const [project, aspect] = await Promise.all([
    db.project.findUnique({ where: { id: projectId } }),
    Promise.resolve(getAspect(aspectKey)),
  ]);
  if (!project || !aspect) notFound();

  const answers = await getAspectAnswers(projectId, aspectKey);
  const action = saveAspect.bind(null, projectId, aspectKey);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <div>
        <a href={`/projects/${projectId}`} className="text-sm text-slate-500 hover:text-slate-700">
          &larr; {project.name}
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
              <Field key={field.id} field={field} value={answers[field.id]} />
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
