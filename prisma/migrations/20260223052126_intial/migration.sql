/*
  Warnings:

  - You are about to drop the column `folder` on the `media` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '[]',
    "excerpt" TEXT NOT NULL DEFAULT '',
    "featuredImg" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "media_folders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'local',
    "alt" TEXT NOT NULL DEFAULT '',
    "folderId" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "media_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "media_folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_media" ("alt", "createdAt", "filename", "height", "id", "mimeType", "originalName", "provider", "size", "updatedAt", "url", "width") SELECT "alt", "createdAt", "filename", "height", "id", "mimeType", "originalName", "provider", "size", "updatedAt", "url", "width" FROM "media";
DROP TABLE "media";
ALTER TABLE "new_media" RENAME TO "media";
CREATE INDEX "media_folderId_idx" ON "media"("folderId");
CREATE INDEX "media_mimeType_idx" ON "media"("mimeType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "posts_slug_idx" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "posts_status_idx" ON "posts"("status");

-- CreateIndex
CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");
