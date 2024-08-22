-- Step 1: Add the column as nullable
ALTER TABLE "Task" ADD COLUMN "userId" INTEGER;

-- Step 2: Update existing rows (replace 1 with a default user ID that exists in your User table)
UPDATE "Task" SET "userId" = 1 WHERE "userId" IS NULL;

-- Step 3: Make the column required
ALTER TABLE "Task" ALTER COLUMN "userId" SET NOT NULL;

-- Step 4: Add the foreign key constraint
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 5: Add the index
CREATE INDEX "Task_userId_idx" ON "Task"("userId");
