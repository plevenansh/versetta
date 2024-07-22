/*
  Warnings:

  - You are about to drop the column `creatorId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Team` table. All the data in the column will be lost.
  - Made the column `updatedAt` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `teamId` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `creatorId` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/

-- Set a default team ID for tasks with null teamId
-- Replace 1 with an appropriate default team ID
UPDATE "Task" SET "teamId" = 1 WHERE "teamId" IS NULL;

-- Now make the column required
ALTER TABLE "Task" ALTER COLUMN "teamId" SET NOT NULL;

-- Repeat similar steps for creatorId if needed
UPDATE "Task" SET "creatorId" = 1 WHERE "creatorId" IS NULL;
ALTER TABLE "Task" ALTER COLUMN "creatorId" SET NOT NULL;

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_userId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_userId_fkey";

-- DropIndex
DROP INDEX "Project_creatorId_idx";

-- DropIndex
DROP INDEX "Project_userId_idx";

-- DropIndex
DROP INDEX "Task_userId_idx";

-- DropIndex
DROP INDEX "Team_creatorId_idx";

-- DropIndex
DROP INDEX "Team_userId_idx";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "creatorId",
DROP COLUMN "userId",
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "completed",
DROP COLUMN "userId",
ALTER COLUMN "teamId" SET NOT NULL,
ALTER COLUMN "creatorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "creatorId",
DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "TeamMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
