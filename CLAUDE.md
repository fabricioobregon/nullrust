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

## Permanent unit tests

`scripts/test-unit.ts` is permanent, same deal as verify-registry —
wired into `prebuild` and CI, not a one-off script. Deliberately
scoped to logic that needs no live database (crypto, session signing,
the GitHub push/PR mechanics against a mocked fetch), since CI has no
database and standing one up just for tests would be a bigger change
than the tests themselves. Anything that reads the DB-backed registry
(e.g. `generateAgentsMd`) stays manually verified per change instead.

## Users, sessions, and ownership

`Project.ownerId` (nullable only for rows that predate accounts) is
the whole access-control model — every page that loads a project or
repo by id, and every mutating action in `actions.ts`, must check it
independently. Pages rely on `requireProjectOwner()` in
`src/lib/auth/guards.ts` (404s, not redirects, on a mismatch, so a
signed-in user learns nothing about another user's project ids), but
a Server Action can be invoked directly without ever rendering the
page that would have gated it — so every mutating action re-checks
ownership itself rather than trusting a page-level guard already ran.

Sessions are a stateless HMAC-signed cookie (`SESSION_SECRET`), not a
DB-backed table — no server-side revocation before the 30-day expiry,
traded deliberately for not needing a session store. The GitHub OAuth
access token is encrypted at rest (`TOKEN_ENCRYPTION_KEY`,
`src/lib/auth/crypto.ts`) since it grants repo access on the user's
behalf. Both secrets are already set on Railway; `GITHUB_CLIENT_ID`/
`GITHUB_CLIENT_SECRET` still need a GitHub OAuth App the user creates
by hand (no API for that) before login actually works end to end.

## Business context: why it's Anthropic-only

`src/components/business-context-editor.tsx` calls an AI directly
from the browser with the user's own API key, specifically so neither
the key nor any business-logic text the user types ever reaches our
server. This only works with Anthropic's Messages API, which
explicitly supports direct-from-browser calls via the
`anthropic-dangerous-direct-browser-access` header — most providers'
APIs don't expose CORS for this, so don't assume adding another
provider is a drop-in copy of this pattern without checking that
first.
