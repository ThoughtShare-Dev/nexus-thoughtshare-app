-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_skills" (
    "memberId" UUID NOT NULL,
    "skillId" UUID NOT NULL,

    CONSTRAINT "teaching_skills_pkey" PRIMARY KEY ("memberId","skillId")
);

-- CreateTable
CREATE TABLE "learning_skills" (
    "memberId" UUID NOT NULL,
    "skillId" UUID NOT NULL,

    CONSTRAINT "learning_skills_pkey" PRIMARY KEY ("memberId","skillId")
);

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE INDEX "skills_name_idx" ON "skills"("name");

-- CreateIndex
CREATE INDEX "teaching_skills_skillId_idx" ON "teaching_skills"("skillId");

-- CreateIndex
CREATE INDEX "learning_skills_skillId_idx" ON "learning_skills"("skillId");

-- AddForeignKey
ALTER TABLE "teaching_skills" ADD CONSTRAINT "teaching_skills_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_skills" ADD CONSTRAINT "teaching_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_skills" ADD CONSTRAINT "learning_skills_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_skills" ADD CONSTRAINT "learning_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
