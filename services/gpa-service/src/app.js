const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const gpaRoutes = require("./routes/gpa.routes");
const historyRoutes = require("./routes/history.routes");
const predictRoutes = require("./routes/predict.routes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({
    service: "GPA Service",
    status: "Running"
  });
});

app.use("/api/gpa", gpaRoutes);
app.use("/api/gpa", historyRoutes);
app.use("/api/gpa", predictRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
