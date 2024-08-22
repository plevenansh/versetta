/*
  Warnings:

  - A unique constraint covering the columns `[workOsMembershipId]` on the table `TeamMember` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "workOsMembershipId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_workOsMembershipId_key" ON "TeamMember"("workOsMembershipId");
