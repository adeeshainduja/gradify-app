const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/predict.controller");

router.post("/predict", auth, controller.predict);

module.exports = router;
