const prisma = require("../config/prisma");

exports.getHistory = async (studentId) => {
  return await prisma.gPARecord.findMany({
    where: {
      studentId
    },
    orderBy: {
      semesterId: "asc"
    }
  });
};
