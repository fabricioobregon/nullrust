/**
 * Re-seeds the Aspect table from the authored source
 * (src/lib/aspects/static-registry.ts) — run on every deploy (see
 * package.json's `prestart`/`predev`), never by hand against production.
 * Idempotent: clears and re-inserts every row every time, since this
 * table holds only our own content (never user data) and is always fully
 * derived from what's committed in static-registry.ts.
 */
import { db } from "@/lib/db";
import { aspects } from "@/lib/aspects/static-registry";

async function main() {
  await db.$transaction([
    db.aspect.deleteMany(),
    ...aspects.map((aspect, index) =>
      db.aspect.create({
        data: {
          key: aspect.key,
          title: aspect.title,
          icon: aspect.icon,
          tagline: aspect.tagline,
          scope: JSON.stringify(aspect.scope),
          order: index,
          cards: JSON.stringify(aspect.cards),
        },
      })
    ),
  ]);
  console.log(`seed-aspects: seeded ${aspects.length} aspects`);
}

main().finally(() => db.$disconnect());
