/*
  Warnings:

  - A unique constraint covering the columns `[workOsUserId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workOsUserId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add the new column as nullable
ALTER TABLE "users" ADD COLUMN "workOsUserId" TEXT;

-- Step 2: Update existing rows with a placeholder value
-- You may want to replace 'placeholder_' with a more appropriate prefix
UPDATE "users" SET "workOsUserId" = 'placeholder_' || id::text WHERE "workOsUserId" IS NULL;

-- Step 3: Make the column non-nullable
ALTER TABLE "users" ALTER COLUMN "workOsUserId" SET NOT NULL;

-- Step 4: Add the unique constraint
CREATE UNIQUE INDEX "users_workOsUserId_key" ON "users"("workOsUserId");