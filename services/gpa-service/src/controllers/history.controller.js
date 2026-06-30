const historyService = require("../services/history.service");

exports.history = async (req, res) => {
  try {
    const studentId = Number(req.user.userId);
    const history = await historyService.getHistory(studentId);
    
    // Map to expected frontend response format
    const response = history.map(h => ({
      semesterName: h.semesterName,
      sgpa: h.sgpa,
      cgpa: h.cgpa
    }));

    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
