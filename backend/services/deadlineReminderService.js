const Hackathon =
    require("../models/Hackathon");

const Registration =
    require("../models/Registration");

const User =
    require("../models/User");

const {
    sendDeadlineReminder
} = require(
    "./emailService"
);


const sendDeadlineReminders =
    async () => {

        try {

            const now =
                new Date();

            const tomorrow =
                new Date(
                    now.getTime() +
                    24 *
                    60 *
                    60 *
                    1000
                );


            // ======================================
            // REGISTRATION DEADLINES
            // ======================================

            const registrationHackathons =
                await Hackathon.find({

                    registrationDeadline: {
                        $gte: now,
                        $lte: tomorrow
                    },

                    status: {
                        $in: [
                            "published",
                            "ongoing"
                        ]
                    }
                });


            const participants =
                await User.find({
                    role: "participant"
                }).select(
                    "name email"
                );


            for (
                const hackathon
                of registrationHackathons
            ) {

                for (
                    const user
                    of participants
                ) {

                    const registration =
                        await Registration.findOne({
                            participant:
                                user._id,

                            hackathon:
                                hackathon._id
                        });


                    // Only remind users who
                    // haven't registered yet.

                    if (!registration) {

                        await sendDeadlineReminder({
                            user,
                            hackathon,
                            deadlineType:
                                "registration"
                        });
                    }
                }
            }


            // ======================================
            // SUBMISSION DEADLINES
            // ======================================

            const submissionHackathons =
                await Hackathon.find({

                    submissionDeadline: {
                        $gte: now,
                        $lte: tomorrow
                    },

                    status: {
                        $in: [
                            "published",
                            "ongoing"
                        ]
                    }
                });


            for (
                const hackathon
                of submissionHackathons
            ) {

                const registrations =
                    await Registration.find({
                        hackathon:
                            hackathon._id,

                        status: {
                            $ne: "cancelled"
                        }
                    }).populate(
                        "participant",
                        "name email"
                    );


                for (
                    const registration
                    of registrations
                ) {

                    if (
                        registration.participant
                    ) {

                        await sendDeadlineReminder({
                            user:
                                registration.participant,

                            hackathon,

                            deadlineType:
                                "submission"
                        });
                    }
                }
            }


        } catch (error) {

            console.error(
                "Deadline Reminder Error:",
                error
            );
        }
    };


module.exports = {
    sendDeadlineReminders
};