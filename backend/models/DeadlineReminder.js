const mongoose = require("mongoose");

const deadlineReminderSchema = new mongoose.Schema(
    {
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

        deadlineType: {
            type: String,
            enum: [
                "registration",
                "submission"
            ],
            required: true
        },

        deadline: {
            type: Date,
            required: true
        },

        sentAt: {
            type: Date,
            default: Date.now
        }
    }
);

/*
 * Prevent sending the same reminder
 * to the same user more than once
 * for the same deadline.
 */
deadlineReminderSchema.index(
    {
        user: 1,
        hackathon: 1,
        deadlineType: 1,
        deadline: 1
    },
    {
        unique: true
    }
);

const DeadlineReminder =
    mongoose.model(
        "DeadlineReminder",
        deadlineReminderSchema
    );

module.exports = DeadlineReminder;