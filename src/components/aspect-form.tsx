"use client";

import { useState } from "react";
import { AspectAnswers, AspectDefinition, AspectField, FieldOption } from "@/lib/aspects/types";
import { compatibleOptions, narrowingReasons, RepoAnswers } from "@/lib/aspects/compatibility";
import { RepoKind } from "@/lib/repos";
import { OptionCloud } from "@/components/option-cloud";
import { SearchableOptions } from "@/components/searchable-options";

function Field({
  field,
  value,
  repoAnswers,
  repoKind,
  repoTitle,
  onValueChange,
}: {
  field: AspectField;
  value: string | string[] | undefined;
  repoAnswers: RepoAnswers;
  repoKind: RepoKind;
  repoTitle: string;
  onValueChange: (value: string | string[]) => void;
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
          onValueChange={onValueChange}
        />
      ) : (
        <SearchableOptions
          options={displayOptions}
          selected={selected}
          fieldId={field.id}
          inputType={inputType as "radio" | "checkbox"}
          onValueChange={onValueChange}
        />
      )}
    </fieldset>
  );
}

export function AspectForm({
  aspect,
  initialAnswers,
  repoKind,
  repoTitle,
  action,
}: {
  aspect: AspectDefinition;
  /** Every aspect's saved answers for this repo — this aspect's own slice becomes the live, in-progress state below. */
  initialAnswers: RepoAnswers;
  repoKind: RepoKind;
  repoTitle: string;
  action: (formData: FormData) => void;
}) {
  const [values, setValues] = useState<AspectAnswers>(initialAnswers[aspect.key] ?? {});

  // Other aspects' answers stay exactly as saved (we're not editing them
  // here); only this aspect's slice reflects the user's in-progress,
  // unsaved picks — so a sibling field's compatibleWhen rule against this
  // aspect's own language field re-narrows immediately, without a save.
  const liveAnswers: RepoAnswers = { ...initialAnswers, [aspect.key]: values };

  function setFieldValue(fieldId: string, value: string | string[]) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  return (
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
              value={values[field.id]}
              repoAnswers={liveAnswers}
              repoKind={repoKind}
              repoTitle={repoTitle}
              onValueChange={(v) => setFieldValue(field.id, v)}
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
  );
}
