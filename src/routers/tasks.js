const express = require("express");
const { Task, taskSchemaFields } = require("../models/task");
const auth = require("../middleware/auth");

const router = new express.Router();

//* GET /tasks?completed=true  - filtering
//* GET /tasks?limit=1&skip=0  - pagination
//* GET /tasks?sortBy=createdAt:desc  - sorting
router.get("/", auth, async (req, res) => {
  try {
    const match = {},
      options = {};
    if ("completed" in req.query) {
      match.completed = req.query.completed === "true" ? true : false;
    }
    if ("limit" in req.query) {
      options.limit = parseInt(req.query.limit);
    }
    if ("skip" in req.query) {
      options.skip = parseInt(req.query.skip);
    }
    if ("sortBy" in req.query) {
      const [sort, order] = req.query.sortBy.split(/[:_!@#$%^&*-]/);
      if (sort && order) {
        options.sort = {};
        switch (sort) {
          case "createdAt":
            options.sort.createdAt = order === "desc" ? -1 : 1;
            break;
          case "updatedAt":
            options.sort.updatedAt = order === "desc" ? -1 : 1;
          case "completed":
            options.sort.completed = order === "desc" ? -1 : 1;
          default:
            break;
        }
      }
    }
    // const tasks = await Task.find({ owner: req.user._id });
    await req.user
      .populate({
        path: "tasks",
        match,
        options
      })
      .execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

router.post("/", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    const newTask = await task.save();
    return res.status(201).send(newTask);
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!task) {
      return res.status(404).send();
    }
    return res.status(200).send(task);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update =>
    taskSchemaFields.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send("invalid update entries!");
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!task) {
      return res.status(404).send();
    }

    updates.forEach(update => (task[update] = req.body[update]));
    await task.save();
    return res.status(200).send(task);
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!task) {
      return res.status(404).send();
    }
    await task.remove();
    return res.status(200).send(task);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = router;
