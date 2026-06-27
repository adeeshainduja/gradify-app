-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'SUBMITTED', 'GRADED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "AssignmentPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "Assignment" (
    "id"          SERIAL NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "dueDate"     TIMESTAMP(3) NOT NULL,
    "priority"    "AssignmentPriority" NOT NULL DEFAULT 'MEDIUM',
    "status"      "AssignmentStatus"   NOT NULL DEFAULT 'PENDING',
    "progress"    INTEGER NOT NULL DEFAULT 0,
    "marks"       DOUBLE PRECISION,
    "maxMarks"    DOUBLE PRECISION NOT NULL DEFAULT 100,
    "weight"      DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isGroup"     BOOLEAN NOT NULL DEFAULT false,
    "subjectId"   INTEGER NOT NULL,
    "userId"      INTEGER NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_subjectId_fkey"
    FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AutoUpdate updatedAt trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assignment_updated_at
BEFORE UPDATE ON "Assignment"
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
