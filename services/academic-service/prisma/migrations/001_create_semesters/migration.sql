-- CreateEnum
CREATE TYPE "SemesterStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateTable
CREATE TABLE IF NOT EXISTS "Semester" (
    "id"           SERIAL       NOT NULL,
    "name"         TEXT         NOT NULL,
    "academicYear" TEXT         NOT NULL,
    "startDate"    TIMESTAMP(3) NOT NULL,
    "endDate"      TIMESTAMP(3) NOT NULL,
    "status"       "SemesterStatus" NOT NULL,
    "userId"       INTEGER      NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);
