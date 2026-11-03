
const mongoose = require("mongoose");

// Define the structure of a task
const taskSchema = new mongoose.Schema({

    title: {
        type: String,
        required: [true, "Task title is required"],
        trim: true,
        maxlength: 150
    },

    description: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ""
    },

    completed: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

// Create and export Task model
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
