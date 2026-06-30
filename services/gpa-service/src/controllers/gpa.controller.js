const service = require("../services/gpa.service");

/**
 * POST /api/gpa/calculate
 */
exports.calculateGPA = async (req, res) => {
  try {
    const studentId = Number(req.user?.userId || req.body.studentId);
    const semesterId = Number(req.body.semesterId);

    if (!studentId || !semesterId) {
      return res.status(400).json({ message: "studentId and semesterId are required." });
    }

    // Pass the user's authorization token to fetch data from Academic Service
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(" ")[1] : null;

    const result = await service.calculateGPA(studentId, semesterId, token);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

/**
 * GET /api/gpa/history
 */
exports.getGPAHistory = async (req, res) => {
  try {
    const studentId = Number(req.user?.userId || req.query.studentId);
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required." });
    }

    const history = await service.getGPAHistory(studentId);
    
    // Map database fields to the exact response format expected by client
    const response = history.map(h => ({
      semester: h.semesterName,
      sgpa: h.sgpa,
      cgpa: h.cgpa,
      totalCredits: h.totalCredits,
      totalPoints: h.totalPoints,
      semesterId: h.semesterId
    }));

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/gpa/predict
 */
exports.predictGPA = async (req, res) => {
  try {
    const studentId = Number(req.user?.userId || req.body.studentId);
    const { targetGPA, futureCredits } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required." });
    }
    if (targetGPA === undefined || futureCredits === undefined) {
      return res.status(400).json({ message: "targetGPA and futureCredits are required." });
    }

    const prediction = await service.predictGPA(studentId, targetGPA, futureCredits);
    return res.status(200).json(prediction);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
