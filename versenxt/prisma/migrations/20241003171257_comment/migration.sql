/*
  Warnings:

  - Added the required column `metrics` to the `CommentAnalysis` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `topComments` on the `CommentAnalysis` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `contentIdeas` on the `CommentAnalysis` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CommentAnalysis" ADD COLUMN     "metrics" JSONB NOT NULL,
DROP COLUMN "topComments",
ADD COLUMN     "topComments" JSONB NOT NULL,
DROP COLUMN "contentIdeas",
ADD COLUMN     "contentIdeas" JSONB NOT NULL;
