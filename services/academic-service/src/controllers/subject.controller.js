const service = require("../services/subject.service");

/**
 * POST /api/academic/subjects
 */
exports.createSubject = async (req, res) => {
    try {
        const subject = await service.createSubject(req.body, req.user.userId);
        return res.status(201).json(subject);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * GET /api/academic/subjects
 * Optional query: ?semesterId=1
 */
exports.getSubjects = async (req, res) => {
    try {
        const subjects = await service.getSubjects(
            req.user.userId,
            req.query.semesterId
        );
        return res.json(subjects);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/academic/subjects/:id
 */
exports.getSubject = async (req, res) => {
    try {
        const subject = await service.getSubjectById(
            req.params.id,
            req.user.userId
        );
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        return res.json(subject);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * PUT /api/academic/subjects/:id
 */
exports.updateSubject = async (req, res) => {
    try {
        const subject = await service.updateSubject(
            req.params.id,
            req.body,
            req.user.userId
        );
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        return res.json(subject);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * DELETE /api/academic/subjects/:id
 */
exports.deleteSubject = async (req, res) => {
    try {
        const result = await service.deleteSubject(
            req.params.id,
            req.user.userId
        );
        if (!result) {
            return res.status(404).json({ message: "Subject not found" });
        }
        return res.json({ message: "Subject deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
