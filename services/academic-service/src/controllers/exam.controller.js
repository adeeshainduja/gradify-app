const service = require("../services/exam.service");

/**
 * POST /api/academic/exams
 */
exports.createExam = async (req, res) => {
    try {
        const exam = await service.createExam(req.body, req.user.userId);
        return res.status(201).json(exam);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * GET /api/academic/exams
 * Supports optional ?subjectId=1 and ?status=UPCOMING filters.
 */
exports.getExams = async (req, res) => {
    try {
        const filters = {
            subjectId: req.query.subjectId,
            status:    req.query.status
        };
        const exams = await service.getExams(req.user.userId, filters);
        return res.json(exams);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/academic/exams/:id
 */
exports.getExam = async (req, res) => {
    try {
        const exam = await service.getExamById(req.params.id, req.user.userId);
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }
        return res.json(exam);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * PUT /api/academic/exams/:id
 */
exports.updateExam = async (req, res) => {
    try {
        const exam = await service.updateExam(
            req.params.id,
            req.body,
            req.user.userId
        );
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }
        return res.json(exam);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * DELETE /api/academic/exams/:id
 */
exports.deleteExam = async (req, res) => {
    try {
        const result = await service.deleteExam(req.params.id, req.user.userId);
        if (!result) {
            return res.status(404).json({ message: "Exam not found" });
        }
        return res.json({ message: "Exam deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
