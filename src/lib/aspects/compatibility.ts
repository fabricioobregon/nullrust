import { AspectAnswers, AspectField, FieldOption } from "./types";
import { getAspect } from "./registry";

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
 * Filters a field's options against everything answered so far in the repo.
 *
 * Two safety nets keep this from ever being confusingly over-narrow:
 * - If none of the upstream fields this field's rules reference have been
 *   answered yet, nothing is filtered — there's no basis to narrow on, so
 *   every option stays visible until the user starts the chain (e.g. picks
 *   a Language). This also means cascades naturally deepen: once Language
 *   is set, Framework narrows; once Framework is also set, options that
 *   require *both* (like an ORM tied to one specific framework) can appear.
 * - If upstream answers exist but filtering would still leave zero options
 *   (a language/tool combination this registry has no rule for yet), all
 *   options are shown rather than presenting a dead end.
 */
export function compatibleOptions(field: AspectField, answers: RepoAnswers): FieldOption[] {
  if (!field.options) return [];

  const anyUpstreamAnswered = referencedFields(field).some((r) => isAnswered(answers, r.aspectKey, r.fieldId));
  if (!anyUpstreamAnswered) return field.options;

  const filtered = field.options.filter((opt) => ruleAllows(opt.compatibleWhen, answers));
  return filtered.length > 0 ? filtered : field.options;
}

/** True if narrowing actually hid at least one option (for a UI hint). */
export function wasNarrowed(field: AspectField, answers: RepoAnswers): boolean {
  if (!field.options) return false;
  return compatibleOptions(field, answers).length < field.options.length;
}

/**
 * Human-readable description of what's actually driving the narrowing, e.g.
 * ["Language = Python", "Framework = Django"] — so the UI can say exactly
 * why options disappeared instead of a generic "stuff changed" message.
 */
export function narrowingReasons(field: AspectField, answers: RepoAnswers): string[] {
  const reasons: string[] = [];
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
