const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const hackathonRoutes = require("./routes/hackathonRoutes");

// const User = require("./models/User");
// const Team = require("./models/Team");
// const Submission = require("./models/Submission");
// const Evaluation = require("./models/Evaluation");
// const Registration = require("./models/Registration");
const userRoutes = require("./routes/userRoutes");

const teamRoutes = require("./routes/teamRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const connectDB = require("./config/db");
const evaluationRoutes = require("./routes/evaluationRoutes");
const resultRoutes = require("./routes/resultRoutes");
// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use("/users", userRoutes);
// router.post("/login", loginUser);
const registrationRoutes = require("./routes/registrationRoutes");

app.use("/registrations", registrationRoutes);
app.use("/hackathons", hackathonRoutes);
app.use("/teams", teamRoutes);
app.use("/submissions", submissionRoutes);
app.use("/evaluations", evaluationRoutes);
app.use("/results", resultRoutes);
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