
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Task = require("../models/task");

// Validate MongoDB ID
function validateTaskId(req, res, next) {

    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid task ID"
        });
    }

    next();
}


// ===================================
// 1. GET ALL TASKS
// GET /api/tasks
// ===================================

router.get("/", async (req, res, next) => {

    try {

        const tasks = await Task.find().sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });

    } catch (error) {
        next(error);
    }

});


// ===================================
// 2. CREATE TASK
// POST /api/tasks
// ===================================

router.post("/", async (req, res, next) => {

    try {

        const { title, description } = req.body;

        // Validate title
        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Task title is required"
            });
        }

        if (title.trim().length > 150) {
            return res.status(400).json({
                success: false,
                message: "Title cannot exceed 150 characters"
            });
        }

        // Validate description
        if (
            description !== undefined &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Description must be text"
            });
        }

        if (description && description.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Description cannot exceed 1000 characters"
            });
        }

        const task = await Task.create({
            title: title.trim(),
            description: description?.trim() || ""
        });

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task
        });

    } catch (error) {
        next(error);
    }

});


// ===================================
// 3. UPDATE TASK
// PUT /api/tasks/:id
// ===================================

router.put("/:id", validateTaskId, async (req, res, next) => {

    try {

        const { title, description, completed } = req.body;

        const updates = {};

        if (title !== undefined) {

            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Title cannot be empty"
                });
            }

            if (title.trim().length > 150) {
                return res.status(400).json({
                    success: false,
                    message: "Title cannot exceed 150 characters"
                });
            }

            updates.title = title.trim();
        }

        if (description !== undefined) {

            if (typeof description !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Description must be text"
                });
            }

            if (description.trim().length > 1000) {
                return res.status(400).json({
                    success: false,
                    message: "Description cannot exceed 1000 characters"
                });
            }

            updates.description = description.trim();
        }

        if (completed !== undefined) {

            if (typeof completed !== "boolean") {
                return res.status(400).json({
                    success: false,
                    message: "Completed must be true or false"
                });
            }

            updates.completed = completed;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided"
            });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: task
        });

    } catch (error) {
        next(error);
    }

});


// ===================================
// 4. DELETE TASK
// DELETE /api/tasks/:id
// ===================================

router.delete("/:id", validateTaskId, async (req, res, next) => {

    try {

        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Task deleted successfully",
            data: task
        });

    } catch (error) {
        next(error);
    }

});


module.exports = router;
