import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Submissions() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [submissions, setSubmissions] = useState([]);
    const [teams, setTeams] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // ==========================================
    // LOAD SUBMISSIONS AND TEAMS
    // ==========================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [submissionResponse, teamResponse] = await Promise.all([
                api.get("/submissions"),
                api.get("/teams")
            ]);

            setSubmissions(
                submissionResponse.data.submissions || []
            );

            setTeams(
                teamResponse.data.teams || []
            );

        } catch (err) {
            console.error("Load submission data error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load submissions"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ==========================================
    // FIND CURRENT USER'S TEAMS
    // ==========================================

    const myTeams = teams.filter((team) => {
        const isLeader =
            team.leader?._id === user?.id;

        const isMember =
            team.members?.some(
                (member) => member._id === user?.id
            );

        return isLeader || isMember;
    });

    const myTeamIds = myTeams.map(
        (team) => team._id
    );

    // ==========================================
    // ONLY SHOW CURRENT USER'S SUBMISSIONS
    // ==========================================

    const mySubmissions = submissions.filter(
        (submission) =>
            submission.team?._id &&
            myTeamIds.includes(submission.team._id)
    );

    // ==========================================
    // CHECK TEAM LEADER
    // ==========================================

    const isTeamLeader = (submission) => {
        return (
            submission.team?.leader?._id === user?.id
        );
    };

    // ==========================================
    // SUBMIT PROJECT
    // ==========================================

    const submitProject = async (submissionId) => {
        const confirmed = window.confirm(
            "Are you sure you want to submit this project? You will not be able to edit it after evaluation."
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await api.patch(
                `/submissions/${submissionId}/submit`
            );

            setMessage(
                response.data.message ||
                "Project submitted successfully"
            );

            loadData();

        } catch (err) {
            console.error("Submit project error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to submit project"
            );
        }
    };

    // ==========================================
    // DELETE SUBMISSION
    // ==========================================

    const deleteSubmission = async (submissionId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this submission?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await api.delete(
                `/submissions/${submissionId}`
            );

            setMessage(
                response.data.message ||
                "Submission deleted successfully"
            );

            loadData();

        } catch (err) {
            console.error("Delete submission error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to delete submission"
            );
        }
    };

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
                return status;
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
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="submission-page">
                <div className="submission-loading">
                    Loading submissions...
                </div>
            </div>
        );
    }

    return (
        <div className="submission-page">

            {/* HEADER */}

            <div className="submission-header">

                <div>
                    <h1>My Submissions</h1>

                    <p>
                        Create, manage and submit your hackathon project.
                    </p>
                </div>

                <button
                    className="submission-primary-btn"
                    onClick={() =>
                        navigate("/participant/submissions/new")
                    }
                >
                    + Create Submission
                </button>

            </div>

            {/* SUCCESS MESSAGE */}

            {message && (
                <div className="submission-message success">
                    {message}
                </div>
            )}

            {/* ERROR MESSAGE */}

            {error && (
                <div className="submission-message error">
                    {error}
                </div>
            )}

            {/* INFORMATION */}

            {/* <div className="submission-info-box">
                <strong>Submission Flow</strong>

                <span>
                    Create a draft → Add project details → Save changes → Submit project
                </span>
            </div> */}

            {/* NO SUBMISSIONS */}

            {mySubmissions.length === 0 ? (

                <div className="submission-empty">

                    <div className="submission-empty-icon">
                        📁
                    </div>

                    <h2>No submissions yet</h2>

                    <p>
                        Create a submission for your team to upload your project details.
                    </p>

                    <button
                        className="submission-primary-btn"
                        onClick={() =>
                            navigate("/participant/submissions/new")
                        }
                    >
                        Create Your First Submission
                    </button>

                </div>

            ) : (

                <div className="submission-list">

                    {mySubmissions.map((submission) => {

                        const leader = isTeamLeader(submission);

                        return (
                            <div
                                className="submission-card"
                                key={submission._id}
                            >

                                {/* CARD HEADER */}

                                <div className="submission-card-header">

                                    <div>
                                        <h2>
                                            {submission.projectTitle}
                                        </h2>

                                        <p>
                                            Team:{" "}
                                            <strong>
                                                {submission.team?.teamName ||
                                                    "Unknown Team"}
                                            </strong>
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

                                {/* DESCRIPTION */}

                                <div className="submission-description">

                                    <h4>
                                        Project Description
                                    </h4>

                                    <p>
                                        {submission.description}
                                    </p>

                                </div>

                                {/* LINKS */}

                                <div className="submission-links">

                                    <div>
                                        <span>GitHub</span>

                                        <a
                                            href={submission.githubUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View Repository
                                        </a>
                                    </div>

                                    {submission.demoUrl && (
                                        <div>
                                            <span>Demo</span>

                                            <a
                                                href={submission.demoUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                View Demo
                                            </a>
                                        </div>
                                    )}

                                </div>

                                {/* DETAILS */}

                                <div className="submission-details">

                                    <div>
                                        <span>Hackathon</span>

                                        <strong>
                                            {submission.hackathon?.title ||
                                                "Unknown Hackathon"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Created</span>

                                        <strong>
                                            {formatDate(
                                                submission.submissionDate
                                            )}
                                        </strong>
                                    </div>

                                    {submission.hackathon?.submissionDeadline && (
                                        <div>
                                            <span>Deadline</span>

                                            <strong>
                                                {formatDate(
                                                    submission.hackathon
                                                        .submissionDeadline
                                                )}
                                            </strong>
                                        </div>
                                    )}

                                </div>

                                {/* ACTIONS */}

                                <div className="submission-actions">

                                    <button
                                        className="submission-secondary-btn"
                                        onClick={() =>
                                            navigate(
                                                `/participant/submissions/${submission._id}`
                                            )
                                        }
                                    >
                                        View
                                    </button>

                                    {leader &&
                                        submission.status !== "evaluated" && (
                                            <>
                                                <button
                                                    className="submission-edit-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/participant/submissions/${submission._id}/edit`
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                {submission.status === "draft" && (
                                                    <button
                                                        className="submission-submit-btn"
                                                        onClick={() =>
                                                            submitProject(
                                                                submission._id
                                                            )
                                                        }
                                                    >
                                                        Submit Project
                                                    </button>
                                                )}

                                                {submission.status !== "submitted" &&
                                                    submission.status !== "under_review" &&
                                                    submission.status !== "evaluated" && (
                                                        <button
                                                            className="submission-delete-btn"
                                                            onClick={() =>
                                                                deleteSubmission(
                                                                    submission._id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                            </>
                                        )}

                                </div>

                            </div>
                        );
                    })}

                </div>
            )}

        </div>
    );
}

export default Submissions;