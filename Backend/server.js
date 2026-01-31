const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const taskRoutes = require("./routes/taskRoutes");

const app = express();

// Allow all origins for now - we'll restrict later
app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Task Manager Backend is running", apiDocs: "/health or /api/tasks" });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Backend is working", time: new Date() });
});

// MongoDB Connection with fallback
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/taskmanager";
console.log("Attempting to connect to MongoDB...");

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Database connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Make sure MONGO_URI environment variable is set!");
  });

app.use("/api/tasks", taskRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
