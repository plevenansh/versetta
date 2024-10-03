-- CreateTable
CREATE TABLE "CommentAnalysis" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "youtubeUrl" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "general" TEXT NOT NULL,
    "topComments" TEXT[],
    "contentIdeas" TEXT[],
    "sentiment" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommentAnalysis_userId_idx" ON "CommentAnalysis"("userId");

-- AddForeignKey
ALTER TABLE "CommentAnalysis" ADD CONSTRAINT "CommentAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
