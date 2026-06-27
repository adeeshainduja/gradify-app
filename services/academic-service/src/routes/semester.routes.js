const router = require("express").Router();

const controller = require("../controllers/semester.controller");
const auth       = require("../middleware/auth.middleware");

const {
    createSemesterValidation,
    updateSemesterValidation,
    validate
} = require("../validators/semester.validator");

// Create semester
router.post(
    "/semesters",
    auth,
    createSemesterValidation,
    validate,
    controller.createSemester
);

// Get all semesters
router.get(
    "/semesters",
    auth,
    controller.getAllSemesters
);

// Get single semester
router.get(
    "/semesters/:id",
    auth,
    controller.getSemester
);

// Update semester
router.put(
    "/semesters/:id",
    auth,
    updateSemesterValidation,
    validate,
    controller.updateSemester
);

// Delete semester
router.delete(
    "/semesters/:id",
    auth,
    controller.deleteSemester
);

module.exports = router;
