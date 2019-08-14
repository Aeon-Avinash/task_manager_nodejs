const mongoose = require("mongoose");

const taskSchemaObj = {
  description: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  }
};

const taskSchemaFields = Object.keys(taskSchemaObj);

const taskSchema = new mongoose.Schema(taskSchemaObj, {
  timestamps: true
});

const Task = mongoose.model(`Task`, taskSchema);

module.exports = { Task, taskSchemaFields };
