/*
  Repos become real, user-named rows (projectId, name, kind) instead of a
  fixed infra/backend/frontend/mobile tab set. This migration is written by
  hand (not `prisma migrate dev`'s default output) so it preserves any
  preferences already saved under the old fixed tabs: for every distinct
  (projectId, repoKey) pair that has at least one AspectPreference row, it
  fabricates one Repo of that kind before relinking AspectPreference to it
  by repoId. A project with no saved preferences yet simply gets no repos,
  matching the new "add a repo to get started" flow.
*/

-- CreateTable
CREATE TABLE "Repo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Repo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Backfill one Repo per distinct (project, old repoKey) combination that
-- actually has saved preferences, named after the old fixed-tab title.
INSERT INTO "Repo" ("id", "projectId", "name", "kind", "createdAt", "updatedAt")
SELECT
  lower(hex(randomblob(16))),
  "projectId",
  CASE "repoKey"
    WHEN 'infra' THEN 'Infra'
    WHEN 'backend' THEN 'Backend'
    WHEN 'frontend' THEN 'Frontend'
    WHEN 'mobile' THEN 'Mobile'
    ELSE "repoKey"
  END,
  "repoKey",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "projectId", "repoKey" FROM "AspectPreference");

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AspectPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "aspectKey" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AspectPreference_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AspectPreference_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AspectPreference" ("id", "projectId", "repoId", "aspectKey", "data", "updatedAt")
SELECT ap."id", ap."projectId", r."id", ap."aspectKey", ap."data", ap."updatedAt"
FROM "AspectPreference" ap
JOIN "Repo" r ON r."projectId" = ap."projectId" AND r."kind" = ap."repoKey";
DROP TABLE "AspectPreference";
ALTER TABLE "new_AspectPreference" RENAME TO "AspectPreference";
CREATE UNIQUE INDEX "AspectPreference_repoId_aspectKey_key" ON "AspectPreference"("repoId", "aspectKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Repo_projectId_idx" ON "Repo"("projectId");
