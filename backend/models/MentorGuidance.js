const mongoose = require("mongoose");

const mentorGuidanceSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const MentorGuidance = mongoose.model(
  "MentorGuidance",
  mentorGuidanceSchema
);

module.exports = MentorGuidance;