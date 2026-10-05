const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// const User = require("./models/User");
// const Team = require("./models/Team");
// const Submission = require("./models/Submission");
// const Evaluation = require("./models/Evaluation");
// const Registration = require("./models/Registration");

const hackathonRoutes = require("./routes/hackathonRoutes");
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");
const resultRoutes = require("./routes/resultRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const mentorGuidanceRoutes = require("./routes/mentorGuidanceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const certificateRoutes =
    require("./routes/certificateRoutes");

const connectDB = require("./config/db");
const {
    sendDeadlineReminders
} = require(
    "./services/deadlineReminderService"
);

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/registrations", registrationRoutes);
app.use("/hackathons", hackathonRoutes);
app.use("/teams", teamRoutes);
app.use("/teams", mentorGuidanceRoutes);
app.use("/submissions", submissionRoutes);
app.use("/evaluations", evaluationRoutes);
app.use("/results", resultRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/users", adminUserRoutes);

app.use(
    "/certificates",
    certificateRoutes
);
const multer = require("multer");

app.use(
    (error, req, res, next) => {

        if (
            error instanceof
            multer.MulterError
        ) {

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `PDF size must not exceed ${
                            process.env.MAX_SUBMISSION_PDF_MB ||
                            5
                        } MB`
                });
            }
        }


        if (
            error?.message ===
            "Only PDF files are allowed."
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Only PDF files are allowed."
            });
        }


        next(error);
    }
);


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