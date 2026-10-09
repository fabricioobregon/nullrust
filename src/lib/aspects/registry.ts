import { db } from "@/lib/db";
import { AspectAnswers, AspectDefinition } from "./types";
import { RepoKind } from "@/lib/repos";

// The DB-backed runtime accessor for the aspect/card/field/option registry
// — this is "our content, not the customer's," cached in memory per
// process instead of queried per field. The actual authored content lives
// in static-registry.ts; this table is re-seeded from it on every deploy
// (see package.json's `prestart` and scripts/seed-aspects.ts), never
// hand-edited. Loaded once per process and cached — aspect content only
// ever changes via a deploy (which starts a fresh process anyway), so
// there's no invalidation to handle for a single-instance deployment.
let cache: AspectDefinition[] | null = null;

async function loadAspects(): Promise<AspectDefinition[]> {
  if (cache) return cache;
  const rows = await db.aspect.findMany({ orderBy: { order: "asc" } });
  cache = rows.map((row) => ({
    key: row.key,
    title: row.title,
    icon: row.icon,
    tagline: row.tagline,
    scope: JSON.parse(row.scope),
    cards: JSON.parse(row.cards),
  }));
  return cache;
}

export async function getAspects(): Promise<AspectDefinition[]> {
  return loadAspects();
}

export async function getAspect(key: string): Promise<AspectDefinition | undefined> {
  const all = await loadAspects();
  return all.find((a) => a.key === key);
}

export async function aspectsForRepo(repoKind: RepoKind): Promise<AspectDefinition[]> {
  const all = await loadAspects();
  return all.filter((a) => a.scope === "all" || a.scope.includes(repoKind));
}

// Pure functions below need no DB access — they operate on an
// already-fetched aspect, so they stay synchronous.

export function isAspectInRepoScope(aspect: AspectDefinition, repoKind: RepoKind): boolean {
  return aspect.scope === "all" || aspect.scope.includes(repoKind);
}

export function fieldCount(aspect: AspectDefinition): number {
  return aspect.cards.reduce((sum, card) => sum + card.fields.length, 0);
}

export function answeredFieldCount(aspect: AspectDefinition, answers: AspectAnswers): number {
  let count = 0;
  for (const card of aspect.cards) {
    for (const field of card.fields) {
      const value = answers[field.id];
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value) && value.length === 0) continue;
      count++;
    }
  }
  return count;
}
