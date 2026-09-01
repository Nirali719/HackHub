const Result = require("../models/Result");
const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const Submission = require("../models/Submission");
const Evaluation = require("../models/Evaluation");

// ==========================================
// CREATE RESULT
// ADMIN ONLY
// ==========================================

const createResult = async (req, res) => {
  try {
    const {
      hackathon,
      teamId,
      submission,
      finalScore,
      resultStatus,
    } = req.body;

    // Check required fields
    if (
      !hackathon ||
      !teamId ||
      !submission ||
      finalScore === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Hackathon, team, submission and final score are required",
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
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check submission
    const submissionData = await Submission.findById(submission);

    if (!submissionData) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Check duplicate result
    const existingResult = await Result.findOne({
      hackathon,
      teamId,
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: "Result already exists for this team",
      });
    }

    // Create result
    const result = await Result.create({
      hackathon,
      teamId,
      submission,
      finalScore,
      resultStatus: resultStatus || "participant",
    });

    const populatedResult = await Result.findById(result._id)
      .populate("hackathon", "title status")
      .populate("teamId", "teamName leader")
      .populate("submission", "projectTitle status");

    res.status(201).json({
      success: true,
      message: "Result created successfully",
      result: populatedResult,
    });

  } catch (error) {
    console.error("Create Result Error:", error);

    res.status(500).json({
      success: false,
      message: "Error creating result",
      error: error.message,
    });
  }
};


// ==========================================
// GET ALL RESULTS
// ==========================================

const getResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate("hackathon", "title status")
      .populate("teamId", "teamName leader")
      .populate("submission", "projectTitle status")
      .sort({ finalScore: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      results,
    });

  } catch (error) {
    console.error("Get Results Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching results",
      error: error.message,
    });
  }
};


// ==========================================
// GET RESULT BY ID
// ==========================================

const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate("hackathon", "title status")
      .populate("teamId", "teamName leader members")
      .populate("submission", "projectTitle description status");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      result,
    });

  } catch (error) {
    console.error("Get Result Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching result",
      error: error.message,
    });
  }
};


// ==========================================
// GET RESULTS BY HACKATHON
// ==========================================

const getResultsByHackathon = async (req, res) => {
  try {
    const results = await Result.find({
      hackathon: req.params.hackathonId,
    })
      .populate("hackathon", "title status")
      .populate("teamId", "teamName leader members")
      .populate("submission", "projectTitle status")
      .sort({ finalScore: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      results,
    });

  } catch (error) {
    console.error("Get Hackathon Results Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching hackathon results",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE RESULT
// ADMIN ONLY
// ==========================================

const updateResult = async (req, res) => {
  try {
    const {
      finalScore,
      resultStatus,
    } = req.body;

    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    if (finalScore !== undefined) {
      result.finalScore = finalScore;
    }

    if (resultStatus !== undefined) {
      result.resultStatus = resultStatus;
    }

    await result.save();

    res.status(200).json({
      success: true,
      message: "Result updated successfully",
      result,
    });

  } catch (error) {
    console.error("Update Result Error:", error);

    res.status(500).json({
      success: false,
      message: "Error updating result",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE RESULT
// ADMIN ONLY
// ==========================================

const deleteResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Result deleted successfully",
    });

  } catch (error) {
    console.error("Delete Result Error:", error);

    res.status(500).json({
      success: false,
      message: "Error deleting result",
      error: error.message,
    });
  }
};


// ==========================================
// GENERATE RESULTS AUTOMATICALLY
// ADMIN ONLY
// ==========================================

const generateResults = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    // Check hackathon
    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Get all submissions for hackathon
    const submissions = await Submission.find({
      hackathon: hackathonId,
    });

    if (submissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No submissions found for this hackathon",
      });
    }

    // Remove old results before generating new ones
    await Result.deleteMany({
      hackathon: hackathonId,
    });

    const generatedResults = [];

    // Calculate average score for every submission
    for (const submission of submissions) {

      const evaluations = await Evaluation.find({
        submission: submission._id,
      });

      // Skip submissions with no evaluations
      if (evaluations.length === 0) {
        continue;
      }

      let totalScore = 0;

      evaluations.forEach((evaluation) => {
        totalScore += evaluation.score;
      });

      const averageScore =
        totalScore / evaluations.length;

      generatedResults.push({
        hackathon: hackathonId,
        teamId: submission.team,
        submission: submission._id,
        finalScore: averageScore,
        resultStatus: "participant",
      });
    }

    if (generatedResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No evaluated submissions found",
      });
    }

    // Sort results by score (highest first)
    generatedResults.sort(
      (a, b) => b.finalScore - a.finalScore
    );

    // Assign result positions
    generatedResults.forEach((result, index) => {

      if (index === 0) {
        result.resultStatus = "winner";
      } else if (index === 1) {
        result.resultStatus = "runner_up";
      } else if (index === 2) {
        result.resultStatus = "finalist";
      } else {
        result.resultStatus = "participant";
      }

    });

    // Save all results
    const results =
      await Result.insertMany(generatedResults);

    res.status(201).json({
      success: true,
      message: "Results generated successfully",
      count: results.length,
      results,
    });

  } catch (error) {
    console.error("Generate Results Error:", error);

    res.status(500).json({
      success: false,
      message: "Error generating results",
      error: error.message,
    });
  }
};


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
  createResult,
  getResults,
  getResultById,
  getResultsByHackathon,
  updateResult,
  deleteResult,
  generateResults,
};