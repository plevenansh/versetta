-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "creatorId" INTEGER;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update existing rows with a default value (replace 1 with an appropriate user ID)
UPDATE "Subscription" SET "creatorId" = 1 WHERE "creatorId" IS NULL;

-- Make the column required after setting a default value
ALTER TABLE "Subscription" ALTER COLUMN "creatorId" SET NOT NULL;