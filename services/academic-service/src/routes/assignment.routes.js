const router = require("express").Router();

const controller = require("../controllers/assignment.controller");
const auth       = require("../middleware/auth.middleware");

const {
    createAssignmentValidation,
    updateAssignmentValidation,
    validate
} = require("../validators/assignment.validator");

// Create assignment
router.post(
    "/assignments",
    auth,
    createAssignmentValidation,
    validate,
    controller.createAssignment
);

// Get all assignments (supports ?subjectId=&status= filters)
router.get(
    "/assignments",
    auth,
    controller.getAssignments
);

// Get single assignment
router.get(
    "/assignments/:id",
    auth,
    controller.getAssignment
);

// Update assignment
router.put(
    "/assignments/:id",
    auth,
    updateAssignmentValidation,
    validate,
    controller.updateAssignment
);

// Delete assignment
router.delete(
    "/assignments/:id",
    auth,
    controller.deleteAssignment
);

module.exports = router;
