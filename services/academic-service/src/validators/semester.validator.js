const { body, validationResult } = require("express-validator");

exports.createSemesterValidation = [
    body("name")
        .notEmpty()
        .withMessage("Semester name is required"),

    body("academicYear")
        .notEmpty()
        .withMessage("Academic year is required"),

    body("startDate")
        .notEmpty()
        .withMessage("Start date is required")
        .isISO8601()
        .withMessage("Start date must be a valid date"),

    body("endDate")
        .notEmpty()
        .withMessage("End date is required")
        .isISO8601()
        .withMessage("End date must be a valid date"),

    body("status")
        .notEmpty()
        .withMessage("Status is required")
        .isIn(["ACTIVE", "COMPLETED", "ARCHIVED"])
        .withMessage("Status must be ACTIVE, COMPLETED, or ARCHIVED"),
];

exports.updateSemesterValidation = [
    body("name")
        .optional()
        .notEmpty()
        .withMessage("Semester name cannot be empty"),

    body("academicYear")
        .optional()
        .notEmpty()
        .withMessage("Academic year cannot be empty"),

    body("startDate")
        .optional()
        .isISO8601()
        .withMessage("Start date must be a valid date"),

    body("endDate")
        .optional()
        .isISO8601()
        .withMessage("End date must be a valid date"),

    body("status")
        .optional()
        .isIn(["ACTIVE", "COMPLETED", "ARCHIVED"])
        .withMessage("Status must be ACTIVE, COMPLETED, or ARCHIVED"),
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
