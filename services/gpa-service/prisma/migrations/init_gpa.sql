-- GpaRecord table for gpa-service
CREATE TABLE IF NOT EXISTS "GpaRecord" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "semesterName" TEXT NOT NULL,
    "sgpa" DOUBLE PRECISION NOT NULL,
    "cgpa" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GpaRecord_pkey" PRIMARY KEY ("id")
);
