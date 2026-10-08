/*
  CI/CD's "environments" field used "preview" for the same tier
  Infrastructure's "environment-tiers" field calls "ephemeral-per-pr".
  Renaming the value in the registry to match; this data-only migration
  (no schema change) renames it inside any already-saved answer's array so
  nothing silently reverts to looking unanswered.
*/

UPDATE "AspectPreference"
SET "data" = json_set(
  "data",
  '$.environments',
  (
    SELECT json_group_array(
      CASE value WHEN 'preview' THEN 'ephemeral-per-pr' ELSE value END
    )
    FROM json_each("data", '$.environments')
  )
)
WHERE "aspectKey" = 'ci-cd'
  AND json_extract("data", '$.environments') IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM json_each("data", '$.environments') WHERE value = 'preview'
  );
