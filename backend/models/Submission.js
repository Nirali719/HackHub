const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true
    },

    projectTitle: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    

    githubUrl: {
      type: String,
      required: true
    },

    demoUrl: {
      type: String
    },

    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "under_review",
        "evaluated"
      ],
      default: "draft"
    },

    submissionDate: {
      type: Date,
      required: true

    }
  },
  
);

const Submission = mongoose.model("Submission", submissionSchema);
module.exports = Submission;