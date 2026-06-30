const router = require("express").Router();

const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/gpa.controller");

router.get("/gpa/current", auth, controller.current);
router.get("/gpa/trend", auth, controller.trend);

module.exports = router;
