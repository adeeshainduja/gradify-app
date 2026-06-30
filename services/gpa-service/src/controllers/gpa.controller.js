const service = require("../services/gpa.service");

exports.current = async (req, res) => {
    try {
        const data = await service.currentGPA(req.user.userId);
        res.json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.trend = async (req, res) => {
    try {
        const data = await service.trend(req.user.userId);
        res.json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
