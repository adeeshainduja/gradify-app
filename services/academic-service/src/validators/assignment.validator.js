const { body, validationResult } = require("express-validator");

/**
 * Validation for creating an assignment.
 * Priority & status enums match DB: LOW/MEDIUM/HIGH and PENDING/SUBMITTED/GRADED/OVERDUE
 */
exports.createAssignmentValidation = [
    body("title")
        .notEmpty()
        .withMessage("Assignment title is required"),

    body("subjectId")
        .isInt({ min: 1 })
        .withMessage("A valid subjectId (integer) is required"),

    body("dueDate")
        .notEmpty()
        .withMessage("Due date is required")
        .isISO8601()
        .withMessage("Due date must be a valid ISO date (e.g. 2026-08-20)"),

    body("priority")
        .notEmpty()
        .withMessage("Priority is required")
        .isIn(["LOW", "MEDIUM", "HIGH"])
        .withMessage("Priority must be LOW, MEDIUM, or HIGH"),

    body("status")
        .optional()
        .isIn(["PENDING", "SUBMITTED", "GRADED", "OVERDUE"])
        .withMessage("Status must be PENDING, SUBMITTED, GRADED, or OVERDUE"),

    body("progress")
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage("Progress must be between 0 and 100"),

    body("marks")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Marks must be a non-negative number"),

    body("maxMarks")
        .optional()
        .isFloat({ min: 1 })
        .withMessage("Max marks must be at least 1"),

    body("weight")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("Weight must be between 0 and 100"),

    body("isGroup")
        .optional()
        .isBoolean()
        .withMessage("isGroup must be a boolean"),

    body("description")
        .optional()
        .isString(),
];

exports.updateAssignmentValidation = [
    body("title")
        .optional()
        .notEmpty()
        .withMessage("Title cannot be empty"),

    body("subjectId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("subjectId must be a valid integer"),

    body("dueDate")
        .optional()
        .isISO8601()
        .withMessage("Due date must be a valid ISO date"),

    body("priority")
        .optional()
        .isIn(["LOW", "MEDIUM", "HIGH"])
        .withMessage("Priority must be LOW, MEDIUM, or HIGH"),

    body("status")
        .optional()
        .isIn(["PENDING", "SUBMITTED", "GRADED", "OVERDUE"])
        .withMessage("Status must be PENDING, SUBMITTED, GRADED, or OVERDUE"),

    body("progress")
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage("Progress must be between 0 and 100"),

    body("marks")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Marks must be a non-negative number"),

    body("maxMarks")
        .optional()
        .isFloat({ min: 1 })
        .withMessage("Max marks must be at least 1"),

    body("weight")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("Weight must be between 0 and 100"),

    body("isGroup")
        .optional()
        .isBoolean()
        .withMessage("isGroup must be a boolean"),

    body("description")
        .optional()
        .isString(),
];

exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: "Validation failed",
            errors: errors.array()
        });
    }
    next();
};
