import { AspectAnswers, AspectField, FieldOption } from "./types";
import { getAspect } from "./registry";
import { RepoKey } from "@/lib/repos";

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
  repoKey: RepoKey
): FieldOption[] {
  if (!field.options) return [];

  const repoFiltered = field.options.filter((opt) => !opt.repos || opt.repos.includes(repoKey));
  const base = repoFiltered.length > 0 ? repoFiltered : field.options;

  const anyUpstreamAnswered = referencedFields(field).some((r) => isAnswered(answers, r.aspectKey, r.fieldId));
  if (!anyUpstreamAnswered) return base;

  const filtered = base.filter((opt) => ruleAllows(opt.compatibleWhen, answers));
  return filtered.length > 0 ? filtered : base;
}

/**
 * Human-readable description of what's actually driving the narrowing, e.g.
 * ["this repo (Mobile)", "Language = Dart"] — so the UI can say exactly why
 * options disappeared instead of a generic "stuff changed" message.
 */
export function narrowingReasons(
  field: AspectField,
  answers: RepoAnswers,
  repoKey: RepoKey,
  repoTitle: string
): string[] {
  const reasons: string[] = [];

  const repoFilteredCount = (field.options ?? []).filter((opt) => !opt.repos || opt.repos.includes(repoKey)).length;
  if (repoFilteredCount < (field.options?.length ?? 0)) reasons.push(`this repo (${repoTitle})`);

  for (const { aspectKey, fieldId } of referencedFields(field)) {
    if (!isAnswered(answers, aspectKey, fieldId)) continue;
    const upstreamAspect = getAspect(aspectKey);
    const upstreamField = upstreamAspect?.cards.flatMap((c) => c.fields).find((f) => f.id === fieldId);
    if (!upstreamField) continue;
    const raw = answers[aspectKey]![fieldId]!;
    const rawValues = Array.isArray(raw) ? raw : [raw];
    const labels = rawValues.map((v) => upstreamField.options?.find((o) => o.value === v)?.label ?? v);
    reasons.push(`${upstreamField.label} = ${labels.join(", ")}`);
  }
  return reasons;
}
