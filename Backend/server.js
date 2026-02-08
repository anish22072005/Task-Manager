const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());

/* ---------- ROUTES ---------- */
app.get("/", (req, res) => {
  res.json({
    message: "Task Manager Backend is running",
    routes: ["/api/auth", "/api/tasks", "/health"]
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", time: new Date() });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

/* ---------- DB ---------- */
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/taskmanager";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB error:", err.message);
  });

/* ---------- ERROR HANDLER ---------- */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

/* ---------- START SERVER (LAST LINE) ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
