/*
  Warnings:

  - The primary key for the `CommentAnalysis` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sentiment` on the `CommentAnalysis` table. All the data in the column will be lost.
  - Changed the type of `topComments` on the `CommentAnalysis` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `contentIdeas` on the `CommentAnalysis` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CommentAnalysis" DROP CONSTRAINT "CommentAnalysis_pkey",
DROP COLUMN "sentiment",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "topComments",
ADD COLUMN     "topComments" JSONB NOT NULL,
DROP COLUMN "contentIdeas",
ADD COLUMN     "contentIdeas" JSONB NOT NULL,
ADD CONSTRAINT "CommentAnalysis_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CommentAnalysis_id_seq";
