const { body, validationResult } = require("express-validator");

exports.createSubjectValidation = [
    body("code")
        .notEmpty()
        .withMessage("Subject code is required"),

    body("name")
        .notEmpty()
        .withMessage("Subject name is required"),

    body("credits")
        .isInt({ min: 1 })
        .withMessage("Credits must be a positive integer"),

    body("semesterId")
        .notEmpty()
        .withMessage("A valid semesterId is required"),

    body("status")
        .optional()
        .isIn(["ACTIVE", "COMPLETED", "DROPPED"])
        .withMessage("Status must be ACTIVE, COMPLETED, or DROPPED"),

    body("progress")
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage("Progress must be between 0 and 100"),

    body("color")
        .optional()
        .isString(),

    body("room")
        .optional()
        .isString(),

    body("schedule")
        .optional()
        .isString(),

    body("targetGrade")
        .optional()
        .isString(),

    body("professorEmail")
        .optional()
        .isString(),

    body("professorName")
        .optional()
        .isString(),
];

exports.updateSubjectValidation = [
    body("code")
        .optional()
        .notEmpty()
        .withMessage("Subject code cannot be empty"),

    body("name")
        .optional()
        .notEmpty()
        .withMessage("Subject name cannot be empty"),

    body("credits")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Credits must be a positive integer"),

    body("semesterId")
        .optional()
        .notEmpty()
        .withMessage("A valid semesterId is required"),

    body("status")
        .optional()
        .isIn(["ACTIVE", "COMPLETED", "DROPPED"])
        .withMessage("Status must be ACTIVE, COMPLETED, or DROPPED"),

    body("progress")
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage("Progress must be between 0 and 100"),

    body("color")
        .optional()
        .isString(),

    body("room")
        .optional()
        .isString(),

    body("schedule")
        .optional()
        .isString(),

    body("targetGrade")
        .optional()
        .isString(),

    body("professorEmail")
        .optional()
        .isString(),

    body("professorName")
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
