const Submission = require("../models/Submission");
const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");


// ==========================================
// CREATE SUBMISSION
// ==========================================

const createSubmission = async (req, res) => {
  try {
    const {
      hackathon,
      team,
      projectTitle,
      description,
      githubUrl,
      demoUrl,
    } = req.body;

    // Check required fields
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
          "Hackathon, team, project title, description and GitHub URL are required",
      });
    }

    // Check hackathon
    const hackathonData = await Hackathon.findById(hackathon);

    if (!hackathonData) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Check team
    const teamData = await Team.findById(team);

    if (!teamData) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Make sure team belongs to this hackathon
    if (teamData.hackathon.toString() !== hackathon) {
      return res.status(400).json({
        success: false,
        message: "Team does not belong to this hackathon",
      });
    }

    // Check if submission already exists
    const existingSubmission = await Submission.findOne({
      hackathon,
      team,
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: "A submission already exists for this team",
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
      status: "draft",
    });

    const populatedSubmission = await Submission.findById(
      submission._id
    )
      .populate("hackathon", "title submissionDeadline status")
      .populate("team", "teamName leader members");

    res.status(201).json({
      success: true,
      message: "Submission created successfully",
      submission: populatedSubmission,
    });
  } catch (error) {
    console.error("Create Submission Error:", error);

    res.status(500).json({
      success: false,
      message: "Error creating submission",
      error: error.message,
    });
  }
};


// ==========================================
// GET ALL SUBMISSIONS
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
      submissions,
    });
  } catch (error) {
    console.error("Get Submissions Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching submissions",
      error: error.message,
    });
  }
};


// ==========================================
// GET SUBMISSION BY ID
// ==========================================

const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("hackathon", "title status submissionDeadline")
      .populate("team", "teamName leader members");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("Get Submission Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching submission",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE SUBMISSION
// ==========================================

const updateSubmission = async (req, res) => {
  try {
    const {
      projectTitle,
      description,
      githubUrl,
      demoUrl,
    } = req.body;

    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Do not allow editing an evaluated submission
    if (submission.status === "evaluated") {
      return res.status(400).json({
        success: false,
        message: "Evaluated submission cannot be modified",
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

    const updatedSubmission = await Submission.findById(
      submission._id
    )
      .populate("hackathon", "title submissionDeadline status")
      .populate("team", "teamName leader members");

    res.status(200).json({
      success: true,
      message: "Submission updated successfully",
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("Update Submission Error:", error);

    res.status(500).json({
      success: false,
      message: "Error updating submission",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE SUBMISSION
// ==========================================

const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByIdAndDelete(
      req.params.id
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch (error) {
    console.error("Delete Submission Error:", error);

    res.status(500).json({
      success: false,
      message: "Error deleting submission",
      error: error.message,
    });
  }
};


// ==========================================
// SUBMIT PROJECT
// ==========================================

const submitSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("hackathon", "title submissionDeadline status");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
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
        message: "Submission has already been submitted",
      });
    }

    // Check submission deadline
    if (
      submission.hackathon.submissionDeadline &&
      new Date() > new Date(submission.hackathon.submissionDeadline)
    ) {
      return res.status(400).json({
        success: false,
        message: "Submission deadline has passed",
      });
    }

    submission.status = "submitted";
    submission.submissionDate = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      message: "Project submitted successfully",
      submission,
    });
  } catch (error) {
    console.error("Submit Submission Error:", error);

    res.status(500).json({
      success: false,
      message: "Error submitting project",
      error: error.message,
    });
  }
};


module.exports = {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  submitSubmission,
};