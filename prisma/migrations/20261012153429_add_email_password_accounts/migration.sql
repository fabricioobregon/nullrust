-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "passwordHash" TEXT,
    "githubId" TEXT,
    "githubLogin" TEXT,
    "githubAvatarUrl" TEXT,
    "encryptedGithubToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "encryptedGithubToken", "githubAvatarUrl", "githubId", "githubLogin", "id", "updatedAt") SELECT "createdAt", "encryptedGithubToken", "githubAvatarUrl", "githubId", "githubLogin", "id", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
