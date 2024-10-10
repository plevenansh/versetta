/*
  Warnings:

  - You are about to drop the column `concept` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `productionNotes` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `script` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `subActive` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stageId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `BRollIdea` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Equipment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FilmingSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Inspiration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KeyPoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Keyword` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectStage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Shot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StoryboardFrame` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Thumbnail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VideoAsset` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `plan` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `access` to the `TeamMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER');

-- CreateEnum
CREATE TYPE "MainStageName" AS ENUM ('IDEATION', 'PRE_PRODUCTION', 'PRODUCTION', 'POST_PRODUCTION', 'PUBLISHING', 'ANALYTICS');

-- CreateEnum
CREATE TYPE "SubStageName" AS ENUM ('KEY_POINT', 'REFERENCE', 'INSPIRATION', 'KEYWORD', 'EQUIPMENT', 'STORYBOARD_FRAME', 'FILMING_SESSION', 'B_ROLL_IDEA', 'SHOT', 'VIDEO_ASSET', 'THUMBNAIL', 'PUBLISH_DETAILS', 'EDITING_PROGRESS', 'SUBTITLES', 'FEEDBACK_REVISION', 'EXPORT_SETTINGS', 'VIDEO_DETAILS', 'PUBLISHING_SCHEDULE', 'CROSS_PLATFORM_SHARING', 'MONETIZATION');

-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('TEAM_ASSET', 'PROJECT_ASSET', 'STOCK_FOOTAGE', 'FINISHED_VIDEO', 'THUMBNAIL', 'OTHER');

-- DropForeignKey
ALTER TABLE "BRollIdea" DROP CONSTRAINT "BRollIdea_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_projectId_fkey";

-- DropForeignKey
ALTER TABLE "FilmingSession" DROP CONSTRAINT "FilmingSession_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Inspiration" DROP CONSTRAINT "Inspiration_projectId_fkey";

-- DropForeignKey
ALTER TABLE "KeyPoint" DROP CONSTRAINT "KeyPoint_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Keyword" DROP CONSTRAINT "Keyword_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectStage" DROP CONSTRAINT "ProjectStage_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Reference" DROP CONSTRAINT "Reference_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Shot" DROP CONSTRAINT "Shot_projectId_fkey";

-- DropForeignKey
ALTER TABLE "StoryboardFrame" DROP CONSTRAINT "StoryboardFrame_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_stageId_fkey";

-- DropForeignKey
ALTER TABLE "Thumbnail" DROP CONSTRAINT "Thumbnail_projectId_fkey";

-- DropForeignKey
ALTER TABLE "VideoAsset" DROP CONSTRAINT "VideoAsset_projectId_fkey";

-- DropIndex
DROP INDEX "Task_stageId_idx";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "concept",
DROP COLUMN "productionNotes",
DROP COLUMN "script";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "subActive",
ADD COLUMN     "plan" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "stageId",
ADD COLUMN     "customSubStageId" INTEGER,
ADD COLUMN     "mainStageId" INTEGER,
ADD COLUMN     "subStageId" INTEGER;

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "access" "AccessLevel" NOT NULL;

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "subActive" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "BRollIdea";

-- DropTable
DROP TABLE "Equipment";

-- DropTable
DROP TABLE "FilmingSession";

-- DropTable
DROP TABLE "Inspiration";

-- DropTable
DROP TABLE "KeyPoint";

-- DropTable
DROP TABLE "Keyword";

-- DropTable
DROP TABLE "ProjectStage";

-- DropTable
DROP TABLE "Reference";

-- DropTable
DROP TABLE "Shot";

-- DropTable
DROP TABLE "StoryboardFrame";

-- DropTable
DROP TABLE "Thumbnail";

-- DropTable
DROP TABLE "VideoAsset";

-- CreateTable
CREATE TABLE "MainStage" (
    "id" SERIAL NOT NULL,
    "name" "MainStageName" NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "MainStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomSubStage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "projectId" INTEGER NOT NULL,
    "mainStageId" INTEGER NOT NULL,
    "content" JSONB,

    CONSTRAINT "CustomSubStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubStage" (
    "id" SERIAL NOT NULL,
    "name" "SubStageName" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "mainStageId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "content" TEXT,
    "completed" BOOLEAN,
    "link" TEXT,
    "imageUrl" TEXT,
    "word" TEXT,
    "volume" TEXT,
    "scene" INTEGER,
    "time" TEXT,
    "location" TEXT,
    "idea" TEXT,
    "description" TEXT,
    "title" TEXT,
    "url" TEXT,
    "assetType" TEXT,
    "selected" BOOLEAN,
    "publishDate" TIMESTAMP(3),
    "platform" TEXT,
    "status" TEXT,

    CONSTRAINT "SubStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Storage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StorageType" NOT NULL,
    "url" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "projectId" INTEGER,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MainStage_projectId_idx" ON "MainStage"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "MainStage_projectId_name_key" ON "MainStage"("projectId", "name");

-- CreateIndex
CREATE INDEX "CustomSubStage_projectId_idx" ON "CustomSubStage"("projectId");

-- CreateIndex
CREATE INDEX "CustomSubStage_mainStageId_idx" ON "CustomSubStage"("mainStageId");

-- CreateIndex
CREATE INDEX "SubStage_mainStageId_idx" ON "SubStage"("mainStageId");

-- CreateIndex
CREATE INDEX "SubStage_projectId_idx" ON "SubStage"("projectId");

-- CreateIndex
CREATE INDEX "Storage_teamId_idx" ON "Storage"("teamId");

-- CreateIndex
CREATE INDEX "Storage_projectId_idx" ON "Storage"("projectId");

-- CreateIndex
CREATE INDEX "Task_mainStageId_idx" ON "Task"("mainStageId");

-- CreateIndex
CREATE INDEX "Task_subStageId_idx" ON "Task"("subStageId");

-- AddForeignKey
ALTER TABLE "MainStage" ADD CONSTRAINT "MainStage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomSubStage" ADD CONSTRAINT "CustomSubStage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomSubStage" ADD CONSTRAINT "CustomSubStage_mainStageId_fkey" FOREIGN KEY ("mainStageId") REFERENCES "MainStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubStage" ADD CONSTRAINT "SubStage_mainStageId_fkey" FOREIGN KEY ("mainStageId") REFERENCES "MainStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubStage" ADD CONSTRAINT "SubStage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_mainStageId_fkey" FOREIGN KEY ("mainStageId") REFERENCES "MainStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_subStageId_fkey" FOREIGN KEY ("subStageId") REFERENCES "SubStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_customSubStageId_fkey" FOREIGN KEY ("customSubStageId") REFERENCES "CustomSubStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
