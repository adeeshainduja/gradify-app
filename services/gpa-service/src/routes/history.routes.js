const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/history.controller");

router.get("/history", auth, controller.history);

module.exports = router;
