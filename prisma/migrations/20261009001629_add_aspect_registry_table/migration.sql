-- CreateTable
CREATE TABLE "Aspect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "cards" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Aspect_key_key" ON "Aspect"("key");
