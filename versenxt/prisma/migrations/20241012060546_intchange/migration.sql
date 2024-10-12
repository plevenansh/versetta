/*
  Warnings:

  - The primary key for the `MainStage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SubStage` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
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

-- AlterTable
ALTER TABLE "MainStage" DROP CONSTRAINT "MainStage_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGINT,
ALTER COLUMN "projectId" SET DATA TYPE BIGINT,
ADD CONSTRAINT "MainStage_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Project" DROP CONSTRAINT "Project_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Project_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Storage" ALTER COLUMN "projectId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "SubStage" DROP CONSTRAINT "SubStage_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGINT,
ALTER COLUMN "mainStageId" SET DATA TYPE BIGINT,
ALTER COLUMN "projectId" SET DATA TYPE BIGINT,
ADD CONSTRAINT "SubStage_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "projectId" SET DATA TYPE BIGINT,
ALTER COLUMN "mainStageId" SET DATA TYPE BIGINT,
ALTER COLUMN "subStageId" SET DATA TYPE BIGINT;

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
