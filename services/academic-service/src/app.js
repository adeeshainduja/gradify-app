const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");

const semesterRoutes = require("./routes/semester.routes");

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

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = app;
