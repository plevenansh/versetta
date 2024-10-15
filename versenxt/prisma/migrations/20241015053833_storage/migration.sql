/*
  Warnings:

  - A unique constraint covering the columns `[blobName]` on the table `Storage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `blobName` to the `Storage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `Storage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Storage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Storage" ADD COLUMN     "blobName" TEXT NOT NULL,
ADD COLUMN     "contentType" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creatorId" INTEGER NOT NULL,
ADD COLUMN     "size" INTEGER,
ADD COLUMN     "subStageId" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Storage_blobName_key" ON "Storage"("blobName");

-- CreateIndex
CREATE INDEX "Storage_subStageId_idx" ON "Storage"("subStageId");

-- CreateIndex
CREATE INDEX "Storage_creatorId_idx" ON "Storage"("creatorId");

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_subStageId_fkey" FOREIGN KEY ("subStageId") REFERENCES "SubStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "TeamMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
