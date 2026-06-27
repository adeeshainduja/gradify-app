const { body, validationResult } = require("express-validator");

exports.createExamValidation = [
    body("title")
        .notEmpty()
        .withMessage("Exam title is required"),

    body("subjectId")
        .isInt({ min: 1 })
        .withMessage("A valid subjectId (integer) is required"),

    body("examDate")
        .notEmpty()
        .withMessage("Exam date is required")
        .isISO8601()
        .withMessage("examDate must be a valid ISO date (e.g. 2026-09-12)"),

    body("examType")
        .notEmpty()
        .withMessage("Exam type is required")
        .isIn(["MID", "FINAL", "QUIZ", "PRACTICAL", "VIVA"])
        .withMessage("examType must be MID, FINAL, QUIZ, PRACTICAL, or VIVA"),

    body("totalMarks")
        .notEmpty()
        .withMessage("Total marks are required")
        .isFloat({ min: 1 })
        .withMessage("totalMarks must be a positive number"),

    body("status")
        .optional()
        .isIn(["UPCOMING", "COMPLETED", "CANCELLED"])
        .withMessage("status must be UPCOMING, COMPLETED, or CANCELLED"),

    body("startTime")
        .optional()
        .isString()
        .withMessage("startTime must be a string (e.g. '09:00')"),

    body("duration")
        .optional()
        .isInt({ min: 1 })
        .withMessage("duration must be a positive integer (minutes)"),

    body("weight")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("weight must be between 0 and 100"),

    body("obtainedMarks")
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage("obtainedMarks must be a non-negative number"),

    body("grade")
        .optional({ nullable: true })
        .isString(),

    body("feedback")
        .optional({ nullable: true })
        .isString(),

    body("notes")
        .optional({ nullable: true })
        .isString(),

    body("venue")
        .optional({ nullable: true })
        .isString(),
];

exports.updateExamValidation = [
    body("title")
        .optional()
        .notEmpty()
        .withMessage("Title cannot be empty"),

    body("subjectId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("subjectId must be a valid integer"),

    body("examDate")
        .optional()
        .isISO8601()
        .withMessage("examDate must be a valid ISO date"),

    body("examType")
        .optional()
        .isIn(["MID", "FINAL", "QUIZ", "PRACTICAL", "VIVA"])
        .withMessage("examType must be MID, FINAL, QUIZ, PRACTICAL, or VIVA"),

    body("totalMarks")
        .optional()
        .isFloat({ min: 1 })
        .withMessage("totalMarks must be a positive number"),

    body("status")
        .optional()
        .isIn(["UPCOMING", "COMPLETED", "CANCELLED"])
        .withMessage("status must be UPCOMING, COMPLETED, or CANCELLED"),

    body("startTime")
        .optional()
        .isString(),

    body("duration")
        .optional()
        .isInt({ min: 1 }),

    body("weight")
        .optional()
        .isFloat({ min: 0, max: 100 }),

    body("obtainedMarks")
        .optional({ nullable: true })
        .isFloat({ min: 0 }),

    body("grade").optional({ nullable: true }).isString(),
    body("feedback").optional({ nullable: true }).isString(),
    body("notes").optional({ nullable: true }).isString(),
    body("venue").optional({ nullable: true }).isString(),
];

exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Validation failed for exam:", req.body, errors.array());
        return res.status(422).json({
            message: "Validation failed",
            errors: errors.array()
        });
    }
    next();
};
