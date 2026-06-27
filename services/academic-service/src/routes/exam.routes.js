const router = require("express").Router();

const controller = require("../controllers/exam.controller");
const auth       = require("../middleware/auth.middleware");
const {
    createExamValidation,
    updateExamValidation,
    validate
} = require("../validators/exam.validator");

// Create exam
router.post(
    "/exams",
    auth,
    createExamValidation,
    validate,
    controller.createExam
);

// Get all exams (supports ?subjectId=&status= filters)
router.get(
    "/exams",
    auth,
    controller.getExams
);

// Get single exam
router.get(
    "/exams/:id",
    auth,
    controller.getExam
);

// Update exam (schedule change or store results)
router.put(
    "/exams/:id",
    auth,
    updateExamValidation,
    validate,
    controller.updateExam
);

// Delete exam
router.delete(
    "/exams/:id",
    auth,
    controller.deleteExam
);

module.exports = router;
