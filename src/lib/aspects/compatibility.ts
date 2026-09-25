import { AspectAnswers, AspectField, FieldOption } from "./types";

/** All aspects' saved answers for one repo, keyed by aspect key. */
export type RepoAnswers = Record<string, AspectAnswers>;

function isAnswered(answers: RepoAnswers, aspectKey: string, fieldId: string): boolean {
  const v = answers[aspectKey]?.[fieldId];
  return v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0);
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

  const referenced = new Set<string>();
  for (const opt of field.options) {
    for (const rule of opt.compatibleWhen ?? []) {
      referenced.add(`${rule.aspectKey}.${rule.fieldId}`);
    }
  }
  const anyUpstreamAnswered = [...referenced].some((key) => {
    const [aspectKey, fieldId] = key.split(".");
    return isAnswered(answers, aspectKey, fieldId);
  });
  if (!anyUpstreamAnswered) return field.options;

  const filtered = field.options.filter((opt) => ruleAllows(opt.compatibleWhen, answers));
  return filtered.length > 0 ? filtered : field.options;
}

/** True if narrowing actually hid at least one option (for a UI hint). */
export function wasNarrowed(field: AspectField, answers: RepoAnswers): boolean {
  if (!field.options) return false;
  return compatibleOptions(field, answers).length < field.options.length;
}
