-- migration.sql

-- Step 1: Add the column as nullable
ALTER TABLE "ProjectStage" ADD COLUMN "order" INTEGER;

-- Step 2: Update existing rows (replace with appropriate logic)
-- This example uses the id as the order, but you might want to adjust this
-- based on how you want to order your existing stages
UPDATE "ProjectStage" SET "order" = id;

-- Step 3: Make the column required
ALTER TABLE "ProjectStage" ALTER COLUMN "order" SET NOT NULL;

-- Optional: Add an index on the order column if you'll be querying by it frequently
CREATE INDEX "ProjectStage_order_idx" ON "ProjectStage"("order");