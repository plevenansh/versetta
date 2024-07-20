-- Ensure a user exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "User" WHERE id = 1) THEN
    INSERT INTO "User" (id, email, name, "createdAt", "updatedAt")
    VALUES (1, 'default@example.com', 'Default User', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  END IF;
END $$;

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_projectId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "teamId" INTEGER;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "teamId" INTEGER,
ALTER COLUMN "projectId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Team_userId_idx" ON "Team"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TeamMember_userId_idx" ON "TeamMember"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TeamMember_teamId_idx" ON "TeamMember"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_userId_teamId_key" ON "TeamMember"("userId", "teamId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Project_teamId_idx" ON "Project"("teamId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Task_teamId_idx" ON "Task"("teamId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create a default team
INSERT INTO "Team" (name, description, "userId", "createdAt", "updatedAt") 
VALUES ('Default Team', 'Automatically created default team', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Get the ID of the default team
DO $$
DECLARE default_team_id INT;
BEGIN
  SELECT id INTO default_team_id FROM "Team" WHERE name = 'Default Team' LIMIT 1;

  -- Update existing projects to use the default team
  UPDATE "Project" SET "teamId" = default_team_id WHERE "teamId" IS NULL;

  -- Make teamId non-nullable after ensuring all rows have a value
  ALTER TABLE "Project" ALTER COLUMN "teamId" SET NOT NULL;

  -- Add the foreign key constraint if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Project_teamId_fkey') THEN
    ALTER TABLE "Project" ADD CONSTRAINT "Project_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;