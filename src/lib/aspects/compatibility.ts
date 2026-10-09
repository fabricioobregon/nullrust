import { AspectAnswers, AspectDefinition, AspectField, FieldOption } from "./types";
import { RepoKind } from "@/lib/repos";

/** All aspects' saved answers for one repo, keyed by aspect key. */
export type RepoAnswers = Record<string, AspectAnswers>;

function isAnswered(answers: RepoAnswers, aspectKey: string, fieldId: string): boolean {
  const v = answers[aspectKey]?.[fieldId];
  return v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0);
}

function referencedFields(field: AspectField): Array<{ aspectKey: string; fieldId: string }> {
  const seen = new Set<string>();
  const out: Array<{ aspectKey: string; fieldId: string }> = [];
  for (const opt of field.options ?? []) {
    for (const rule of opt.compatibleWhen ?? []) {
      const key = `${rule.aspectKey}.${rule.fieldId}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ aspectKey: rule.aspectKey, fieldId: rule.fieldId });
      }
    }
  }
  return out;
}

function ruleAllows(rule: FieldOption["compatibleWhen"], answers: RepoAnswers): boolean {
  if (!rule) return true;
  return rule.every((r) => {
    if (!isAnswered(answers, r.aspectKey, r.fieldId)) return false; // required upstream answer not given yet
    const upstream = answers[r.aspectKey]![r.fieldId]!;
    const upstreamValues = Array.isArray(upstream) ? upstream : [upstream];
    return upstreamValues.some((v) => r.values.includes(v));
  });
}

/**
 * Filters a field's options for one repo tab and everything answered so far
 * in that repo. Two layers, applied in order:
 *
 * 1. Hard repo filter (option.repos) — a mobile-only framework never shows
 *    on the Frontend tab, full stop. This layer is never relaxed by a
 *    fallback; it's a structural boundary, not a progressive narrowing.
 * 2. Soft cross-field filter (option.compatibleWhen) — e.g. Language also
 *    narrows Framework. This one has two safety nets so it can't dead-end:
 *    if none of its referenced upstream fields have been answered yet,
 *    nothing is filtered (there's no basis to narrow on); if upstream
 *    answers exist but filtering would leave zero options (a language/tool
 *    combination this registry has no rule for yet), it falls back to
 *    whatever step 1 already allowed for this repo — never back to options
 *    step 1 excluded.
 */
export function compatibleOptions(
  field: AspectField,
  answers: RepoAnswers,
  repoKind: RepoKind
): FieldOption[] {
  if (!field.options) return [];

  const repoFiltered = field.options.filter((opt) => !opt.repos || opt.repos.includes(repoKind));
  const base = repoFiltered.length > 0 ? repoFiltered : field.options;

  const anyUpstreamAnswered = referencedFields(field).some((r) => isAnswered(answers, r.aspectKey, r.fieldId));
  if (!anyUpstreamAnswered) return base;

  const filtered = base.filter((opt) => ruleAllows(opt.compatibleWhen, answers));
  return filtered.length > 0 ? filtered : base;
}

/**
 * Strictly checks whether one specific already-saved value is still valid,
 * with none of compatibleOptions()'s UX fallbacks (which exist so the
 * *editor* never shows an empty picker, not to decide whether a value is
 * actually still correct). Used to decide what to clear after a save: e.g.
 * if Rust has no matching Testing-framework option yet, compatibleOptions()
 * falls back to showing everything so the field isn't empty — but that must
 * NOT be read as "pytest is still fine for Rust." This checks the option's
 * own rule directly, including the hard per-repo restriction.
 */
export function isValueCompatible(
  field: AspectField,
  value: string,
  answers: RepoAnswers,
  repoKind: RepoKind
): boolean {
  const opt = field.options?.find((o) => o.value === value);
  if (!opt) return false;
  if (opt.repos && !opt.repos.includes(repoKind)) return false;
  return ruleAllows(opt.compatibleWhen, answers);
}

/**
 * True hard exclusion for a whole field — distinct from compatibleOptions()'s
 * per-option narrowing, which always falls back to showing everything
 * rather than leaving a field with zero options. That fallback is right for
 * "we don't have a rule for this combination yet, don't dead-end the UI" —
 * but wrong for "this field flat-out doesn't apply here" (e.g. table/column
 * naming once the engine is a document store), where every option would be
 * excluded at once and the fallback would silently undo the exclusion.
 *
 * An unanswered upstream never hides the field — there's nothing to judge
 * by yet, so the safe default is to show it, same philosophy as
 * compatibleOptions()'s "nothing answered → show everything" case.
 */
export function isFieldVisible(field: AspectField, answers: RepoAnswers, repoKind: RepoKind): boolean {
  if (field.repos && !field.repos.includes(repoKind)) return false;
  if (!field.compatibleWhen) return true;
  return field.compatibleWhen.every((r) => {
    if (!isAnswered(answers, r.aspectKey, r.fieldId)) return true;
    const upstream = answers[r.aspectKey]![r.fieldId]!;
    const upstreamValues = Array.isArray(upstream) ? upstream : [upstream];
    return upstreamValues.some((v) => r.values.includes(v));
  });
}

/**
 * Human-readable description of what's actually driving the narrowing, e.g.
 * ["this repo (Mobile)", "Language = Dart"] — so the UI can say exactly why
 * options disappeared instead of a generic "stuff changed" message.
 *
 * Takes the full aspect list as a plain parameter rather than importing it
 * from registry.ts directly — registry.ts is DB-backed and async, but this
 * runs on every render of a live, client-side reactive form (re-narrowing
 * as the user picks something, before saving), which can't await a query
 * mid-render. The caller (aspect-form.tsx) fetches the list once, server-
 * side, and passes it down as a prop instead.
 */
export function narrowingReasons(
  field: AspectField,
  answers: RepoAnswers,
  repoKind: RepoKind,
  repoTitle: string,
  allAspects: AspectDefinition[]
): string[] {
  const reasons: string[] = [];

  const repoFilteredCount = (field.options ?? []).filter((opt) => !opt.repos || opt.repos.includes(repoKind)).length;
  if (repoFilteredCount < (field.options?.length ?? 0)) reasons.push(`this repo (${repoTitle})`);

  for (const { aspectKey, fieldId } of referencedFields(field)) {
    if (!isAnswered(answers, aspectKey, fieldId)) continue;
    const upstreamAspect = allAspects.find((a) => a.key === aspectKey);
    const upstreamField = upstreamAspect?.cards.flatMap((c) => c.fields).find((f) => f.id === fieldId);
    if (!upstreamField) continue;
    const raw = answers[aspectKey]![fieldId]!;
    const rawValues = Array.isArray(raw) ? raw : [raw];
    const labels = rawValues.map((v) => upstreamField.options?.find((o) => o.value === v)?.label ?? v);
    reasons.push(`${upstreamField.label} = ${labels.join(", ")}`);
  }
  return reasons;
}
