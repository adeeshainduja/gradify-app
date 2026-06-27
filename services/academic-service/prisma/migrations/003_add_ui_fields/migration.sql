-- AlterTable
ALTER TABLE "Subject"
    ADD COLUMN "professorEmail" TEXT,
    ADD COLUMN "color" TEXT NOT NULL DEFAULT 'blue',
    ADD COLUMN "room" TEXT,
    ADD COLUMN "schedule" TEXT,
    ADD COLUMN "targetGrade" TEXT NOT NULL DEFAULT 'A';
