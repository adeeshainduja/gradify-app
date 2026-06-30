const prisma = require("../config/prisma");

const FALLBACK_STATS = {
  totalSubjects: 0,
  pendingAssignments: 0,
  upcomingExams: 0,
};

const FALLBACK_ASSIGNMENTS = {
  total: 0,
  completed: 0,
  percentage: 0,
};

const FALLBACK_SUBJECTS = [];

exports.getDashboardStats = async (userId) => {
  try {
    const totalSubjects = await prisma.subject.count({
      where: { userId },
    });

    const pendingAssignments = await prisma.assignment.count({
      where: {
        userId,
        status: "PENDING",
      },
    });

    const upcomingExams = await prisma.exam.count({
      where: {
        userId,
        status: "UPCOMING",
      },
    });

    return {
      totalSubjects,
      pendingAssignments,
      upcomingExams,
    };
  } catch {
    return FALLBACK_STATS;
  }
};

exports.assignmentAnalytics = async (userId) => {
  try {
    const total = await prisma.assignment.count({
      where: { userId },
    });

    const completed = await prisma.assignment.count({
      where: {
        userId,
        status: "GRADED",
      },
    });

    const percentage = total === 0 ? 0 : ((completed / total) * 100).toFixed(1);

    return {
      total,
      completed,
      percentage: Number(percentage),
    };
  } catch {
    return FALLBACK_ASSIGNMENTS;
  }
};

exports.subjectPerformance = async (userId) => {
  try {
    return await prisma.subject.findMany({
      where: { userId },
      select: {
        name: true,
        credits: true,
        currentGrade: true,
        progress: true,
      },
    });
  } catch {
    return FALLBACK_SUBJECTS;
  }
};
