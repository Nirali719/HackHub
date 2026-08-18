const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema({
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

    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    eligibility: {
        type: String
    },
  
    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    registrationDeadline: {
        type: Date,
        required: true
    },

    submissionDeadline: {
        type: Date,
        required: true
    },

    maxTeamSize: {
        type: Number,
        required: true,
        min: 1
    },

    status: {
        type: String,
        enum: ["upcoming", "ongoing", "completed", "cancelled"],
        required: true,
        default: "upcoming"
    }
});

const Hackathon = mongoose.model("Hackathon", hackathonSchema);

module.exports = Hackathon;