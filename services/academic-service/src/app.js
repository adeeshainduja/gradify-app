const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");

const semesterRoutes  = require("./routes/semester.routes");
const subjectRoutes   = require("./routes/subject.routes");
const assignmentRoutes = require("./routes/assignment.routes");
const examRoutes      = require("./routes/exam.routes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Health check
app.get("/health", (req, res) => {
    res.json({
        service: "Academic Service",
        status:  "Running",
        time:    new Date().toISOString()
    });
});

// Semester routes
app.use("/api/academic", semesterRoutes);

// Subject routes
app.use("/api/academic", subjectRoutes);

// Assignment routes
app.use("/api/academic", assignmentRoutes);

// Exam routes
app.use("/api/academic", examRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = app;
