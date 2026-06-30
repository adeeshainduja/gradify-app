const router = require("express").Router();
const controller = require("../controllers/gpa.controller");
const auth = require("../middleware/auth.middleware");

// Get current GPA
router.get("/current", auth, controller.current);

// Get GPA trend
router.get("/trend", auth, controller.trend);

// Calculate SGPA & CGPA for a semester
router.post("/calculate", auth, controller.calculateGPA);

module.exports = router;
