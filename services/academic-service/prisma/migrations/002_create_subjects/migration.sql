-- CreateEnum
CREATE TYPE "SubjectStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DROPPED');

-- CreateTable
CREATE TABLE IF NOT EXISTS "Subject" (
    "id"           SERIAL          NOT NULL,
    "code"         TEXT            NOT NULL,
    "name"         TEXT            NOT NULL,
    "credits"      INTEGER         NOT NULL,
    "lecturer"     TEXT,
    "description"  TEXT,
    "currentGrade" TEXT,
    "progress"     INTEGER         NOT NULL DEFAULT 0,
    "status"       "SubjectStatus" NOT NULL,
    "semesterId"   INTEGER         NOT NULL,
    "userId"       INTEGER         NOT NULL,
    "createdAt"    TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Subject"
    ADD CONSTRAINT "Subject_semesterId_fkey"
    FOREIGN KEY ("semesterId")
    REFERENCES "Semester"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
