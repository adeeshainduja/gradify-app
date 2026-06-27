const router = require("express").Router();

const controller = require("../controllers/subject.controller");
const auth       = require("../middleware/auth.middleware");

const {
    createSubjectValidation,
    updateSubjectValidation,
    validate
} = require("../validators/subject.validator");

// Create subject
router.post(
    "/subjects",
    auth,
    createSubjectValidation,
    validate,
    controller.createSubject
);

// Get all subjects (supports ?semesterId= filter)
router.get(
    "/subjects",
    auth,
    controller.getSubjects
);

// Get single subject
router.get(
    "/subjects/:id",
    auth,
    controller.getSubject
);

// Update subject
router.put(
    "/subjects/:id",
    auth,
    updateSubjectValidation,
    validate,
    controller.updateSubject
);

// Delete subject
router.delete(
    "/subjects/:id",
    auth,
    controller.deleteSubject
);

module.exports = router;
