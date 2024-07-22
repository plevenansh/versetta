-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "creatorId" INTEGER;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "assigneeId" INTEGER,
ADD COLUMN     "creatorId" INTEGER;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "creatorId" INTEGER;

-- CreateIndex
CREATE INDEX "Project_creatorId_idx" ON "Project"("creatorId");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- CreateIndex
CREATE INDEX "Task_creatorId_idx" ON "Task"("creatorId");

-- CreateIndex
CREATE INDEX "Team_creatorId_idx" ON "Team"("creatorId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
