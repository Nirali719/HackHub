const User = require("../models/User");
const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const Submission = require("../models/Submission");
const Evaluation = require("../models/Evaluation");
const Result = require("../models/Result");
const Registration = require("../models/Registration");

// ==========================================
// ADMIN DASHBOARD
// GET /admin/dashboard
// ADMIN ONLY
// ==========================================

const getAdminDashboard = async (req, res) => {
    try {

        // ==========================================
        // USER COUNTS
        // ==========================================

        const totalUsers = await User.countDocuments();

        const participants = await User.countDocuments({
            role: "participant"
        });

        const mentors = await User.countDocuments({
            role: "mentor"
        });

        const judges = await User.countDocuments({
            role: "judge"
        });

        const admins = await User.countDocuments({
            role: "admin"
        });


        // ==========================================
        // HACKATHON COUNTS
        // ==========================================

        const totalHackathons =
            await Hackathon.countDocuments();

        const activeHackathons =
            await Hackathon.countDocuments({
                status: {
                    $in: ["published", "ongoing"]
                }
            });

        const completedHackathons =
            await Hackathon.countDocuments({
                status: "completed"
            });


        // ==========================================
        // TEAM COUNTS
        // ==========================================

        const totalTeams =
            await Team.countDocuments();

        const completedTeams =
            await Team.countDocuments({
                status: "completed"
            });


        // ==========================================
        // SUBMISSION COUNTS
        // ==========================================

        const totalSubmissions =
            await Submission.countDocuments();

        const submittedProjects =
            await Submission.countDocuments({
                status: {
                    $in: ["submitted", "under_review", "evaluated"]
                }
            });

        const evaluatedProjects =
            await Submission.countDocuments({
                status: "evaluated"
            });


        // ==========================================
        // EVALUATION COUNTS
        // ==========================================

        const totalEvaluations =
            await Evaluation.countDocuments();


        // ==========================================
        // RESULT COUNTS
        // ==========================================

        const totalResults =
            await Result.countDocuments();


        // ==========================================
        // REGISTRATION COUNTS
        // ==========================================

        const totalRegistrations =
            await Registration.countDocuments();

        const approvedRegistrations =
            await Registration.countDocuments({
                status: "approved"
            });


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({

            success: true,

            stats: {

                users: {
                    total: totalUsers,
                    participants,
                    mentors,
                    judges,
                    admins
                },

                hackathons: {
                    total: totalHackathons,
                    active: activeHackathons,
                    completed: completedHackathons
                },

                teams: {
                    total: totalTeams,
                    completed: completedTeams
                },

                submissions: {
                    total: totalSubmissions,
                    submitted: submittedProjects,
                    evaluated: evaluatedProjects
                },

                evaluations: {
                    total: totalEvaluations
                },

                results: {
                    total: totalResults
                },

                registrations: {
                    total: totalRegistrations,
                    approved: approvedRegistrations
                }

            }

        });

    } catch (error) {

        console.error(
            "Admin Dashboard Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Error loading admin dashboard",

            error: error.message

        });

    }
};


module.exports = {
    getAdminDashboard
};