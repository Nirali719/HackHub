const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
    {
        certificateNumber: {
            type: String,
            required: true,
            unique: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        hackathon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hackathon",
            required: true
        },

        result: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Result",
            default: null
        },

        type: {
            type: String,
            enum: ["participation", "winner"],
            required: true
        },

        fileName: {
            type: String,
            required: true
        },

        generatedAt: {
            type: Date,
            default: Date.now
        }
    }
);

certificateSchema.index(
    {
        user: 1,
        hackathon: 1,
        type: 1
    },
    {
        unique: true
    }
);

const Certificate = mongoose.model(
    "Certificate",
    certificateSchema
);

module.exports = Certificate;