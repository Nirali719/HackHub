const Hackathon =
    require("../models/Hackathon");

const Registration =
    require("../models/Registration");

const User =
    require("../models/User");

const DeadlineReminder =
    require("../models/DeadlineReminder");

const {
    sendDeadlineReminder
} = require("./emailService");


// ==========================================
// R.9.2
// DEADLINE REMINDER SERVICE
// ==========================================

const sendDeadlineReminders = async () => {

    try {

        const now = new Date();

        /*
         * We consider a deadline "approaching"
         * when it is within the next 24 hours.
         */
        const tomorrow = new Date(
            now.getTime() +
            24 * 60 * 60 * 1000
        );


        // ==========================================
        // GET ACTIVE HACKATHONS
        // ==========================================

        const hackathons =
            await Hackathon.find({
                status: {
                    $in: [
                        "published",
                        "ongoing"
                    ]
                },

                $or: [

                    {
                        registrationDeadline: {
                            $gte: now,
                            $lte: tomorrow
                        }
                    },

                    {
                        submissionDeadline: {
                            $gte: now,
                            $lte: tomorrow
                        }
                    }

                ]
            });


        if (hackathons.length === 0) {

            console.log(
                "No upcoming deadlines within 24 hours."
            );

            return;
        }


        console.log(
            `Checking ${hackathons.length} hackathon(s) for deadline reminders...`
        );


        // ==========================================
        // PROCESS EACH HACKATHON
        // ==========================================

        for (
            const hackathon
            of hackathons
        ) {


            // ======================================
            // REGISTRATION DEADLINE
            // ======================================

            const registrationDeadline =
                hackathon.registrationDeadline;


            if (
                registrationDeadline >= now &&
                registrationDeadline <= tomorrow
            ) {

                const participants =
                    await User.find({
                        role: "participant"
                    }).select(
                        "name email"
                    );


                for (
                    const user
                    of participants
                ) {

                    /*
                     * Check whether the participant
                     * has already registered.
                     */
                    const registration =
                        await Registration.findOne({
                            participant:
                                user._id,

                            hackathon:
                                hackathon._id
                        });


                    /*
                     * Only remind users who have
                     * NOT registered yet.
                     */
                    if (registration) {
                        continue;
                    }


                    /*
                     * Check whether this reminder
                     * has already been sent.
                     */
                    const alreadySent =
                        await DeadlineReminder.findOne({
                            user:
                                user._id,

                            hackathon:
                                hackathon._id,

                            deadlineType:
                                "registration",

                            deadline:
                                registrationDeadline
                        });


                    if (alreadySent) {
                        continue;
                    }


                    // Send email
                    const emailSent =
                        await sendDeadlineReminder({

                            user,

                            hackathon,

                            deadlineType:
                                "registration"
                        });


                    /*
                     * Store the reminder only if
                     * the email was actually sent.
                     */
                    if (emailSent) {

                        try {

                            await DeadlineReminder.create({

                                user:
                                    user._id,

                                hackathon:
                                    hackathon._id,

                                deadlineType:
                                    "registration",

                                deadline:
                                    registrationDeadline
                            });

                        } catch (error) {

                            /*
                             * Ignore duplicate-key errors.
                             * This can happen if two scheduler
                             * executions happen at the same time.
                             */

                            if (
                                error.code !== 11000
                            ) {

                                console.error(
                                    "Error saving registration reminder:",
                                    error.message
                                );
                            }
                        }
                    }
                }
            }


            // ======================================
            // SUBMISSION DEADLINE
            // ======================================

            const submissionDeadline =
                hackathon.submissionDeadline;


            if (
                submissionDeadline >= now &&
                submissionDeadline <= tomorrow
            ) {


                /*
                 * Only registered participants
                 * should receive submission reminders.
                 */
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
                        !registration.participant
                    ) {
                        continue;
                    }


                    const user =
                        registration.participant;


                    /*
                     * Check whether this reminder
                     * has already been sent.
                     */
                    const alreadySent =
                        await DeadlineReminder.findOne({

                            user:
                                user._id,

                            hackathon:
                                hackathon._id,

                            deadlineType:
                                "submission",

                            deadline:
                                submissionDeadline
                        });


                    if (alreadySent) {
                        continue;
                    }


                    // Send email
                    const emailSent =
                        await sendDeadlineReminder({

                            user,

                            hackathon,

                            deadlineType:
                                "submission"
                        });


                    /*
                     * Store successful reminder.
                     */
                    if (emailSent) {

                        try {

                            await DeadlineReminder.create({

                                user:
                                    user._id,

                                hackathon:
                                    hackathon._id,

                                deadlineType:
                                    "submission",

                                deadline:
                                    submissionDeadline
                            });

                        } catch (error) {

                            if (
                                error.code !== 11000
                            ) {

                                console.error(
                                    "Error saving submission reminder:",
                                    error.message
                                );
                            }
                        }
                    }
                }
            }
        }


        console.log(
            "Deadline reminder check completed."
        );

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