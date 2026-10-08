/*
  Auth's "session-strategy" field and Caching's "session-store" field asked
  the same underlying question (how/where sessions are kept) with two
  inconsistent option sets. The registry now has one consolidated field —
  auth.session-strategy — covering both strategy and storage mechanism, and
  caching.session-store no longer exists. This data-only migration (no
  schema change) carries existing answers forward instead of silently
  losing them:

  1. Renames auth's old option values to their new equivalents.
  2. Where auth has no session-strategy answer but caching has a
     session-store answer, copies it over (translated), either into an
     existing auth row or a newly-created one.
  3. Where auth already has an answer, caching's is left alone — not
     merged, not overwritten; auth is the one source of truth going
     forward and nothing here second-guesses an answer the user already
     gave it directly.
*/

-- Rename auth's own old values to their new equivalents.
UPDATE "AspectPreference"
SET "data" = json_set("data", '$."session-strategy"', 'server-session-db')
WHERE "aspectKey" = 'auth' AND json_extract("data", '$."session-strategy"') = 'server-session';

UPDATE "AspectPreference"
SET "data" = json_set("data", '$."session-strategy"', 'jwt-stateless')
WHERE "aspectKey" = 'auth' AND json_extract("data", '$."session-strategy"') = 'jwt';

-- Carry caching's session-store value into an EXISTING auth row that has no
-- session-strategy answer of its own yet.
UPDATE "AspectPreference" AS auth_row
SET "data" = json_set(
  auth_row."data",
  '$."session-strategy"',
  (
    SELECT CASE json_extract(c."data", '$."session-store"')
      WHEN 'redis-session' THEN 'server-session-redis'
      WHEN 'db-session' THEN 'server-session-db'
      WHEN 'signed-cookie' THEN 'signed-cookie'
      WHEN 'jwt-stateless' THEN 'jwt-stateless'
      ELSE NULL
    END
    FROM "AspectPreference" c
    WHERE c."repoId" = auth_row."repoId" AND c."aspectKey" = 'caching'
  )
)
WHERE auth_row."aspectKey" = 'auth'
  AND json_extract(auth_row."data", '$."session-strategy"') IS NULL
  AND EXISTS (
    SELECT 1 FROM "AspectPreference" c
    WHERE c."repoId" = auth_row."repoId" AND c."aspectKey" = 'caching'
      AND json_extract(c."data", '$."session-store"') IS NOT NULL
  );

-- Same, but for a repo with a caching answer and no auth row at all yet.
INSERT INTO "AspectPreference" ("id", "projectId", "repoId", "aspectKey", "data", "updatedAt")
SELECT
  lower(hex(randomblob(16))),
  c."projectId",
  c."repoId",
  'auth',
  json_object(
    'session-strategy',
    CASE json_extract(c."data", '$."session-store"')
      WHEN 'redis-session' THEN 'server-session-redis'
      WHEN 'db-session' THEN 'server-session-db'
      WHEN 'signed-cookie' THEN 'signed-cookie'
      WHEN 'jwt-stateless' THEN 'jwt-stateless'
    END
  ),
  CURRENT_TIMESTAMP
FROM "AspectPreference" c
WHERE c."aspectKey" = 'caching'
  AND json_extract(c."data", '$."session-store"') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "AspectPreference" a WHERE a."repoId" = c."repoId" AND a."aspectKey" = 'auth'
  );

-- Drop the now-unused key from caching's own rows for tidiness (the field
-- no longer exists in the registry, so it would just sit there unread).
UPDATE "AspectPreference"
SET "data" = json_remove("data", '$."session-store"')
WHERE "aspectKey" = 'caching' AND json_extract("data", '$."session-store"') IS NOT NULL;
