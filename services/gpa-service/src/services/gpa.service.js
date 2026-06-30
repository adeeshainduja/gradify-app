const prisma = require("../config/prisma");

const FALLBACK = {
  sgpa: 0,
  cgpa: 0,
};

exports.currentGPA = async (studentId) => {
  try {
    const latest = await prisma.gPARecord.findFirst({
      where: { studentId },
      orderBy: { semesterId: "desc" },
    });

    if (latest) {
      return {
        sgpa: latest.sgpa,
        cgpa: latest.cgpa,
      };
    }

    return FALLBACK;
  } catch {
    return FALLBACK;
  }
};

exports.trend = async (studentId) => {
  try {
    const records = await prisma.gPARecord.findMany({
      where: { studentId },
      select: { semesterName: true, sgpa: true, cgpa: true },
      orderBy: { semesterId: "asc" },
    });

    return records.map((r) => ({
      semesterName: r.semesterName,
      sgpa: r.sgpa,
      cgpa: r.cgpa,
    }));
  } catch {
    return [];
  }
};
