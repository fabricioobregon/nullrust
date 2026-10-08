"use client";

import { useState } from "react";
import { AspectAnswers, AspectDefinition, AspectField, FieldOption } from "@/lib/aspects/types";
import { compatibleOptions, isFieldVisible, isValueCompatible, narrowingReasons, RepoAnswers } from "@/lib/aspects/compatibility";
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
  if (!isFieldVisible(field, repoAnswers, repoKind)) return null;

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
          value={typeof value === "string" ? value : undefined}
        />
      ) : (
        // Note: unlike OptionCloud, SearchableOptions has no `value` prop to
        // revert to if a pick here ever gets vetoed by the pending-change
        // confirmation below — not needed today since no SearchableOptions-
        // rendered field in this registry is itself a compatibleWhen
        // dependency for a sibling, but worth revisiting if one becomes one.
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

type PendingChange = {
  fieldId: string;
  fieldLabel: string;
  newValue: string | string[];
  newValueLabel: string;
  cleared: { fieldLabel: string; valueLabels: string[] }[];
  /** Sibling fields that depend on this one but have nothing filled in yet
   * to actually lose — still worth a heads-up, just not a "will clear" one. */
  affectedFieldLabels: string[];
};

/** Every option label a raw value (or array of them) resolves to. */
function labelsFor(field: AspectField, raw: string | string[] | undefined): string[] {
  if (raw === undefined) return [];
  const values = Array.isArray(raw) ? raw : [raw];
  return values.map((v) => field.options?.find((o) => o.value === v)?.label ?? v);
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
  const [pending, setPending] = useState<PendingChange | null>(null);

  // Other aspects' answers stay exactly as saved (we're not editing them
  // here); only this aspect's slice reflects the user's in-progress,
  // unsaved picks — so a sibling field's compatibleWhen rule against this
  // aspect's own language field re-narrows immediately, without a save.
  const liveAnswers: RepoAnswers = { ...initialAnswers, [aspect.key]: values };

  const allFields = aspect.cards.flatMap((c) => c.fields);

  function setFieldValue(field: AspectField, newValue: string | string[]) {
    const previousValue = values[field.id];
    const candidateValues = { ...values, [field.id]: newValue };
    const candidateAnswers: RepoAnswers = { ...initialAnswers, [aspect.key]: candidateValues };

    // Sibling fields that reference this one via compatibleWhen — whether
    // or not they currently hold a value. A brand-new project may have
    // nothing filled in yet to strand, but Language is foundational enough
    // that changing it should still ask, not just when something's
    // currently at stake.
    const dependents = allFields.filter(
      (f) =>
        f.id !== field.id &&
        f.options?.some((o) => o.compatibleWhen?.some((r) => r.aspectKey === aspect.key && r.fieldId === field.id))
    );

    // Of those, which ones would actually strand an already-made choice?
    // Mirrors cleanup.ts's server-side logic, run live against the
    // in-progress pick instead of a saved one.
    const cleared: { fieldLabel: string; valueLabels: string[] }[] = [];
    for (const sibling of dependents) {
      const current = candidateValues[sibling.id];
      if (current === undefined) continue;
      const currentValues = Array.isArray(current) ? current : [current];
      const stillValid = currentValues.filter((v) => isValueCompatible(sibling, v, candidateAnswers, repoKind));
      if (stillValid.length !== currentValues.length) {
        const removed = currentValues.filter((v) => !stillValid.includes(v));
        cleared.push({ fieldLabel: sibling.label, valueLabels: labelsFor(sibling, removed) });
      }
    }

    const isRealChange = previousValue !== undefined && previousValue !== newValue;
    if (isRealChange && (cleared.length > 0 || dependents.length > 0)) {
      setPending({
        fieldId: field.id,
        fieldLabel: field.label,
        newValue,
        newValueLabel: labelsFor(field, newValue)[0] ?? String(newValue),
        cleared,
        affectedFieldLabels: dependents.map((f) => f.label),
      });
      return; // not committed to `values` until confirmed
    }

    setValues(candidateValues);
  }

  function confirmPending() {
    if (!pending) return;
    setValues((prev) => ({ ...prev, [pending.fieldId]: pending.newValue }));
    setPending(null);
  }

  function cancelPending() {
    setPending(null);
  }

  return (
    <form action={action} className="space-y-6">
      {pending && (
        <div className="sticky top-4 z-10 space-y-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 shadow-md">
          {pending.cleared.length > 0 ? (
            <>
              <p className="font-medium text-amber-900">
                Changing {pending.fieldLabel} to &ldquo;{pending.newValueLabel}&rdquo; will clear:
              </p>
              <ul className="list-inside list-disc text-sm text-amber-800">
                {pending.cleared.map((c) => (
                  <li key={c.fieldLabel}>
                    {c.fieldLabel}: {c.valueLabels.join(", ")}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="font-medium text-amber-900">
              Changing {pending.fieldLabel} to &ldquo;{pending.newValueLabel}&rdquo; will change the available
              options for {pending.affectedFieldLabels.join(", ")} below.
            </p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={confirmPending}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-500"
            >
              {pending.cleared.length > 0 ? "Switch and clear" : "Switch"}
            </button>
            <button
              type="button"
              onClick={cancelPending}
              className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
            >
              Keep current
            </button>
          </div>
        </div>
      )}

      {aspect.cards
        .filter((card) => card.fields.some((field) => isFieldVisible(field, liveAnswers, repoKind)))
        .map((card) => (
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
              onValueChange={(v) => setFieldValue(field, v)}
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
