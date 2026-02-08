const router = require("express").Router();
const Task = require("../models/Task");
const auth = require("../middlewares/auth");

// Create new task
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const task = new Task({ 
      title,
      description,
      status: status || "Pending",
      user: req.user 
    });
    
    await task.save();
    
    console.log(`✅ Task created: ${title}`);
    res.status(201).json(task);
    
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ message: "Error creating task" });
  }
});

// Get all tasks for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user })
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json(tasks);
    
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// Get single task by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.user 
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
    
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({ message: "Error fetching task" });
  }
});

// Update task
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { title, description, status },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    console.log(`✅ Task updated: ${task.title}`);
    res.json(task);
    
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ message: "Error updating task" });
  }
});

// Delete task
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user 
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    console.log(`✅ Task deleted: ${task.title}`);
    res.json({ message: "Task deleted successfully" });
    
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ message: "Error deleting task" });
  }
});

module.exports = router;