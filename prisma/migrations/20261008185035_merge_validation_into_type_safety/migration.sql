/*
  Schema validation (library, validation-scope) moves from
  "data-validation-state" into "programming-language"'s Type Safety &
  Validation card. Data-only migration (no schema change): carries any
  existing answer over to its new home, into an existing row if one
  exists or a newly-created one otherwise, then drops the old keys from
  data-validation-state so nothing stale lingers unread.
*/

-- Copy "library" into an existing programming-language row.
UPDATE "AspectPreference" AS lang_row
SET "data" = json_set(
  lang_row."data",
  '$.library',
  (SELECT json_extract(dv."data", '$.library') FROM "AspectPreference" dv
   WHERE dv."repoId" = lang_row."repoId" AND dv."aspectKey" = 'data-validation-state')
)
WHERE lang_row."aspectKey" = 'programming-language'
  AND EXISTS (
    SELECT 1 FROM "AspectPreference" dv
    WHERE dv."repoId" = lang_row."repoId" AND dv."aspectKey" = 'data-validation-state'
      AND json_extract(dv."data", '$.library') IS NOT NULL
  );

-- Copy "validation-scope" into an existing programming-language row.
UPDATE "AspectPreference" AS lang_row
SET "data" = json_set(
  lang_row."data",
  '$."validation-scope"',
  (SELECT json_extract(dv."data", '$."validation-scope"') FROM "AspectPreference" dv
   WHERE dv."repoId" = lang_row."repoId" AND dv."aspectKey" = 'data-validation-state')
)
WHERE lang_row."aspectKey" = 'programming-language'
  AND EXISTS (
    SELECT 1 FROM "AspectPreference" dv
    WHERE dv."repoId" = lang_row."repoId" AND dv."aspectKey" = 'data-validation-state'
      AND json_extract(dv."data", '$."validation-scope"') IS NOT NULL
  );

-- Same, for a repo with an answer here but no programming-language row at
-- all yet (unlikely — that aspect is scope "all" — but handled anyway).
INSERT INTO "AspectPreference" ("id", "projectId", "repoId", "aspectKey", "data", "updatedAt")
SELECT
  lower(hex(randomblob(16))),
  dv."projectId",
  dv."repoId",
  'programming-language',
  json_object(
    'library', json_extract(dv."data", '$.library'),
    'validation-scope', json_extract(dv."data", '$."validation-scope"')
  ),
  CURRENT_TIMESTAMP
FROM "AspectPreference" dv
WHERE dv."aspectKey" = 'data-validation-state'
  AND (json_extract(dv."data", '$.library') IS NOT NULL OR json_extract(dv."data", '$."validation-scope"') IS NOT NULL)
  AND NOT EXISTS (
    SELECT 1 FROM "AspectPreference" lr WHERE lr."repoId" = dv."repoId" AND lr."aspectKey" = 'programming-language'
  );

-- Drop the now-unused keys from data-validation-state's own rows.
UPDATE "AspectPreference"
SET "data" = json_remove(json_remove("data", '$.library'), '$."validation-scope"')
WHERE "aspectKey" = 'data-validation-state'
  AND (json_extract("data", '$.library') IS NOT NULL OR json_extract("data", '$."validation-scope"') IS NOT NULL);
