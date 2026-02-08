const router = require("express").Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// CREATE
router.post("/", auth, async (req, res) => {
  const task = new Task({ ...req.body, user: req.user });
  await task.save();
  res.json(task);
});

// READ
router.get("/", auth, async (req, res) => {
  const tasks = await Task.find({ user: req.user });
  res.json(tasks);
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user },
    req.body,
    { new: true }
  );
  res.json(task);
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, user: req.user });
  res.json("Deleted");
});

module.exports = router;
