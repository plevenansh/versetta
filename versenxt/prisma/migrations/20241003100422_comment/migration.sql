/*
  Warnings:

  - The primary key for the `CommentAnalysis` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `general` on the `CommentAnalysis` table. All the data in the column will be lost.
  - The `id` column on the `CommentAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `topComments` column on the `CommentAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `contentIdeas` column on the `CommentAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `generalAnalysis` to the `CommentAnalysis` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CommentAnalysis" DROP CONSTRAINT "CommentAnalysis_userId_fkey";

-- AlterTable
ALTER TABLE "CommentAnalysis" DROP CONSTRAINT "CommentAnalysis_pkey",
DROP COLUMN "general",
ADD COLUMN     "generalAnalysis" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "topComments",
ADD COLUMN     "topComments" TEXT[],
DROP COLUMN "contentIdeas",
ADD COLUMN     "contentIdeas" TEXT[],
ADD CONSTRAINT "CommentAnalysis_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "CommentAnalysis" ADD CONSTRAINT "CommentAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
