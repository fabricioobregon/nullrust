/**
 * Permanent registry integrity check — run on every build (see package.json's
 * `prebuild`), not a one-off script. Exists because this session repeatedly
 * hand-verified the same handful of invariants with a throwaway script per
 * change, then deleted it; every one of those ad hoc checks is consolidated
 * here so the *next* registry change (new aspect, new field, new option,
 * renamed value) gets checked automatically instead of by memory.
 *
 * Four checks, each one directly motivated by a real bug found this session:
 *
 * 1. No duplicate option values within one field — silently breaks the
 *    value-keyed lookups compatibility.ts and cleanup.ts both rely on.
 * 2. Referential integrity — every compatibleWhen rule must point at an
 *    aspect/field that actually exists, and every value it lists must
 *    actually be one of that field's real option values. Catches typos and
 *    silent drift after a later rename (nothing else would catch this).
 * 3. No field is ever left empty for a value of what it depends on — the
 *    exact failure mode behind the mongoose/column-case/error-shape bugs:
 *    compatibleOptions()'s "never show zero options" fallback silently
 *    undoes an exclusion that was meant to be total.
 * 4. static-registry.ts's aspect order is topologically valid — every
 *    aspect referenced by another aspect's compatibleWhen rule must come
 *    at or before it, so the "earlier aspects narrow later ones" ordering
 *    stays true as aspects are added or reordered. This validates the
 *    authored source (what gets seeded), not the DB-backed runtime copy
 *    in registry.ts — see scripts/seed-aspects.ts for how one becomes
 *    the other.
 */
import { aspects } from "@/lib/aspects/static-registry";
import { isFieldVisible, isValueCompatible } from "@/lib/aspects/compatibility";
import { AspectField, CompatibilityRule } from "@/lib/aspects/types";
import { repoKinds } from "@/lib/repos";

let failures = 0;
function fail(msg: string) {
  console.error(`✗ ${msg}`);
  failures++;
}

const allFieldsByAspect = new Map<string, AspectField[]>();
for (const aspect of aspects) {
  allFieldsByAspect.set(aspect.key, aspect.cards.flatMap((c) => c.fields));
}

// --- 1. No duplicate option values within one field ---
for (const aspect of aspects) {
  for (const card of aspect.cards) {
    for (const field of card.fields) {
      const seen = new Set<string>();
      for (const opt of field.options ?? []) {
        if (seen.has(opt.value)) fail(`${aspect.key}.${card.id}.${field.id}: duplicate option value "${opt.value}"`);
        seen.add(opt.value);
      }
    }
  }
}

// --- 2. Referential integrity of every compatibleWhen rule ---
function checkRule(rule: CompatibilityRule, where: string) {
  const targetFields = allFieldsByAspect.get(rule.aspectKey);
  if (!targetFields) {
    fail(`${where}: references unknown aspect "${rule.aspectKey}"`);
    return;
  }
  const targetField = targetFields.find((f) => f.id === rule.fieldId);
  if (!targetField) {
    fail(`${where}: references unknown field "${rule.aspectKey}.${rule.fieldId}"`);
    return;
  }
  if (!targetField.options) return; // text field — nothing to validate values against
  const realValues = new Set(targetField.options.map((o) => o.value));
  for (const v of rule.values) {
    if (!realValues.has(v)) {
      fail(`${where}: references value "${v}" which is not a real option of ${rule.aspectKey}.${rule.fieldId}`);
    }
  }
}

for (const aspect of aspects) {
  for (const card of aspect.cards) {
    for (const field of card.fields) {
      for (const rule of field.compatibleWhen ?? []) {
        checkRule(rule, `${aspect.key}.${card.id}.${field.id} (field-level)`);
      }
      for (const opt of field.options ?? []) {
        for (const rule of opt.compatibleWhen ?? []) {
          checkRule(rule, `${aspect.key}.${card.id}.${field.id}.${opt.value}`);
        }
      }
    }
  }
}

// --- 3. No field ever empty for a value of what it depends on ---
function referencedRules(field: AspectField): CompatibilityRule[] {
  const rules = [...(field.compatibleWhen ?? [])];
  for (const opt of field.options ?? []) rules.push(...(opt.compatibleWhen ?? []));
  return rules;
}

for (const aspect of aspects) {
  for (const card of aspect.cards) {
    for (const field of card.fields) {
      const rules = referencedRules(field);
      if (rules.length === 0 && !field.repos) continue;

      // One upstream rule at a time (holding everything else unanswered) —
      // covers every bug actually found this session; multi-condition
      // rules (e.g. django-orm's language+framework pair) are rare enough
      // to have been checked by hand when added.
      for (const rule of rules) {
        const upstreamField = allFieldsByAspect.get(rule.aspectKey)?.find((f) => f.id === rule.fieldId);
        const valuesToTry = upstreamField?.options?.map((o) => o.value) ?? rule.values;

        for (const value of valuesToTry) {
          for (const kind of repoKinds) {
            const answers = { [rule.aspectKey]: { [rule.fieldId]: value } };
            if (!isFieldVisible(field, answers, kind.key)) continue; // intentionally hidden — nothing to check
            if (!field.options || field.options.length === 0) continue;
            // Deliberately NOT compatibleOptions() here — it exists to never
            // return empty (that's the exact fallback behind the mongoose/
            // column-case/error-shape bugs), so testing against it can
            // never detect "every option just got excluded at once". Testing
            // each option's strict compatibility directly is what catches it.
            const allExcluded = field.options.every((opt) => !isValueCompatible(field, opt.value, answers, kind.key));
            if (allExcluded) {
              fail(
                `${aspect.key}.${card.id}.${field.id}: EMPTY for ${kind.key} when ${rule.aspectKey}.${rule.fieldId}="${value}" — every option excluded at once (compatibleOptions()'s fallback would silently paper over this)`
              );
            }
          }
        }
      }

      // Field-level repos exclusion, independently of any compatibleWhen.
      if (field.repos) {
        for (const kind of repoKinds) {
          if (!isFieldVisible(field, {}, kind.key)) continue;
          if (!field.options || field.options.length === 0) continue;
          const allExcluded = field.options.every((opt) => !isValueCompatible(field, opt.value, {}, kind.key));
          if (allExcluded) {
            fail(`${aspect.key}.${card.id}.${field.id}: EMPTY for ${kind.key} with no upstream answered at all`);
          }
        }
      }
    }
  }
}

// --- 4. registry.ts order is topologically valid ---
const indexOf = new Map(aspects.map((a, i) => [a.key, i]));
for (const aspect of aspects) {
  const myIndex = indexOf.get(aspect.key)!;
  for (const card of aspect.cards) {
    for (const field of card.fields) {
      for (const rule of referencedRules(field)) {
        if (rule.aspectKey === aspect.key) continue; // same-aspect reference, no ordering constraint
        const upstreamIndex = indexOf.get(rule.aspectKey);
        if (upstreamIndex === undefined) continue; // already reported as unknown aspect above
        if (upstreamIndex > myIndex) {
          fail(
            `registry.ts order: ${aspect.key} (index ${myIndex}) depends on ${rule.aspectKey} (index ${upstreamIndex}), which comes AFTER it`
          );
        }
      }
    }
  }
}

if (failures > 0) {
  console.error(`\nverify-registry: ${failures} problem(s) found.`);
  process.exit(1);
}
console.log(`verify-registry: OK — ${aspects.length} aspects, all four checks passed.`);
