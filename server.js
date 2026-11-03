
const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const path = require("path");

require("dotenv").config();

const app = express();


// ===================================
// 1. MIDDLEWARE
// ===================================

app.use(cors());

app.use(express.json({ limit: "10kb" }));


// ===================================
// 2. SERVE FRONTEND
// ===================================

app.use(express.static(
    path.join(__dirname, "public")
));


// ===================================
// 3. IMPORT ROUTES
// ===================================

const taskRoutes = require("./routes/taskRoutes");


// ===================================
// 4. API ROUTES
// ===================================

app.use("/api/tasks", taskRoutes);


// Test API

app.get("/api/test", (req, res) => {

    res.status(200).json({
        success: true,
        message: "TaskFlow API is working!"
    });

});


// ===================================
// 5. ERROR HANDLING
// ===================================

// Handle unknown routes

app.use((req, res, next) => {

    const error = new Error("Route not found");

    error.status = 404;

    next(error);

});



// ===================================
// GLOBAL ERROR HANDLER
// ===================================

app.use((error, req, res, next) => {

    console.error("Error:", error);

    // Invalid JSON
    if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        "body" in error
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON format"
        });
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    // Duplicate database entry
    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Duplicate record"
        });
    }

    // Invalid MongoDB ID
    if (error.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
    }

    // General server error
    res.status(error.status || 500).json({
        success: false,
        message: error.status
            ? error.message
            : "Internal server error"
    });

});



// ===================================
// 6. CONNECT DATABASE AND START SERVER
// ===================================

const PORT = process.env.PORT || 5000;

async function startServer() {

    try {

        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {

            console.log(
                `Server running at http://localhost:${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);

    }

}

startServer();
