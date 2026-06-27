const semesterService = require("../services/semester.service");

/**
 * POST /api/academic/semesters
 * Create a new semester
 */
exports.createSemester = async (req, res) => {
    try {
        const semester = await semesterService.createSemester(
            req.body,
            req.user.userId
        );
        return res.status(201).json(semester);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * GET /api/academic/semesters
 * Get all semesters for the logged-in user
 */
exports.getAllSemesters = async (req, res) => {
    try {
        const semesters = await semesterService.getAllSemesters(req.user.userId);
        return res.json(semesters);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/academic/semesters/:id
 * Get a single semester by ID
 */
exports.getSemester = async (req, res) => {
    try {
        const semester = await semesterService.getSemesterById(
            req.params.id,
            req.user.userId
        );

        if (!semester) {
            return res.status(404).json({ message: "Semester not found" });
        }

        return res.json(semester);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * PUT /api/academic/semesters/:id
 * Update a semester
 */
exports.updateSemester = async (req, res) => {
    try {
        const semester = await semesterService.updateSemester(
            req.params.id,
            req.body,
            req.user.userId
        );

        if (!semester) {
            return res.status(404).json({ message: "Semester not found" });
        }

        return res.json(semester);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * DELETE /api/academic/semesters/:id
 * Delete a semester
 */
exports.deleteSemester = async (req, res) => {
    try {
        const result = await semesterService.deleteSemester(
            req.params.id,
            req.user.userId
        );

        if (!result) {
            return res.status(404).json({ message: "Semester not found" });
        }

        return res.json({ message: "Semester deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
