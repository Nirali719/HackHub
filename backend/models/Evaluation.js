const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema({
    // projectId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Project",
    //     required: true
    // },
    submission: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Submission",
  required: true
},

    judgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },

    remarks: {
        type: String,
        required: true,
        trim: true
    }
});

const Evaluation = mongoose.model("Evaluation", evaluationSchema);

module.exports = Evaluation;