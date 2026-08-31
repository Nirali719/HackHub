const Result = require("../models/Result");
const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const Submission = require("../models/Submission");
const Evaluation = require("../models/Evaluation");

// ==========================================
// CREATE RESULT MANUALLY
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

    // Make sure submission belongs to team
    if (submissionData.team.toString() !== teamId) {
      return res.status(400).json({
        success: false,
        message: "Submission does not belong to this team",
      });
    }

    // Make sure submission belongs to hackathon
    if (submissionData.hackathon.toString() !== hackathon) {
      return res.status(400).json({
        success: false,
        message: "Submission does not belong to this hackathon",
      });
    }

    if (finalScore < 0 || finalScore > 100) {
      return res.status(400).json({
        success: false,
        message: "Final score must be between 0 and 100",
      });
    }

    // Check existing result
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

    const result = await Result.create({
      hackathon,
      teamId,
      submission,
      finalScore,
      resultStatus: resultStatus || "participant",
    });

    const populatedResult = await Result.findById(result._id)
      .populate("hackathon", "title status")
      .populate("teamId", "teamName leader members")
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
      .populate("teamId", "teamName leader members")
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
      .populate("submission", "projectTitle status");

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
// ==========================================

const updateResult = async (req, res) => {
  try {
    const { finalScore, resultStatus } = req.body;

    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    if (finalScore !== undefined) {
      if (finalScore < 0 || finalScore > 100) {
        return res.status(400).json({
          success: false,
          message: "Final score must be between 0 and 100",
        });
      }

      result.finalScore = finalScore;
    }

    if (resultStatus) {
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

    // Find submitted submissions
    const submissions = await Submission.find({
      hackathon: hackathonId,
      status: {
        $in: ["submitted", "under_review", "evaluated"],
      },
    });

    if (submissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No submitted projects found",
      });
    }

    const generatedResults = [];

    for (const submission of submissions) {
      // Find evaluations for this submission
      const evaluations = await Evaluation.find({
        submission: submission._id,
      });

      if (evaluations.length === 0) {
        continue;
      }

      // Calculate average score
      const totalScore = evaluations.reduce(
        (total, evaluation) => total + evaluation.score,
        0
      );

      const finalScore =
        totalScore / evaluations.length;

      // Find existing result
      let result = await Result.findOne({
        hackathon: hackathonId,
        teamId: submission.team,
      });

      if (!result) {
        result = await Result.create({
          hackathon: hackathonId,
          teamId: submission.team,
          submission: submission._id,
          finalScore: Number(finalScore.toFixed(2)),
          resultStatus: "participant",
        });
      } else {
        result.finalScore = Number(finalScore.toFixed(2));
        await result.save();
      }

      generatedResults.push(result);
    }

    if (generatedResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No evaluated submissions found",
      });
    }

    // Sort highest score first
    generatedResults.sort(
      (a, b) => b.finalScore - a.finalScore
    );

    // Assign result status
    for (let i = 0; i < generatedResults.length; i++) {
      if (i === 0) {
        generatedResults[i].resultStatus = "winner";
      } else if (i === 1) {
        generatedResults[i].resultStatus = "runner_up";
      } else if (i < 3) {
        generatedResults[i].resultStatus = "finalist";
      } else {
        generatedResults[i].resultStatus = "participant";
      }

      await generatedResults[i].save();
    }

    const finalResults = await Result.find({
      hackathon: hackathonId,
    })
      .populate("teamId", "teamName leader members")
      .populate("submission", "projectTitle status")
      .sort({ finalScore: -1 });

    res.status(200).json({
      success: true,
      message: "Results generated successfully",
      results: finalResults,
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


module.exports = {
  createResult,
  getResults,
  getResultById,
  getResultsByHackathon,
  updateResult,
  deleteResult,
  generateResults,
};