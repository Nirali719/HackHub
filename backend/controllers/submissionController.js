const Submission = require("../models/Submission");
const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");


// ==========================================
// CREATE SUBMISSION
// TEAM LEADER ONLY
// ==========================================

const createSubmission = async (req, res) => {
  try {
    const {
      hackathon,
      team,
      projectTitle,
      description,
      githubUrl,
      demoUrl
    } = req.body;

    if (
      !hackathon ||
      !team ||
      !projectTitle ||
      !description ||
      !githubUrl
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Hackathon, team, project title, description and GitHub URL are required"
      });
    }

    // Check hackathon exists
    const hackathonData = await Hackathon.findById(hackathon);

    if (!hackathonData) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found"
      });
    }

    // Check team exists
    const teamData = await Team.findById(team);

    if (!teamData) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check team belongs to this hackathon
    if (teamData.hackathon.toString() !== hackathon.toString()) {
      return res.status(400).json({
        success: false,
        message: "Team does not belong to this hackathon"
      });
    }

    // Check logged-in user is the team leader
    if (
      req.user.role !== "admin" &&
      teamData.leader.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can create a submission"
      });
    }

    // Check submission already exists
    const existingSubmission = await Submission.findOne({
      hackathon,
      team
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: "A submission already exists for this team"
      });
    }

    // Create submission
    const submission = await Submission.create({
      hackathon,
      team,
      projectTitle,
      description,
      githubUrl,
      demoUrl,
      status: "draft"
    });

    const populatedSubmission = await Submission.findById(
      submission._id
    )
      .populate("hackathon", "title submissionDeadline status")
      .populate("team", "teamName leader members");

    res.status(201).json({
      success: true,
      message: "Submission created successfully",
      submission: populatedSubmission
    });

  } catch (error) {
    console.error("Create Submission Error:", error);

    res.status(500).json({
      success: false,
      message: "Error creating submission",
      error: error.message
    });
  }
};


// ==========================================
// GET ALL SUBMISSIONS
// ALL LOGGED-IN USERS
// ==========================================

const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("hackathon", "title status submissionDeadline")
      .populate("team", "teamName leader members")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching submissions",
      error: error.message
    });
  }
};


// ==========================================
// GET SINGLE SUBMISSION
// ALL LOGGED-IN USERS
// ==========================================

const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("hackathon", "title status submissionDeadline")
      .populate("team", "teamName leader members");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    res.status(200).json({
      success: true,
      submission
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching submission",
      error: error.message
    });
  }
};


// ==========================================
// UPDATE SUBMISSION
// TEAM LEADER OR ADMIN
// ==========================================

const updateSubmission = async (req, res) => {
  try {
    const {
      projectTitle,
      description,
      githubUrl,
      demoUrl
    } = req.body;

    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    // Get team
    const team = await Team.findById(submission.team);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check team leader ownership
    if (
      req.user.role !== "admin" &&
      team.leader.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can update this submission"
      });
    }

    // Cannot modify evaluated submission
    if (submission.status === "evaluated") {
      return res.status(400).json({
        success: false,
        message: "Evaluated submission cannot be modified"
      });
    }

    if (projectTitle) {
      submission.projectTitle = projectTitle;
    }

    if (description) {
      submission.description = description;
    }

    if (githubUrl) {
      submission.githubUrl = githubUrl;
    }

    if (demoUrl !== undefined) {
      submission.demoUrl = demoUrl;
    }

    await submission.save();

    const updatedSubmission = await Submission.findById(submission._id)
      .populate("hackathon", "title submissionDeadline status")
      .populate("team", "teamName leader members");

    res.status(200).json({
      success: true,
      message: "Submission updated successfully",
      submission: updatedSubmission
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating submission",
      error: error.message
    });
  }
};


// ==========================================
// DELETE SUBMISSION
// TEAM LEADER OR ADMIN
// ==========================================

const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    const team = await Team.findById(submission.team);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check team leader
    if (
      req.user.role !== "admin" &&
      team.leader.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can delete this submission"
      });
    }

    // Optional: Don't allow deleting evaluated submission
    if (submission.status === "evaluated") {
      return res.status(400).json({
        success: false,
        message: "Evaluated submission cannot be deleted"
      });
    }

    await Submission.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Submission deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting submission",
      error: error.message
    });
  }
};


// ==========================================
// SUBMIT PROJECT
// TEAM LEADER ONLY
// ==========================================

const submitSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("hackathon", "title submissionDeadline status");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    // Get team
    const team = await Team.findById(submission.team);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check team leader
    if (
      req.user.role !== "admin" &&
      team.leader.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can submit this project"
      });
    }

    // Already submitted
    if (
      submission.status === "submitted" ||
      submission.status === "under_review" ||
      submission.status === "evaluated"
    ) {
      return res.status(400).json({
        success: false,
        message: "Submission has already been submitted"
      });
    }

    // Check deadline
    if (
      submission.hackathon.submissionDeadline &&
      new Date() > new Date(submission.hackathon.submissionDeadline)
    ) {
      return res.status(400).json({
        success: false,
        message: "Submission deadline has passed"
      });
    }

    submission.status = "submitted";
    submission.submissionDate = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      message: "Project submitted successfully",
      submission
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting project",
      error: error.message
    });
  }
};


module.exports = {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  submitSubmission
};