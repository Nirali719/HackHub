const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true
    },

    judgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Predefined evaluation criteria
    innovation: {
      type: Number,
      required: true,
      min: 0,
      max: 20
    },

    technicalQuality: {
      type: Number,
      required: true,
      min: 0,
      max: 20
    },

    functionality: {
      type: Number,
      required: true,
      min: 0,
      max: 20
    },

    uiUx: {
      type: Number,
      required: true,
      min: 0,
      max: 20
    },

    impact: {
      type: Number,
      required: true,
      min: 0,
      max: 20
    },

    // Total score out of 100
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    remarks: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// One judge can evaluate a submission only once
evaluationSchema.index(
  { submission: 1, judgeId: 1 },
  { unique: true }
);

const Evaluation = mongoose.model("Evaluation", evaluationSchema);

module.exports = Evaluation;