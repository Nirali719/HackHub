const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
// const Hackathon = require("./models/Hackathon");
// const User = require("./models/User");
// const Team = require("./models/Team");
// const Submission = require("./models/Submission");
// const Evaluation = require("./models/Evaluation");
// const Registration = require("./models/Registration");
const userRoutes = require("./routes/userRoutes");



const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use("/api/users", userRoutes);
router.post("/login", loginUser);

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
    res.send("Backend server is running!");
});


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});