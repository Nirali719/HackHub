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
            type: String,
            default: ""
        },

        // ==========================================
        // SUBMISSION PDF
        // ==========================================

        pdfFileName: {
            type: String,
            default: null
        },

        pdfOriginalName: {
            type: String,
            default: null
        },

        pdfFilePath: {
            type: String,
            default: null
        },

        pdfSize: {
            type: Number,
            default: 0
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
            default: Date.now
        }
    },
    {
        timestamps: true
    }
    
);


const Submission =
    mongoose.model(
        "Submission",
        submissionSchema
    );

module.exports = Submission;