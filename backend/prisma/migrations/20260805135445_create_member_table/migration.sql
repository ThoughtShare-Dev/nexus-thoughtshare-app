-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('EMAIL', 'WHATSAPP', 'PHONE', 'INSTAGRAM');

-- CreateTable
CREATE TABLE "members" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "bio" VARCHAR(500),
    "profilePictureUrl" VARCHAR(500),
    "preferredContactType" "ContactType",
    "preferredContactValue" VARCHAR(255),
    "avgRating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hiddenFromSearch" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE INDEX "members_hiddenFromSearch_isActive_avgRating_name_idx" ON "members"("hiddenFromSearch", "isActive", "avgRating", "name");

-- CreateIndex
CREATE INDEX "members_isActive_idx" ON "members"("isActive");
