const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const User = require("./models/User");
const Team = require("./models/Team");
const Submission = require("./models/Submission");
const Result = require("./models/Result");
const Registration = require("./models/Registration");
const Evaluation = require("./models/Evaluation");
const Hackathon = require("./models/Hackathon");
const userRoutes = require("./routes/userRoutes");

const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

console.log("MongoDB Connected\n");

app.get("/", (req, res) => {
    res.send("Backend server is running!");
});

// User routes
app.use("/Users", userRoutes);
``

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
