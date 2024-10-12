-- AlterTable
ALTER TABLE "MainStage" ALTER COLUMN "id" SET DATA TYPE INTEGER,
ALTER COLUMN "projectId" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "id" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Storage" ALTER COLUMN "projectId" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "SubStage" ALTER COLUMN "id" SET DATA TYPE INTEGER,
ALTER COLUMN "mainStageId" SET DATA TYPE INTEGER,
ALTER COLUMN "projectId" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "projectId" SET DATA TYPE INTEGER,
ALTER COLUMN "mainStageId" SET DATA TYPE INTEGER,
ALTER COLUMN "subStageId" SET DATA TYPE INTEGER;

-- DropForeignKey
ALTER TABLE "MainStage" DROP CONSTRAINT "MainStage_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Storage" DROP CONSTRAINT "Storage_projectId_fkey";

-- DropForeignKey
ALTER TABLE "SubStage" DROP CONSTRAINT "SubStage_mainStageId_fkey";

-- DropForeignKey
ALTER TABLE "SubStage" DROP CONSTRAINT "SubStage_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_mainStageId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_subStageId_fkey";

-- AddForeignKey
ALTER TABLE "MainStage" ADD CONSTRAINT "MainStage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubStage" ADD CONSTRAINT "SubStage_mainStageId_fkey" FOREIGN KEY ("mainStageId") REFERENCES "MainStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubStage" ADD CONSTRAINT "SubStage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_mainStageId_fkey" FOREIGN KEY ("mainStageId") REFERENCES "MainStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_subStageId_fkey" FOREIGN KEY ("subStageId") REFERENCES "SubStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;