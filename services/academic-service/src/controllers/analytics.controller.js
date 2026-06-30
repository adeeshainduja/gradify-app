const service = require("../services/analytics.service");

exports.dashboard = async (req, res) => {
    try {
        const data = await service.getDashboardStats(req.user.userId);
        res.json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.assignments = async (req, res) => {
    try {
        const data = await service.assignmentAnalytics(req.user.userId);
        res.json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.subjects = async (req, res) => {
    try {
        const data = await service.subjectPerformance(req.user.userId);
        res.json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
