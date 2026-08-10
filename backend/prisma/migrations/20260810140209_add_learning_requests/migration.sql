-- CreateEnum
CREATE TYPE "LearningRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "learning_requests" (
    "id" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    "status" "LearningRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learning_requests_senderId_status_idx" ON "learning_requests"("senderId", "status");

-- CreateIndex
CREATE INDEX "learning_requests_receiverId_status_idx" ON "learning_requests"("receiverId", "status");

-- CreateIndex
CREATE INDEX "learning_requests_createdAt_idx" ON "learning_requests"("createdAt");

-- AddForeignKey
ALTER TABLE "learning_requests" ADD CONSTRAINT "learning_requests_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_requests" ADD CONSTRAINT "learning_requests_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
