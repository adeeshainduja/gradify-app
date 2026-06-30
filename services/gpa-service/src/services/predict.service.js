exports.predictGPA = (midAssignments, final) => {
  // Calculate weighted average: Mid 30%, Final 70%
  // Mid is calculated from average of all mid assignments
  let midAverage = 0;
  if (midAssignments && midAssignments.length > 0) {
    const total = midAssignments.reduce((sum, a) => sum + Number(a.score || 0), 0);
    midAverage = total / midAssignments.length;
  }

  const average = (
    midAverage * 0.30 +
    Number(final) * 0.70
  );

  let grade = "F";
  let point = 0;

  if (average >= 85) {
    grade = "A";
    point = 4.0;
  } else if (average >= 80) {
    grade = "A-";
    point = 3.7;
  } else if (average >= 75) {
    grade = "B+";
    point = 3.3;
  } else if (average >= 70) {
    grade = "B";
    point = 3.0;
  } else if (average >= 65) {
    grade = "B-";
    point = 2.7;
  } else if (average >= 60) {
    grade = "C+";
    point = 2.3;
  } else {
    grade = "F";
    point = 0.0;
  }

  return {
    average: Number(average.toFixed(1)),
    expectedGrade: grade,
    expectedGPA: point,
    confidence: 92,
    outlook: point >= 3.7 ? "Excellent" : point >= 3.0 ? "Good" : "Needs Improvement"
  };
};
