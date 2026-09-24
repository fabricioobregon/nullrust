/*
  Warnings:

  - Added the required column `repoKey` to the `AspectPreference` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AspectPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "repoKey" TEXT NOT NULL,
    "aspectKey" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AspectPreference_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AspectPreference" ("aspectKey", "data", "id", "projectId", "updatedAt") SELECT "aspectKey", "data", "id", "projectId", "updatedAt" FROM "AspectPreference";
DROP TABLE "AspectPreference";
ALTER TABLE "new_AspectPreference" RENAME TO "AspectPreference";
CREATE UNIQUE INDEX "AspectPreference_projectId_repoKey_aspectKey_key" ON "AspectPreference"("projectId", "repoKey", "aspectKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
