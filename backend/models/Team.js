const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      trim: true
    },

    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true
    },

    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    // Mentor assigned to this team
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    status: {
      type: String,
      enum: ["forming", "ready", "submitted","completed"],
      default: "forming"
    }
  }
);

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;