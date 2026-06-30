const router = require("express").Router();

const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/analytics.controller");

router.get("/analytics/dashboard", auth, controller.dashboard);
router.get("/analytics/assignments", auth, controller.assignments);
router.get("/analytics/subjects", auth, controller.subjects);

module.exports = router;
