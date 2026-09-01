const Evaluation = require("../models/Evaluation");
const Submission = require("../models/Submission");


// ==========================================
// CREATE EVALUATION
// JUDGE ONLY
// ==========================================

const createEvaluation = async (req, res) => {
  try {
    const { submission, score, remarks } = req.body;

    if (
      !submission ||
      score === undefined ||
      !remarks
    ) {
      return res.status(400).json({
        success: false,
        message: "Submission, score and remarks are required"
      });
    }

    // Check submission
    const submissionData = await Submission.findById(submission);

    if (!submissionData) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    // Only submitted projects can be evaluated
    if (
      submissionData.status !== "submitted" &&
      submissionData.status !== "under_review"
    ) {
      return res.status(400).json({
        success: false,
        message: "Only submitted projects can be evaluated"
      });
    }

    // Check score
    if (score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 0 and 100"
      });
    }

    // Check duplicate evaluation
    // Same judge cannot evaluate same submission twice
    const existingEvaluation = await Evaluation.findOne({
      submission,
      judgeId: req.user._id
    });

    if (existingEvaluation) {
      return res.status(400).json({
        success: false,
        message: "You have already evaluated this submission"
      });
    }

    // Create evaluation
    const evaluation = await Evaluation.create({
      submission,
      judgeId: req.user._id,
      score,
      remarks
    });

    // Change submission status
    submissionData.status = "under_review";
    await submissionData.save();

    const populatedEvaluation = await Evaluation.findById(
      evaluation._id
    )
      .populate("submission", "projectTitle description status")
      .populate("judgeId", "name email");

    res.status(201).json({
      success: true,
      message: "Evaluation created successfully",
      evaluation: populatedEvaluation
    });

  } catch (error) {
    console.error("Create Evaluation Error:", error);

    res.status(500).json({
      success: false,
      message: "Error creating evaluation",
      error: error.message
    });
  }
};


// ==========================================
// GET ALL EVALUATIONS
// JUDGE → ONLY OWN EVALUATIONS
// ADMIN → ALL EVALUATIONS
// ==========================================

const getEvaluations = async (req, res) => {
  try {
    let evaluations;

    if (req.user.role === "admin") {
      evaluations = await Evaluation.find();
    } else {
      evaluations = await Evaluation.find({
        judgeId: req.user._id
      });
    }

    evaluations = await Evaluation.populate(evaluations, [
      {
        path: "submission",
        select: "projectTitle description status"
      },
      {
        path: "judgeId",
        select: "name email"
      }
    ]);

    res.status(200).json({
      success: true,
      count: evaluations.length,
      evaluations
    });

  } catch (error) {
    console.error("Get Evaluations Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching evaluations",
      error: error.message
    });
  }
};


// ==========================================
// GET EVALUATION BY ID
// JUDGE → ONLY OWN EVALUATION
// ADMIN → ANY EVALUATION
// ==========================================

const getEvaluationById = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id)
      .populate("submission", "projectTitle description status")
      .populate("judgeId", "name email");

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found"
      });
    }

    // Judge can only see own evaluation
    if (
      req.user.role !== "admin" &&
      evaluation.judgeId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this evaluation"
      });
    }

    res.status(200).json({
      success: true,
      evaluation
    });

  } catch (error) {
    console.error("Get Evaluation Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching evaluation",
      error: error.message
    });
  }
};


// ==========================================
// UPDATE EVALUATION
// JUDGE → OWN EVALUATION
// ADMIN → ANY EVALUATION
// ==========================================

const updateEvaluation = async (req, res) => {
  try {
    const { score, remarks } = req.body;

    const evaluation = await Evaluation.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found"
      });
    }

    // Check ownership
    if (
      req.user.role !== "admin" &&
      evaluation.judgeId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own evaluation"
      });
    }

    if (score !== undefined) {
      if (score < 0 || score > 100) {
        return res.status(400).json({
          success: false,
          message: "Score must be between 0 and 100"
        });
      }

      evaluation.score = score;
    }

    if (remarks !== undefined) {
      evaluation.remarks = remarks;
    }

    await evaluation.save();

    const updatedEvaluation = await Evaluation.findById(
      evaluation._id
    )
      .populate("submission", "projectTitle description status")
      .populate("judgeId", "name email");

    res.status(200).json({
      success: true,
      message: "Evaluation updated successfully",
      evaluation: updatedEvaluation
    });

  } catch (error) {
    console.error("Update Evaluation Error:", error);

    res.status(500).json({
      success: false,
      message: "Error updating evaluation",
      error: error.message
    });
  }
};


// ==========================================
// DELETE EVALUATION
// JUDGE → OWN EVALUATION
// ADMIN → ANY EVALUATION
// ==========================================

const deleteEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found"
      });
    }

    // Check ownership
    if (
      req.user.role !== "admin" &&
      evaluation.judgeId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own evaluation"
      });
    }

    await Evaluation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Evaluation deleted successfully"
    });

  } catch (error) {
    console.error("Delete Evaluation Error:", error);

    res.status(500).json({
      success: false,
      message: "Error deleting evaluation",
      error: error.message
    });
  }
};


module.exports = {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation
};