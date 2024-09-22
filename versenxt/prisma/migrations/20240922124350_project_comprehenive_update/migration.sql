-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "concept" TEXT,
ADD COLUMN     "productionNotes" TEXT,
ADD COLUMN     "script" TEXT;

-- CreateTable
CREATE TABLE "KeyPoint" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "KeyPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspiration" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "Inspiration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "volume" TEXT,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryboardFrame" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "scene" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "StoryboardFrame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilmingSession" (
    "id" SERIAL NOT NULL,
    "scene" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "FilmingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BRollIdea" (
    "id" SERIAL NOT NULL,
    "idea" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "BRollIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shot" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "Shot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoAsset" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "VideoAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thumbnail" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "Thumbnail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishDetails" (
    "id" SERIAL NOT NULL,
    "publishDate" TIMESTAMP(3),
    "platform" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "PublishDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KeyPoint_projectId_idx" ON "KeyPoint"("projectId");

-- CreateIndex
CREATE INDEX "Reference_projectId_idx" ON "Reference"("projectId");

-- CreateIndex
CREATE INDEX "Inspiration_projectId_idx" ON "Inspiration"("projectId");

-- CreateIndex
CREATE INDEX "Keyword_projectId_idx" ON "Keyword"("projectId");

-- CreateIndex
CREATE INDEX "Equipment_projectId_idx" ON "Equipment"("projectId");

-- CreateIndex
CREATE INDEX "StoryboardFrame_projectId_idx" ON "StoryboardFrame"("projectId");

-- CreateIndex
CREATE INDEX "FilmingSession_projectId_idx" ON "FilmingSession"("projectId");

-- CreateIndex
CREATE INDEX "BRollIdea_projectId_idx" ON "BRollIdea"("projectId");

-- CreateIndex
CREATE INDEX "Shot_projectId_idx" ON "Shot"("projectId");

-- CreateIndex
CREATE INDEX "VideoAsset_projectId_idx" ON "VideoAsset"("projectId");

-- CreateIndex
CREATE INDEX "Thumbnail_projectId_idx" ON "Thumbnail"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "PublishDetails_projectId_key" ON "PublishDetails"("projectId");

-- AddForeignKey
ALTER TABLE "KeyPoint" ADD CONSTRAINT "KeyPoint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspiration" ADD CONSTRAINT "Inspiration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryboardFrame" ADD CONSTRAINT "StoryboardFrame_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilmingSession" ADD CONSTRAINT "FilmingSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BRollIdea" ADD CONSTRAINT "BRollIdea_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shot" ADD CONSTRAINT "Shot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAsset" ADD CONSTRAINT "VideoAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thumbnail" ADD CONSTRAINT "Thumbnail_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishDetails" ADD CONSTRAINT "PublishDetails_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
