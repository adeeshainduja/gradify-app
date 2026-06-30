const prisma = require("../config/prisma");
const { gradePoints } = require("../utils/gpa.utils");
const academicClient = require("../utils/academic.client");

// Map subject grade string to GradeLetter enum and point value
const getGradeDetails = (gradeStr) => {
  if (!gradeStr) return null;
  
  // Normalize grades like A+, A-, B to A_PLUS, A_MINUS, B etc.
  const normalized = gradeStr.toUpperCase()
    .replace("+", "_PLUS")
    .replace("-", "_MINUS");

  const point = gradePoints[normalized];
  if (point === undefined) return null;

  return {
    letterGrade: normalized,
    gradePoint: point
  };
};

/**
 * Calculate SGPA and CGPA for a student in a semester
 */
exports.calculateGPA = async (studentId, semesterId, token) => {
  // Fetch all subjects for the student to ensure consistent data and avoid duplicating credits/names
  const allSubjects = await academicClient.getSemesterSubjects(undefined, token);

  const semesterSubjects = allSubjects.filter(s => s.semesterId === Number(semesterId));
  if (semesterSubjects.length === 0) {
    throw new Error("No subjects found for the specified semester.");
  }

  // Get semester name from the first subject or fallback
  const semesterName = semesterSubjects[0]?.semester?.name || `Semester ${semesterId}`;

  // 1. Calculate SGPA
  let sgpaCredits = 0;
  let sgpaPoints = 0;
  const gradedSemesterSubjects = [];

  for (const subject of semesterSubjects) {
    const gradeDetails = getGradeDetails(subject.currentGrade);
    if (gradeDetails) {
      sgpaCredits += subject.credits;
      sgpaPoints += subject.credits * gradeDetails.gradePoint;
      gradedSemesterSubjects.push({
        subjectId: subject.id,
        letterGrade: gradeDetails.letterGrade,
        gradePoint: gradeDetails.gradePoint
      });
    }
  }

  const sgpa = sgpaCredits > 0 ? Number((sgpaPoints / sgpaCredits).toFixed(2)) : 0.0;

  // 2. Save individual Grades to the GPA database (sync/cache for future analytics)
  for (const graded of gradedSemesterSubjects) {
    await prisma.grade.upsert({
      where: {
        studentId_subjectId: {
          studentId,
          subjectId: graded.subjectId
        }
      },
      update: {
        letterGrade: graded.letterGrade,
        gradePoint: graded.gradePoint,
        semesterId: Number(semesterId)
      },
      create: {
        studentId,
        semesterId: Number(semesterId),
        subjectId: graded.subjectId,
        letterGrade: graded.letterGrade,
        gradePoint: graded.gradePoint
      }
    });
  }

  // 3. Calculate CGPA dynamically across all semesters using all graded subjects
  let cgpaCredits = 0;
  let cgpaPoints = 0;

  // Since we also want to include any existing grade records from other semesters, we can fetch
  // all grades from the local db to make sure we don't miss semesters not returned by the current academic call,
  // but wait, fetching all subjects from academicClient is the source of truth for credits!
  // Let's match all graded subjects from Academic Service.
  for (const subject of allSubjects) {
    const gradeDetails = getGradeDetails(subject.currentGrade);
    if (gradeDetails) {
      cgpaCredits += subject.credits;
      cgpaPoints += subject.credits * gradeDetails.gradePoint;
    }
  }

  const cgpa = cgpaCredits > 0 ? Number((cgpaPoints / cgpaCredits).toFixed(2)) : 0.0;

  // 4. Store/Update GPARecord
  const gpaRecord = await prisma.gPARecord.upsert({
    where: {
      studentId_semesterId: {
        studentId,
        semesterId: Number(semesterId)
      }
    },
    update: {
      semesterName,
      totalCredits: sgpaCredits,
      totalPoints: sgpaPoints,
      sgpa,
      cgpa
    },
    create: {
      studentId,
      semesterId: Number(semesterId),
      semesterName,
      totalCredits: sgpaCredits,
      totalPoints: sgpaPoints,
      sgpa,
      cgpa
    }
  });

  return {
    sgpa,
    cgpa,
    totalCredits: sgpaCredits,
    totalPoints: sgpaPoints,
    semesterName
  };
};

/**
 * Get GPA history for a student
 */
exports.getGPAHistory = async (studentId) => {
  return await prisma.gPARecord.findMany({
    where: { studentId },
    orderBy: { semesterId: "asc" }
  });
};

/**
 * Predict required GPA to reach a target CGPA
 * Formula:
 * Target CGPA = (Current Points + Future Points) / (Current Credits + Future Credits)
 * Future Points = Target CGPA * (Current Credits + Future Credits) - Current Points
 * Required GPA = Future Points / Future Credits
 */
exports.predictGPA = async (studentId, targetCGPA, futureCredits) => {
  // Get all GPA records to calculate current total points and credits
  const records = await prisma.gPARecord.findMany({
    where: { studentId }
  });

  // Take current cumulative totals from the latest semester
  // Sort by semesterId descending to get the latest
  const sortedRecords = [...records].sort((a, b) => b.semesterId - a.semesterId);
  
  // Calculate total credits and points across all completed semesters
  let currentCredits = 0;
  let currentPoints = 0;

  if (sortedRecords.length > 0) {
    // We sum credits and points from all semesters
    for (const record of sortedRecords) {
      currentCredits += record.totalCredits;
      currentPoints += record.totalPoints;
    }
  }

  const totalCreditsAfterFuture = currentCredits + Number(futureCredits);
  if (totalCreditsAfterFuture === 0) {
    throw new Error("Total credits cannot be zero.");
  }

  const requiredPoints = (Number(targetCGPA) * totalCreditsAfterFuture) - currentPoints;
  const requiredGPA = requiredPoints / Number(futureCredits);

  return {
    currentCGPA: currentCredits > 0 ? Number((currentPoints / currentCredits).toFixed(2)) : 0.0,
    currentCredits,
    targetCGPA: Number(targetCGPA),
    futureCredits: Number(futureCredits),
    requiredGPA: requiredGPA > 4.0 ? 4.0 : requiredGPA < 0 ? 0.0 : Number(requiredGPA.toFixed(2)),
    feasible: requiredGPA <= 4.0 && requiredGPA >= 0.0
  };
};
