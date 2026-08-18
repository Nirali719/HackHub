const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        hackathonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hackathon",
            required: true
        },

        registrationDate: {
            type: Date,
            required: true,
            default: Date.now
        },

        status: {
            type: String,
            enum: ["registered", "cancelled", "completed"],
            required: true,
            default: "registered"
        }
    },
    {
        timestamps: true
    }
);

const Registration = mongoose.model("Registration", registrationSchema);

module.exports = Registration;