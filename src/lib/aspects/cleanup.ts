import { RepoKind } from "@/lib/repos";
import { getRepoAnswers, saveAspectAnswers } from "@/lib/preferences";
import { aspectsForRepo } from "./registry";
import { isValueCompatible } from "./compatibility";
import { AspectAnswers } from "./types";

export type ClearedAnswer = {
  aspectTitle: string;
  fieldLabel: string;
  clearedLabels: string[];
};

/**
 * After any save, some other already-saved field may no longer be
 * compatible with the new combined state — e.g. changing Language away
 * from Python leaves a saved Framework = Django, or ORM = Django ORM,
 * stranded. Re-validates every field that participates in compatibleWhen
 * filtering against the authoritative compatibleOptions() used to render
 * the form, and clears any saved value(s) that no longer qualify.
 *
 * Runs in a bounded loop (not a single pass) so multi-level cascades
 * resolve fully from one save: clearing Framework in pass 1 can make an
 * ORM option that required that specific framework newly unanswerable,
 * which pass 2 then catches too.
 */
export async function cleanupIncompatibleAnswers(
  projectId: string,
  repoId: string,
  repoKind: RepoKind
): Promise<ClearedAnswer[]> {
  const cleared: ClearedAnswer[] = [];

  for (let pass = 0; pass < 4; pass++) {
    const answers = await getRepoAnswers(repoId);
    let changedThisPass = false;

    for (const aspect of aspectsForRepo(repoKind)) {
      const aspectAnswers = answers[aspect.key];
      if (!aspectAnswers) continue;

      let aspectChanged = false;
      const updated: AspectAnswers = { ...aspectAnswers };

      for (const card of aspect.cards) {
        for (const field of card.fields) {
          const hasRules = field.options?.some((o) => o.compatibleWhen?.length);
          if (!hasRules) continue;

          const current = updated[field.id];
          if (current === undefined) continue;

          if (Array.isArray(current)) {
            const kept = current.filter((v) => isValueCompatible(field, v, answers, repoKind));
            if (kept.length !== current.length) {
              const removedLabels = current
                .filter((v) => !isValueCompatible(field, v, answers, repoKind))
                .map((v) => field.options?.find((o) => o.value === v)?.label ?? v);
              cleared.push({ aspectTitle: aspect.title, fieldLabel: field.label, clearedLabels: removedLabels });
              updated[field.id] = kept.length > 0 ? kept : undefined;
              aspectChanged = true;
            }
          } else if (!isValueCompatible(field, current, answers, repoKind)) {
            const removedLabel = field.options?.find((o) => o.value === current)?.label ?? current;
            cleared.push({ aspectTitle: aspect.title, fieldLabel: field.label, clearedLabels: [removedLabel] });
            updated[field.id] = undefined;
            aspectChanged = true;
          }
        }
      }

      if (aspectChanged) {
        await saveAspectAnswers(projectId, repoId, aspect.key, updated);
        changedThisPass = true;
      }
    }

    if (!changedThisPass) break;
  }

  return cleared;
}
