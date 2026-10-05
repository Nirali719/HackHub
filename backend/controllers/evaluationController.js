const Evaluation = require("../models/Evaluation");
const Submission = require("../models/Submission");

// ==========================================
// CREATE EVALUATION
// JUDGE ONLY
// ==========================================

const createEvaluation = async (req, res) => {
  try {
    const {
      submission,
      innovation,
      technicalQuality,
      functionality,
      uiUx,
      impact,
      remarks
    } = req.body;

    // Check required fields
    if (
      !submission ||
      innovation === undefined ||
      technicalQuality === undefined ||
      functionality === undefined ||
      uiUx === undefined ||
      impact === undefined ||
      !remarks
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Submission, all evaluation criteria and remarks are required"
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

    // Only submitted / under review projects can be evaluated
    if (
      submissionData.status !== "submitted" &&
      submissionData.status !== "under_review"
    ) {
      return res.status(400).json({
        success: false,
        message: "Only submitted projects can be evaluated"
      });
    }

    // Validate each criterion
    const criteria = [
      { name: "Innovation", value: innovation },
      { name: "Technical Quality", value: technicalQuality },
      { name: "Functionality", value: functionality },
      { name: "UI/UX", value: uiUx },
      { name: "Impact", value: impact }
    ];

    for (const criterion of criteria) {
      if (
        typeof criterion.value !== "number" ||
        criterion.value < 0 ||
        criterion.value > 20
      ) {
        return res.status(400).json({
          success: false,
          message: `${criterion.name} score must be between 0 and 20`
        });
      }
    }

    // Calculate total score
    const score =
      innovation +
      technicalQuality +
      functionality +
      uiUx +
      impact;

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
      innovation,
      technicalQuality,
      functionality,
      uiUx,
      impact,
      score,
      remarks
    });

    // Count evaluations for this submission
    // Count evaluations for this submission
// ==========================================
// UPDATE SUBMISSION STATUS
// AFTER EVALUATION
// ==========================================

const evaluationCount =
  await Evaluation.countDocuments({
    submission: submissionData._id
  });

console.log(
  `Evaluation count for submission ${submissionData._id}: ${evaluationCount}`
);

if (evaluationCount >= 3) {

  // All 3 judges have evaluated
  submissionData.status = "evaluated";

  await submissionData.save();

  // Mark team as completed
  const Team = require("../models/Team");

  const team = await Team.findById(
    submissionData.team
  );

  if (team) {
    team.status = "completed";

    await team.save();
  }

} else {

  // 1 or 2 judges have evaluated
  submissionData.status = "under_review";

  await submissionData.save();
}


    // Populate evaluation
    const populatedEvaluation = await Evaluation.findById(
      evaluation._id
    )
      .populate(
        "submission",
        "projectTitle description status"
      )
      .populate(
        "judgeId",
        "name email"
      );

    res.status(201).json({
      success: true,
      message: "Evaluation created successfully",
      evaluationCount,
      evaluationsRequired: 3,
      evaluation: populatedEvaluation
    });

  } catch (error) {
    console.error("Create Evaluation Error:", error);

    // Handle duplicate index error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already evaluated this submission"
      });
    }

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
      .populate(
        "submission",
        "projectTitle description status"
      )
      .populate(
        "judgeId",
        "name email"
      );

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found"
      });
    }

    // Judge can only see own evaluation
    if (
      req.user.role !== "admin" &&
      evaluation.judgeId._id.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view this evaluation"
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
    const {
      innovation,
      technicalQuality,
      functionality,
      uiUx,
      impact,
      remarks
    } = req.body;

    const evaluation = await Evaluation.findById(
      req.params.id
    );

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found"
      });
    }

    // Check ownership
    if (
      req.user.role !== "admin" &&
      evaluation.judgeId.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only update your own evaluation"
      });
    }

    // Update criteria if provided
    const updatedCriteria = {
      innovation:
        innovation !== undefined
          ? innovation
          : evaluation.innovation,

      technicalQuality:
        technicalQuality !== undefined
          ? technicalQuality
          : evaluation.technicalQuality,

      functionality:
        functionality !== undefined
          ? functionality
          : evaluation.functionality,

      uiUx:
        uiUx !== undefined
          ? uiUx
          : evaluation.uiUx,

      impact:
        impact !== undefined
          ? impact
          : evaluation.impact
    };

    // Validate criteria
    for (const [key, value] of Object.entries(
      updatedCriteria
    )) {
      if (
        typeof value !== "number" ||
        value < 0 ||
        value > 20
      ) {
        return res.status(400).json({
          success: false,
          message: `${key} score must be between 0 and 20`
        });
      }
    }

    // Recalculate total
    evaluation.innovation =
      updatedCriteria.innovation;

    evaluation.technicalQuality =
      updatedCriteria.technicalQuality;

    evaluation.functionality =
      updatedCriteria.functionality;

    evaluation.uiUx =
      updatedCriteria.uiUx;

    evaluation.impact =
      updatedCriteria.impact;

    evaluation.score =
      updatedCriteria.innovation +
      updatedCriteria.technicalQuality +
      updatedCriteria.functionality +
      updatedCriteria.uiUx +
      updatedCriteria.impact;

    if (remarks !== undefined) {
      evaluation.remarks = remarks;
    }

    await evaluation.save();

    const updatedEvaluation =
      await Evaluation.findById(
        evaluation._id
      )
        .populate(
          "submission",
          "projectTitle description status"
        )
        .populate(
          "judgeId",
          "name email"
        );

    res.status(200).json({
      success: true,
      message: "Evaluation updated successfully",
      evaluation: updatedEvaluation
    });

  } catch (error) {
    console.error(
      "Update Evaluation Error:",
      error
    );

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
    const evaluation =
      await Evaluation.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found"
      });
    }

    // Check ownership
    if (
      req.user.role !== "admin" &&
      evaluation.judgeId.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own evaluation"
      });
    }

    const submissionId =
      evaluation.submission;

    await Evaluation.findByIdAndDelete(
      req.params.id
    );

    // Recalculate submission status
    const remainingEvaluations =
      await Evaluation.countDocuments({
        submission: submissionId
      });

    const submission =
      await Submission.findById(submissionId);

    if (submission) {
      if (remainingEvaluations >= 3) {
        submission.status = "evaluated";
      } else if (remainingEvaluations > 0) {
        submission.status = "under_review";
      } else {
        submission.status = "submitted";
      }

      await submission.save();
    }

    res.status(200).json({
      success: true,
      message: "Evaluation deleted successfully"
    });

  } catch (error) {
    console.error(
      "Delete Evaluation Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Error deleting evaluation",
      error: error.message
    });
  }
};

const getEvaluationsBySubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;

        const Submission = require("../models/Submission");
        const Team = require("../models/Team");

        const submission = await Submission.findById(submissionId);

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
        // Admin can see everything
        if (req.user.role === "admin") {
            // allowed
        }

        // Judge can see evaluations for the project
        else if (req.user.role === "judge") {
            // allowed
        }

        // Participant can see only their team's project
        else if (req.user.role === "participant") {
            const userId = req.user._id.toString();

            const isLeader =
                team.leader?.toString() === userId;

            const isMember =
                team.members?.some(
                    (member) => member.toString() === userId
                );

            if (!isLeader && !isMember) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to view these evaluations"
                });
            }
        }

        // Mentor can see only their assigned team's project
        else if (req.user.role === "mentor") {
            const mentorId = req.user._id.toString();

            if (
                !team.mentor ||
                team.mentor.toString() !== mentorId
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to view these evaluations"
                });
            }
        }

        const evaluations = await Evaluation.find({
            submission: submissionId
        })
            .populate("judgeId", "name email")
            .sort({ createdAt: 1 });

        const finalScore =
            evaluations.length === 3
                ? evaluations.reduce(
                      (sum, evaluation) => sum + evaluation.score,
                      0
                  ) / 3
                : null;

        res.status(200).json({
            success: true,
            count: evaluations.length,
            required: 3,
            evaluations,
            finalScore
        });

    } catch (error) {
        console.error("Get evaluations by submission error:", error);

        res.status(500).json({
            success: false,
            message: "Error fetching evaluations",
            error: error.message
        });
    }
};

module.exports = {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation,
  getEvaluationsBySubmission
};