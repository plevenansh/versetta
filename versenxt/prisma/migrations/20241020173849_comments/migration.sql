-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "mainStageId" INTEGER,
ADD COLUMN     "subStageId" INTEGER;

-- CreateIndex
CREATE INDEX "Comment_projectId_idx" ON "Comment"("projectId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Comment_mainStageId_idx" ON "Comment"("mainStageId");

-- CreateIndex
CREATE INDEX "Comment_subStageId_idx" ON "Comment"("subStageId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_mainStageId_fkey" FOREIGN KEY ("mainStageId") REFERENCES "MainStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_subStageId_fkey" FOREIGN KEY ("subStageId") REFERENCES "SubStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
