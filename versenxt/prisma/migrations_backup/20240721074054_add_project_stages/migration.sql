-- CreateTable
CREATE TABLE "ProjectStage" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "stage" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProjectStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectStage_projectId_idx" ON "ProjectStage"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectStage_projectId_stage_key" ON "ProjectStage"("projectId", "stage");

-- AddForeignKey
ALTER TABLE "ProjectStage" ADD CONSTRAINT "ProjectStage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
