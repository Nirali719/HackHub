const mongoose = require("mongoose");


const resultSchema = new mongoose.Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true
    },


    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true
    },


    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true
    },


    finalScore: {
      type: Number,
      required: true,
      min: 0
    },

    resultStatus: {
      type: String,
      enum: ["winner", "runner_up", "finalist", "participant"],
      default: "participant"
    },

  },
  {
    timestamps: true
  }
);


const Result = mongoose.model("Result", resultSchema);

module.exports = Result;