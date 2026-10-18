const nodemailer = require("nodemailer");


// ==========================================
// BREVO SMTP TRANSPORTER
// ==========================================

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),

    // Port 587 -> false -> STARTTLS
    // Port 465 -> true  -> SSL/TLS
    secure:
        process.env.EMAIL_SECURE === "true" ||
        Number(process.env.EMAIL_PORT) === 465,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// ==========================================
// HTML SECURITY HELPER
// ==========================================

const escapeHtml = (value) => {
    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};


// ==========================================
// COMMON EMAIL SENDER
// ==========================================

const sendEmail = async ({
    to,
    subject,
    html
}) => {

    try {

        // Check email configuration
        if (
            !process.env.EMAIL_HOST ||
            !process.env.EMAIL_USER ||
            !process.env.EMAIL_PASS ||
            !process.env.EMAIL_FROM
        ) {

            console.error(
                "Email configuration is missing. Check your .env file."
            );

            return false;
        }


        // Check recipient
        if (!to) {

            console.error(
                "Email recipient is missing."
            );

            return false;
        }


        const info = await transporter.sendMail({

            from: process.env.EMAIL_FROM,

            to,

            subject,

            html
        });


        console.log(
            `Email sent successfully to ${to}`
        );

        console.log(
            `Message ID: ${info.messageId}`
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
// SMTP CONNECTION TEST
// ==========================================

const verifyEmailConnection = async () => {

    try {

        await transporter.verify();

        console.log(
            "Brevo SMTP connection verified successfully."
        );

        return true;

    } catch (error) {

        console.error(
            "Brevo SMTP connection failed:",
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
                    HackHub
                </h1>

                <h2>
                    Registration Confirmed
                </h2>

                <p>
                    Hello <strong>
                        ${escapeHtml(user.name)}
                    </strong>,
                </p>

                <p>
                    Your registration for
                    <strong>
                        ${escapeHtml(hackathon.title)}
                    </strong>
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
                        HackHub Team
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
                    HackHub
                </h1>

                <h2>
                    Deadline Reminder
                </h2>

                <p>
                    Hello <strong>
                        ${escapeHtml(user.name)}
                    </strong>,
                </p>

                <p>
                    This is a reminder that the
                    <strong>
                        ${deadlineLabel}
                    </strong>
                    for
                    <strong>
                        ${escapeHtml(hackathon.title)}
                    </strong>
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
                        HackHub Team
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
                    HackHub
                </h1>

                <h2>
                    Team Invitation
                </h2>

                <p>
                    Hello <strong>
                        ${escapeHtml(user.name)}
                    </strong>,
                </p>

                <p>
                    You have been added to the team
                    <strong>
                        ${escapeHtml(team.teamName)}
                    </strong>.
                </p>

                <p>
                    <strong>
                        Hackathon:
                    </strong>
                    ${escapeHtml(
                        hackathon?.title || "Hackathon"
                    )}
                </p>

                <p>
                    Please login to HackHub to view
                    your team details.
                </p>

                <p>
                    <strong>
                        HackHub Team
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

        const status =
            result.resultStatus
                ? String(result.resultStatus)
                    .replace(/_/g, " ")
                    .toUpperCase()
                : "RESULT PUBLISHED";


        resultText = `
            Your team has achieved the position:
            <strong>
                ${escapeHtml(status)}
            </strong>
            with a final score of
            <strong>
                ${escapeHtml(result.finalScore)}
            </strong>.
        `;
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
                    HackHub
                </h1>

                <h2>
                    Results Published
                </h2>

                <p>
                    Hello <strong>
                        ${escapeHtml(user.name)}
                    </strong>,
                </p>

                <p>
                    The results for
                    <strong>
                        ${escapeHtml(hackathon.title)}
                    </strong>
                    have been published.
                </p>

                <p>
                    ${resultText}
                </p>

                <p>
                    Login to HackHub to view the
                    complete leaderboard and certificates.
                </p>

                <p>
                    <strong>
                        HackHub Team
                    </strong>
                </p>

            </div>
        `
    });
};


// ==========================================
// EXPORTS
// ==========================================

module.exports = {

    sendEmail,

    verifyEmailConnection,

    sendRegistrationConfirmation,

    sendDeadlineReminder,

    sendTeamInvitation,

    sendResultAnnouncement
};