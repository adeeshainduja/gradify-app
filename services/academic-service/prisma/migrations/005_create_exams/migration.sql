-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('UPCOMING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('MID', 'FINAL', 'QUIZ', 'PRACTICAL', 'VIVA');

-- CreateTable
CREATE TABLE "Exam" (
    "id"            SERIAL NOT NULL,
    "title"         TEXT NOT NULL,
    "examType"      "ExamType"   NOT NULL DEFAULT 'FINAL',
    "examDate"      TIMESTAMP(3) NOT NULL,
    "startTime"     TEXT NOT NULL DEFAULT '09:00',
    "duration"      INTEGER NOT NULL DEFAULT 120,
    "venue"         TEXT,
    "totalMarks"    DOUBLE PRECISION NOT NULL DEFAULT 100,
    "obtainedMarks" DOUBLE PRECISION,
    "grade"         TEXT,
    "feedback"      TEXT,
    "notes"         TEXT,
    "weight"        DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status"        "ExamStatus" NOT NULL DEFAULT 'UPCOMING',
    "subjectId"     INTEGER NOT NULL,
    "userId"        INTEGER NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_subjectId_fkey"
    FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AutoUpdate updatedAt trigger
CREATE TRIGGER update_exam_updated_at
BEFORE UPDATE ON "Exam"
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
