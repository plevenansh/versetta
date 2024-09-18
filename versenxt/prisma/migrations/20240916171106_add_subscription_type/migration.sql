/*
  Warnings:

  - Added the required column `type` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Add a new column 'type' with a default value
ALTER TABLE "Subscription" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'paid';

-- Remove the default constraint after updating existing rows
ALTER TABLE "Subscription" ALTER COLUMN "type" DROP DEFAULT;