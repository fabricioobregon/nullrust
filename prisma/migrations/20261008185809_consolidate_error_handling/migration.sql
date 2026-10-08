/*
  Error handling style (programming-language) and API error response shape
  (api-design) both move into Observability's new "Error handling" card,
  next to its existing error tracking & alerting card. Data-only migration
  (no schema change): carries any existing answer to its new home, creating
  the observability row first if neither source has ever touched it, then
  drops the old keys from their original aspects.
*/

-- Ensure an observability row exists for any repo with an answer to carry
-- over, before the two field-specific copies below need somewhere to land.
INSERT INTO "AspectPreference" ("id", "projectId", "repoId", "aspectKey", "data", "updatedAt")
SELECT
  lower(hex(randomblob(16))),
  src."projectId",
  src."repoId",
  'observability',
  '{}',
  CURRENT_TIMESTAMP
FROM (
  SELECT "projectId", "repoId" FROM "AspectPreference"
  WHERE "aspectKey" = 'programming-language' AND json_extract("data", '$."error-handling-style"') IS NOT NULL
  UNION
  SELECT "projectId", "repoId" FROM "AspectPreference"
  WHERE "aspectKey" = 'api-design' AND json_extract("data", '$."error-shape"') IS NOT NULL
) AS src
WHERE NOT EXISTS (
  SELECT 1 FROM "AspectPreference" o WHERE o."repoId" = src."repoId" AND o."aspectKey" = 'observability'
);

-- Carry error-handling-style from programming-language into observability.
UPDATE "AspectPreference" AS obs
SET "data" = json_set(
  obs."data",
  '$."error-handling-style"',
  (SELECT json_extract(pl."data", '$."error-handling-style"') FROM "AspectPreference" pl
   WHERE pl."repoId" = obs."repoId" AND pl."aspectKey" = 'programming-language')
)
WHERE obs."aspectKey" = 'observability'
  AND json_extract(obs."data", '$."error-handling-style"') IS NULL
  AND EXISTS (
    SELECT 1 FROM "AspectPreference" pl
    WHERE pl."repoId" = obs."repoId" AND pl."aspectKey" = 'programming-language'
      AND json_extract(pl."data", '$."error-handling-style"') IS NOT NULL
  );

-- Carry error-shape from api-design into observability.
UPDATE "AspectPreference" AS obs
SET "data" = json_set(
  obs."data",
  '$."error-shape"',
  (SELECT json_extract(ad."data", '$."error-shape"') FROM "AspectPreference" ad
   WHERE ad."repoId" = obs."repoId" AND ad."aspectKey" = 'api-design')
)
WHERE obs."aspectKey" = 'observability'
  AND json_extract(obs."data", '$."error-shape"') IS NULL
  AND EXISTS (
    SELECT 1 FROM "AspectPreference" ad
    WHERE ad."repoId" = obs."repoId" AND ad."aspectKey" = 'api-design'
      AND json_extract(ad."data", '$."error-shape"') IS NOT NULL
  );

-- Drop the now-unused keys from their original aspects.
UPDATE "AspectPreference"
SET "data" = json_remove("data", '$."error-handling-style"')
WHERE "aspectKey" = 'programming-language' AND json_extract("data", '$."error-handling-style"') IS NOT NULL;

UPDATE "AspectPreference"
SET "data" = json_remove("data", '$."error-shape"')
WHERE "aspectKey" = 'api-design' AND json_extract("data", '$."error-shape"') IS NOT NULL;
