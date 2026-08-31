const Evaluation = require("../models/Evaluation");
const Submission = require("../models/Submission");
const User = require("../models/User");

// ==========================================
// CREATE EVALUATION
// ==========================================

const createEvaluation = async (req, res) => {
  try {
    const { submission, judgeId, score, remarks } = req.body;

    if (
      !submission ||
      !judgeId ||
      score === undefined ||
      !remarks
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Submission, judge ID, score and remarks are required",
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

    // Submission should be submitted
    if (
      submissionData.status !== "submitted" &&
      submissionData.status !== "under_review"
    ) {
      return res.status(400).json({
        success: false,
        message: "Only submitted projects can be evaluated",
      });
    }

    // Check judge
    const judge = await User.findById(judgeId);

    if (!judge) {
      return res.status(404).json({
        success: false,
        message: "Judge not found",
      });
    }

    if (judge.role !== "judge") {
      return res.status(400).json({
        success: false,
        message: "Only users with judge role can evaluate",
      });
    }

    // Check score
    if (score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 0 and 100",
      });
    }

    // Check duplicate evaluation
    const existingEvaluation = await Evaluation.findOne({
      submission,
      judgeId,
    });

    if (existingEvaluation) {
      return res.status(400).json({
        success: false,
        message: "This judge has already evaluated this submission",
      });
    }

    const evaluation = await Evaluation.create({
      submission,
      judgeId,
      score,
      remarks,
    });

    // Change submission status
    submissionData.status = "under_review";
    await submissionData.save();

    const populatedEvaluation = await Evaluation.findById(
      evaluation._id
    )
      .populate("submission", "projectTitle description status")
      .populate("judgeId", "name email college");

    res.status(201).json({
      success: true,
      message: "Evaluation created successfully",
      evaluation: populatedEvaluation,
    });
  } catch (error) {
    console.error("Create Evaluation Error:", error);

    res.status(500).json({
      success: false,
      message: "Error creating evaluation",
      error: error.message,
    });
  }
};


// ==========================================
// GET ALL EVALUATIONS
// ==========================================

const getEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find()
      .populate("submission", "projectTitle description status")
      .populate("judgeId", "name email college")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: evaluations.length,
      evaluations,
    });
  } catch (error) {
    console.error("Get Evaluations Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching evaluations",
      error: error.message,
    });
  }
};


// ==========================================
// GET EVALUATION BY ID
// ==========================================

const getEvaluationById = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id)
      .populate("submission", "projectTitle description status")
      .populate("judgeId", "name email college");

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found",
      });
    }

    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error("Get Evaluation Error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching evaluation",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE EVALUATION
// ==========================================

const updateEvaluation = async (req, res) => {
  try {
    const { score, remarks } = req.body;

    const evaluation = await Evaluation.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found",
      });
    }

    if (score !== undefined) {
      if (score < 0 || score > 100) {
        return res.status(400).json({
          success: false,
          message: "Score must be between 0 and 100",
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
      .populate("judgeId", "name email college");

    res.status(200).json({
      success: true,
      message: "Evaluation updated successfully",
      evaluation: updatedEvaluation,
    });
  } catch (error) {
    console.error("Update Evaluation Error:", error);

    res.status(500).json({
      success: false,
      message: "Error updating evaluation",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE EVALUATION
// ==========================================

const deleteEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findByIdAndDelete(
      req.params.id
    );

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Evaluation deleted successfully",
    });
  } catch (error) {
    console.error("Delete Evaluation Error:", error);

    res.status(500).json({
      success: false,
      message: "Error deleting evaluation",
      error: error.message,
    });
  }
};


module.exports = {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation,
};