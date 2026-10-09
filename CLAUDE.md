@AGENTS.md

# agents-md-builder — project conventions

This section is hand-maintained (unlike the imported AGENTS.md above,
which `next dev` regenerates on its own). It's where decisions that
aren't obvious from reading the code live, so they don't have to be
rediscovered every session.

## The aspect registry

The 24-aspect/card/field/option tree lives in two layers:

- `src/lib/aspects/static-registry.ts` — the one place a human edits.
  Plain TS, imported by the 24 aspect files.
- `src/lib/aspects/registry.ts` — the runtime accessor. Reads from the
  `Aspect` DB table (not from static-registry.ts directly) and caches
  in memory per process.

The DB table is a **cache of the TS source, not an independent source
of truth**: `scripts/seed-aspects.ts` clears and re-inserts it from
static-registry.ts on every `predev`/`prestart`. Never hand-edit rows
in the `Aspect` table — edit static-registry.ts and let the next
deploy/dev-start reseed it.

This follows from the project's "our content vs. the customer's data"
split: the registry itself is our content (fine to cache, fine to
blow away and rebuild from TS every process start). `AspectPreference`,
`Repo`, and `Project` are the customer's data — the seed script never
touches them, and `AspectPreference.aspectKey` strings stay valid
across registry changes since they're plain string identifiers, not
foreign keys into the old static structure.

## Topological ordering

Aspects in the registry array must come **after** every aspect their
own `compatibleWhen` rules depend on, and **before** every aspect that
depends on them. Known dependency edges: `programming-language` before
its five dependents; `framework` before `database`; `database` before
`auth` and `caching` (each via a database-engine-specific option).
`scripts/verify-registry.ts` checks this automatically — if it fails
after a reorder, the order is wrong, not the check.

## The fallback-to-all-when-empty trap

`compatibleOptions()` in `compatibility.ts` has a deliberate safety
net: if a filter would leave zero options, it falls back to showing
all of them. That's correct for "no rule written yet for this
combination" but **wrong** for "this option is fundamentally
inapplicable here" — it silently defeats an intended full exclusion.

Before adding a new per-option `compatibleWhen`/`repos` gate, check
that at least one option still survives for every real context it
could run in. If nothing would survive for some context, use the
field-level mechanism instead (`AspectField.repos` /
`AspectField.compatibleWhen`, checked by `isFieldVisible()`) — it
hides the whole field with no fallback, rather than silently
un-excluding everything.

This exact bug class has been found and fixed repeatedly in this
registry. Don't assume a field without an explicit audit is safe.

## Registry integrity checks

`scripts/verify-registry.ts` is permanent, not throwaway — it's wired
into `prebuild` (so a bad build fails) and into `.github/workflows/ci.yml`.
It checks: no duplicate option values per field; referential integrity
of every `compatibleWhen` rule; no field left empty for any reachable
upstream value (via `isValueCompatible`, deliberately not
`compatibleOptions`, since the latter can never return empty by
design); topological validity of the aspect order.

Run it (`npm run verify-registry`) after any registry edit, before
trusting that the change is safe.

## Verifying changes without a local dev server

Don't start `npm run dev` to check work. Verify via `npm run build`,
`npm run lint`, `npm run verify-registry`, and targeted regression
scripts instead — then push and confirm via the live Railway
deployment (`list-deployments` / `get-logs` through the Railway MCP
tools) rather than a local server.
