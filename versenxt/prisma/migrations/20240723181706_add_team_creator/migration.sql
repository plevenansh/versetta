-- Step 1: Rename the old User table to a temporary name
ALTER TABLE "User" RENAME TO "User_old";

-- Step 2: Create the new users table
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Step 3: Copy data from the old table to the new table
INSERT INTO "users" ("id", "email", "name", "gender", "createdAt", "updatedAt")
SELECT "id", "email", "name", "gender", "createdAt", "updatedAt"
FROM "User_old";

-- Step 4: Create unique index on email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Step 5: Add creatorId column to teams table as nullable
ALTER TABLE "teams" ADD COLUMN "creatorId" INTEGER;

-- Step 6: Update existing teams with a creatorId (assuming the first member is the creator)
UPDATE "teams" 
SET "creatorId" = (
    SELECT "userId" 
    FROM "TeamMember" 
    WHERE "TeamMember"."teamId" = "teams"."id" 
    LIMIT 1
);

-- Step 7: Make creatorId non-nullable after populating it
ALTER TABLE "teams" ALTER COLUMN "creatorId" SET NOT NULL;

-- Step 8: Create index on creatorId
CREATE INDEX "teams_creatorId_idx" ON "teams"("creatorId");

-- Step 9: Add foreign key constraint
ALTER TABLE "teams" ADD CONSTRAINT "teams_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 10: Update TeamMember foreign key to point to the new users table
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 11: Drop the old User table
DROP TABLE "User_old";
