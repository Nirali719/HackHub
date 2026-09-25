import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function SubmissionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [submission, setSubmission] = useState(null);
    const [team, setTeam] = useState(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // ==========================================
    // LOAD SUBMISSION + TEAM
    // ==========================================

    const loadSubmission = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/submissions/${id}`
            );

            console.log(
                "Submission details:",
                response.data
            );

            const submissionData =
                response.data.submission ||
                response.data;

            setSubmission(submissionData);

            // ------------------------------------------
            // Load complete team information
            // ------------------------------------------

            const teamId =
                submissionData.team?._id ||
                submissionData.team;

            if (teamId) {
                try {
                    const teamResponse = await api.get(
                        `/teams/${teamId}`
                    );

                    console.log(
                        "Team details:",
                        teamResponse.data
                    );

                    setTeam(
                        teamResponse.data.team ||
                        teamResponse.data
                    );

                } catch (teamError) {
                    console.error(
                        "Load team error:",
                        teamError
                    );
                }
            }

        } catch (err) {
            console.error(
                "Load submission error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load submission"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubmission();
    }, [id]);

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "Not available";
        }

        return new Date(date).toLocaleString();
    };

    // ==========================================
    // STATUS LABEL
    // ==========================================

    const getStatusLabel = (status) => {
        switch (status) {
            case "draft":
                return "Draft";

            case "submitted":
                return "Submitted";

            case "under_review":
                return "Under Review";

            case "evaluated":
                return "Evaluated";

            default:
                return status || "Unknown";
        }
    };

    // ==========================================
    // STATUS CLASS
    // ==========================================

    const getStatusClass = (status) => {
        switch (status) {
            case "draft":
                return "submission-status draft";

            case "submitted":
                return "submission-status submitted";

            case "under_review":
                return "submission-status review";

            case "evaluated":
                return "submission-status evaluated";

            default:
                return "submission-status";
        }
    };

    // ==========================================
    // FINAL SUBMIT
    // ==========================================

    const handleFinalSubmit = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to submit this project?\n\nAfter final submission, the submission will change from Draft to Submitted."
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            const response = await api.patch(
                `/submissions/${id}/submit`
            );

            console.log(
                "Final submission response:",
                response.data
            );

            setMessage(
                "Project submitted successfully."
            );

            // Reload submission so status changes immediately
            await loadSubmission();

        } catch (err) {
            console.error(
                "Final submission error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to submit project"
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ==========================================
    // DELETE SUBMISSION
    // ==========================================

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this submission?\n\nThis action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            await api.delete(
                `/submissions/${id}`
            );

            alert(
                "Submission deleted successfully."
            );

            navigate(
                "/participant/submissions"
            );

        } catch (err) {
            console.error(
                "Delete submission error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to delete submission"
            );

            setActionLoading(false);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="submission-page">
                <div className="submission-loading">
                    Loading submission...
                </div>
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error && !submission) {
        return (
            <div className="submission-page">

                <div className="submission-message error">
                    {error}
                </div>

                <button
                    className="submission-secondary-btn"
                    onClick={() =>
                        navigate(
                            "/participant/submissions"
                        )
                    }
                >
                    ← Back to Submissions
                </button>

            </div>
        );
    }

    // ==========================================
    // NOT FOUND
    // ==========================================

    if (!submission) {
        return (
            <div className="submission-page">

                <div className="submission-empty">

                    <h2>
                        Submission not found
                    </h2>

                    <p>
                        The requested submission
                        could not be found.
                    </p>

                    <button
                        className="submission-primary-btn"
                        onClick={() =>
                            navigate(
                                "/participant/submissions"
                            )
                        }
                    >
                        Back to Submissions
                    </button>

                </div>

            </div>
        );
    }

    // ==========================================
    // TEAM DATA
    // ==========================================

    const teamName =
        team?.teamName ||
        submission.team?.teamName ||
        "Not available";

    const teamStatus =
        team?.status ||
        submission.team?.status ||
        "Not available";

    const teamLeader =
        team?.leader ||
        null;

   const teamMembers = (team?.members || []).filter(
    (member) =>
        member._id?.toString() !==
        team?.leader?._id?.toString()
);

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="submission-page">

            {/* =====================================
                HEADER
            ====================================== */}

            <div className="submission-form-header">

                <div>
                    <h1>
                        Submission Details
                    </h1>

                    <p>
                        View complete information
                        about your project submission.
                    </p>
                </div>

                <button
                    className="submission-secondary-btn"
                    onClick={() =>
                        navigate(
                            "/participant/submissions"
                        )
                    }
                >
                    ← Back
                </button>

            </div>


            {/* =====================================
                SUCCESS / ERROR MESSAGE
            ====================================== */}

            {message && (
                <div className="submission-message success">
                    {message}
                </div>
            )}

            {error && (
                <div className="submission-message error">
                    {error}
                </div>
            )}


            {/* =====================================
                MAIN CARD
            ====================================== */}

            <div className="submission-details-page-card">

                {/* =================================
                    TITLE + STATUS
                ================================== */}

                <div className="submission-details-top">

                    <div>

                        <h2>
                            {submission.projectTitle}
                        </h2>

                        <p>
                            {submission.hackathon?.title ||
                                "Hackathon"}
                        </p>

                    </div>

                    <span
                        className={getStatusClass(
                            submission.status
                        )}
                    >
                        {getStatusLabel(
                            submission.status
                        )}
                    </span>

                </div>


                {/* =================================
                    PROJECT DESCRIPTION
                ================================== */}

                <div className="submission-detail-section">

                    <h3>
                        Project Description
                    </h3>

                    <p className="submission-detail-description">
                        {submission.description ||
                            "No description provided."}
                    </p>

                </div>


                {/* =================================
                    TEAM INFORMATION
                ================================== */}

                <div className="submission-detail-section">

                    <h3>
                        Team Information
                    </h3>

                    <div className="submission-detail-grid">

                        <div className="submission-detail-item">

                            <span>
                                Team Name
                            </span>

                            <strong>
                                {teamName}
                            </strong>

                        </div>


                        <div className="submission-detail-item">

                            <span>
                                Team Status
                            </span>

                            <strong>
                                {teamStatus}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================
                    TEAM LEADER
                ================================== */}

                <div className="submission-detail-section">

                    <h3>
                        Team Leader
                    </h3>

                    {teamLeader ? (

                        <div className="submission-member">

                            <div className="submission-member-avatar">
                                {teamLeader.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "L"}
                            </div>

                            <div>

                                <strong>
                                    {teamLeader.name}
                                </strong>

                                <span>
                                    {teamLeader.email}
                                </span>

                                {teamLeader.college && (
                                    <span>
                                        {teamLeader.college}
                                    </span>
                                )}

                            </div>

                        </div>

                    ) : (

                        <p className="submission-detail-description">
                            Team leader information
                            not available.
                        </p>

                    )}

                </div>


                {/* =================================
                    TEAM MEMBERS
                ================================== */}

                <div className="submission-detail-section">

                    <h3>
                        Team Members
                    </h3>

                    {teamMembers.length > 0 ? (

                        <div className="submission-team-members">

                            {teamMembers.map(
                                (member) => (

                                    <div
                                        className="submission-member"
                                        key={member._id}
                                    >

                                        <div className="submission-member-avatar">

                                            {member.name
                                                ?.charAt(0)
                                                ?.toUpperCase() || "U"}

                                        </div>

                                        <div>

                                            <strong>
                                                {member.name}
                                            </strong>

                                            <span>
                                                {member.email}
                                            </span>

                                            {member.college && (
                                                <span>
                                                    {member.college}
                                                </span>
                                            )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <p className="submission-detail-description">
                            No team members found.
                        </p>

                    )}

                </div>


                {/* =================================
                    PROJECT LINKS
                ================================== */}

                <div className="submission-detail-section">

                    <h3>
                        Project Links
                    </h3>

                    <div className="submission-project-links">

                        {submission.githubUrl && (

                            <a
                                href={submission.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="submission-project-link"
                            >

                                <span>
                                    GitHub Repository
                                </span>

                                <strong>
                                    Open Repository →
                                </strong>

                            </a>

                        )}


                        {submission.demoUrl && (

                            <a
                                href={submission.demoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="submission-project-link"
                            >

                                <span>
                                    Live Demo
                                </span>

                                <strong>
                                    Open Demo →
                                </strong>

                            </a>

                        )}

                        {!submission.githubUrl &&
                            !submission.demoUrl && (

                                <p className="submission-detail-description">
                                    No project links provided.
                                </p>

                            )}

                    </div>

                </div>


                {/* =================================
                    SUBMISSION INFORMATION
                ================================== */}

                <div className="submission-detail-section">

                    <h3>
                        Submission Information
                    </h3>

                    <div className="submission-detail-grid">

                        <div className="submission-detail-item">

                            <span>
                                Submission ID
                            </span>

                            <strong className="submission-id">
                                {submission._id}
                            </strong>

                        </div>


                        <div className="submission-detail-item">

                            <span>
                                Status
                            </span>

                            <strong>
                                {getStatusLabel(
                                    submission.status
                                )}
                            </strong>

                        </div>


                        <div className="submission-detail-item">

                            <span>
                                Submission Date
                            </span>

                            <strong>
                                {formatDate(
                                    submission.submissionDate
                                )}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================
                    ACTION BUTTONS
                ================================== */}

                <div className="submission-detail-actions">

                    <button
                        className="submission-secondary-btn"
                        onClick={() =>
                            navigate(
                                "/participant/submissions"
                            )
                        }
                    >
                        ← Back to Submissions
                    </button>


                    {/* EDIT */}

                    {submission.status !== "evaluated" &&
                        submission.status !== "submitted" &&
                        submission.status !== "under_review" && (

                            <button
                                className="submission-edit-btn"
                                onClick={() =>
                                    navigate(
                                        `/participant/submissions/${submission._id}/edit`
                                    )
                                }
                            >
                                Edit Submission
                            </button>

                        )}


                    {/* DELETE */}

                    {submission.status === "draft" && (

                        <button
                            className="submission-delete-btn"
                            onClick={handleDelete}
                            disabled={actionLoading}
                        >
                            {actionLoading
                                ? "Deleting..."
                                : "Delete Submission"}
                        </button>

                    )}


                    {/* FINAL SUBMIT */}

                    {submission.status === "draft" && (

                        <button
                            className="submission-submit-btn"
                            onClick={handleFinalSubmit}
                            disabled={actionLoading}
                        >
                            {actionLoading
                                ? "Submitting..."
                                : "Final Submit"}
                        </button>

                    )}

                </div>

            </div>

        </div>
    );
}

export default SubmissionDetails;