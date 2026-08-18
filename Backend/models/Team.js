const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
{
    teamName: {
        type: String,
        required: true,
        trim: true
    },

    hackathonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hackathon",
        required: true
    },

    leaderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
},
{
    timestamps: true
}
    
);

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;