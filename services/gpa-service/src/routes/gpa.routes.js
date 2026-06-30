const router = require("express").Router();
const controller = require("../controllers/gpa.controller");
const auth = require("../middleware/auth.middleware");

// Calculate SGPA & CGPA for a semester
router.post("/calculate", auth, controller.calculateGPA);

// Get GPA history
router.get("/history", auth, controller.getGPAHistory);

// Predict future GPA
router.post("/predict", auth, controller.predictGPA);

module.exports = router;
