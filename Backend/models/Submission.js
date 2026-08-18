const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
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

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        githubLink: {
            type: String,
            required: true,
            trim: true
        },

        demoLink: {
            type: String,
            trim: true,
            default: ""
        },

        submissionDate: {
            type: Date,
            required: true,
            default: Date.now
        },

        status: {
            type: String,
            enum: ["draft", "submitted", "evaluated"],
            required: true,
            default: "draft"
        }
    },
    {
        timestamps: true
    }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;