const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT) === 465,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// ==========================================
// COMMON EMAIL SENDER
// ==========================================

const sendEmail = async ({
    to,
    subject,
    html
}) => {

    try {

        if (
            !process.env.EMAIL_USER ||
            !process.env.EMAIL_PASS
        ) {
            console.error(
                "Email configuration is missing."
            );

            return false;
        }

        await transporter.sendMail({
            from:
                process.env.EMAIL_FROM ||
                process.env.EMAIL_USER,

            to,

            subject,

            html
        });

        console.log(
            `Email sent successfully to ${to}`
        );

        return true;

    } catch (error) {

        console.error(
            "Email Sending Error:",
            error.message
        );

        return false;
    }
};


// ==========================================
// R.9.1
// REGISTRATION CONFIRMATION
// ==========================================

const sendRegistrationConfirmation = async ({
    user,
    hackathon
}) => {

    return sendEmail({

        to: user.email,

        subject:
            `Registration Confirmed - ${hackathon.title}`,

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 650px;
                margin: auto;
                padding: 30px;
                border: 1px solid #ddd;
                border-radius: 10px;
            ">

                <h1>
                    HackForge
                </h1>

                <h2>
                    Registration Confirmed
                </h2>

                <p>
                    Hello <strong>${user.name}</strong>,
                </p>

                <p>
                    Your registration for
                    <strong>${hackathon.title}</strong>
                    has been successfully created.
                </p>

                <p>
                    We are happy to have you participate
                    in this hackathon.
                </p>

                <hr />

                <p>
                    <strong>
                        Registration Deadline:
                    </strong>
                    ${new Date(
                        hackathon.registrationDeadline
                    ).toLocaleString("en-IN")}
                </p>

                <p>
                    <strong>
                        Submission Deadline:
                    </strong>
                    ${new Date(
                        hackathon.submissionDeadline
                    ).toLocaleString("en-IN")}
                </p>

                <p>
                    Good luck!
                </p>

                <p>
                    <strong>
                        HackForge Team
                    </strong>
                </p>

            </div>
        `
    });
};


// ==========================================
// R.9.2
// DEADLINE REMINDER
// ==========================================

const sendDeadlineReminder = async ({
    user,
    hackathon,
    deadlineType
}) => {

    const deadline =
        deadlineType === "registration"
            ? hackathon.registrationDeadline
            : hackathon.submissionDeadline;

    const deadlineLabel =
        deadlineType === "registration"
            ? "Registration Deadline"
            : "Submission Deadline";

    return sendEmail({

        to: user.email,

        subject:
            `${deadlineLabel} Approaching - ${hackathon.title}`,

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 650px;
                margin: auto;
                padding: 30px;
                border: 1px solid #ddd;
                border-radius: 10px;
            ">

                <h1>
                    HackForge
                </h1>

                <h2>
                    Deadline Reminder
                </h2>

                <p>
                    Hello <strong>${user.name}</strong>,
                </p>

                <p>
                    This is a reminder that the
                    <strong>${deadlineLabel}</strong>
                    for
                    <strong>${hackathon.title}</strong>
                    is approaching.
                </p>

                <p>
                    <strong>
                        Deadline:
                    </strong>
                    ${new Date(
                        deadline
                    ).toLocaleString("en-IN")}
                </p>

                <p>
                    Please complete the required action
                    before the deadline.
                </p>

                <p>
                    <strong>
                        HackForge Team
                    </strong>
                </p>

            </div>
        `
    });
};


// ==========================================
// R.9.3
// TEAM INVITATION
// ==========================================

const sendTeamInvitation = async ({
    user,
    team,
    hackathon
}) => {

    return sendEmail({

        to: user.email,

        subject:
            `Team Invitation - ${team.teamName}`,

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 650px;
                margin: auto;
                padding: 30px;
                border: 1px solid #ddd;
                border-radius: 10px;
            ">

                <h1>
                    HackForge
                </h1>

                <h2>
                    Team Invitation
                </h2>

                <p>
                    Hello <strong>${user.name}</strong>,
                </p>

                <p>
                    You have been added to the team
                    <strong>${team.teamName}</strong>.
                </p>

                <p>
                    <strong>Hackathon:</strong>
                    ${hackathon?.title || "Hackathon"}
                </p>

                <p>
                    Please login to HackForge to view
                    your team details.
                </p>

                <p>
                    <strong>
                        HackForge Team
                    </strong>
                </p>

            </div>
        `
    });
};


// ==========================================
// R.9.4
// RESULT ANNOUNCEMENT
// ==========================================

const sendResultAnnouncement = async ({
    user,
    hackathon,
    result
}) => {

    let resultText =
        "Your hackathon result has been published.";

    if (result) {

        resultText =
            `Your team has achieved the position:
            <strong>
                ${result.resultStatus.replace("_", " ").toUpperCase()}
            </strong>
            with a final score of
            <strong>
                ${result.finalScore}
            </strong>.`;
    }

    return sendEmail({

        to: user.email,

        subject:
            `Hackathon Results Published - ${hackathon.title}`,

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 650px;
                margin: auto;
                padding: 30px;
                border: 1px solid #ddd;
                border-radius: 10px;
            ">

                <h1>
                    HackForge
                </h1>

                <h2>
                    Results Published
                </h2>

                <p>
                    Hello <strong>${user.name}</strong>,
                </p>

                <p>
                    The results for
                    <strong>${hackathon.title}</strong>
                    have been published.
                </p>

                <p>
                    ${resultText}
                </p>

                <p>
                    Login to HackForge to view the
                    complete leaderboard and certificates.
                </p>

                <p>
                    <strong>
                        HackForge Team
                    </strong>
                </p>

            </div>
        `
    });
};


module.exports = {
    sendEmail,
    sendRegistrationConfirmation,
    sendDeadlineReminder,
    sendTeamInvitation,
    sendResultAnnouncement
};