/*
  Warnings:

  - You are about to drop the column `assetType` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `idea` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `publishDate` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `scene` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `selected` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `volume` on the `SubStage` table. All the data in the column will be lost.
  - You are about to drop the column `word` on the `SubStage` table. All the data in the column will be lost.
  - The `content` column on the `SubStage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `customSubStageId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `CustomSubStage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PublishDetails` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `name` on the `MainStage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `duration` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `SubStage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `projectId` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CustomSubStage" DROP CONSTRAINT "CustomSubStage_mainStageId_fkey";

-- DropForeignKey
ALTER TABLE "CustomSubStage" DROP CONSTRAINT "CustomSubStage_projectId_fkey";

-- DropForeignKey
ALTER TABLE "PublishDetails" DROP CONSTRAINT "PublishDetails_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_customSubStageId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";

-- AlterTable
ALTER TABLE "MainStage" ADD COLUMN     "starred" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "name",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "duration" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SubStage" DROP COLUMN "assetType",
DROP COLUMN "completed",
DROP COLUMN "description",
DROP COLUMN "idea",
DROP COLUMN "imageUrl",
DROP COLUMN "link",
DROP COLUMN "location",
DROP COLUMN "platform",
DROP COLUMN "publishDate",
DROP COLUMN "scene",
DROP COLUMN "selected",
DROP COLUMN "status",
DROP COLUMN "time",
DROP COLUMN "title",
DROP COLUMN "url",
DROP COLUMN "volume",
DROP COLUMN "word",
DROP COLUMN "name",
ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "customSubStageId",
ALTER COLUMN "projectId" SET NOT NULL;

-- DropTable
DROP TABLE "CustomSubStage";

-- DropTable
DROP TABLE "PublishDetails";

-- DropEnum
DROP TYPE "MainStageName";

-- DropEnum
DROP TYPE "SubStageName";

-- CreateIndex
CREATE UNIQUE INDEX "MainStage_projectId_name_key" ON "MainStage"("projectId", "name");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
