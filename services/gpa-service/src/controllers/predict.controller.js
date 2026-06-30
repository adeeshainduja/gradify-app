const service = require("../services/predict.service");

exports.predict = (req, res) => {
  try {
    const { midAssignments, final } = req.body;

    if (!Array.isArray(midAssignments) || final === undefined) {
      return res.status(400).json({ message: "midAssignments array and final score are required." });
    }

    if (midAssignments.length === 0) {
      return res.status(400).json({ message: "At least one mid assignment is required." });
    }

    const result = service.predictGPA(midAssignments, final);

    return res.json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
