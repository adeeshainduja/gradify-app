const service = require("../services/assignment.service");

/**
 * POST /api/academic/assignments
 * Create a new assignment for the authenticated user's subject.
 */
exports.createAssignment = async (req, res) => {
    try {
        const assignment = await service.createAssignment(req.body, req.user.userId);
        return res.status(201).json(assignment);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * GET /api/academic/assignments
 * Get all assignments for this user.
 * Supports optional query params: ?subjectId=1 and ?status=PENDING
 */
exports.getAssignments = async (req, res) => {
    try {
        const filters = {
            subjectId: req.query.subjectId,
            status:    req.query.status
        };
        const assignments = await service.getAssignments(req.user.userId, filters);
        return res.json(assignments);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/academic/assignments/:id
 * Get a single assignment by ID.
 */
exports.getAssignment = async (req, res) => {
    try {
        const assignment = await service.getAssignmentById(req.params.id, req.user.userId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        return res.json(assignment);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * PUT /api/academic/assignments/:id
 * Partially update an assignment.
 */
exports.updateAssignment = async (req, res) => {
    try {
        const assignment = await service.updateAssignment(
            req.params.id,
            req.body,
            req.user.userId
        );
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        return res.json(assignment);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * DELETE /api/academic/assignments/:id
 * Delete an assignment.
 */
exports.deleteAssignment = async (req, res) => {
    try {
        const result = await service.deleteAssignment(req.params.id, req.user.userId);
        if (!result) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        return res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
