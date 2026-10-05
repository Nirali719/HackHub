import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import EvaluationResults from "../components/EvaluationResults";

const MentorTeamDetails = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [team, setTeam] = useState(null);

    const [submission, setSubmission] = useState(null);

    const [guidance, setGuidance] = useState([]);
    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    useEffect(() => {
        loadTeam();
        loadGuidance();
        loadSubmission(id);
    }, [id]);


    const loadTeam = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                `/teams/${id}`
            );

            setTeam(response.data.team);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load team."
            );

        } finally {

            setLoading(false);

        }
    };

const loadSubmission = async (teamId) => {
    try {
        console.log("=================================");
        console.log("Loading submission");
        console.log("Team ID:", teamId);

        const response = await api.get(
            `/submissions/team/${teamId}`
        );

        console.log("Submission API response:", response.data);

        if (response.data?.success && response.data?.submission) {
            console.log(
                "FOUND SUBMISSION:",
                response.data.submission
            );

            setSubmission(response.data.submission);
        } else {
            console.log("NO SUBMISSION IN RESPONSE");
            setSubmission(null);
        }

    } catch (err) {

        console.error(
            "SUBMISSION API ERROR:",
            err.response?.data || err
        );

        console.error(
            "Status:",
            err.response?.status
        );

        setSubmission(null);
    }
};

    const loadGuidance = async () => {

        try {

            const response = await api.get(
                `/teams/${id}/guidance`
            );

            setGuidance(
                response.data.guidance || []
            );

        } catch (err) {

            console.error("Guidance error:", err);

        }
    };


    const sendGuidance = async (e) => {

        e.preventDefault();

        if (!message.trim()) {
            return;
        }


        try {

            setSending(true);
            setSuccess("");
            setError("");

            await api.post(
                `/teams/${id}/guidance`,
                {
                    message: message.trim()
                }
            );

            setMessage("");

            setSuccess(
                "Guidance sent successfully."
            );

            await loadGuidance();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to send guidance."
            );

        } finally {

            setSending(false);

        }
    };


    if (loading) {

        return (
            <div className="mentor-loading">
                Loading team details...
            </div>
        );

    }


    if (!team) {

        return (
            <div className="mentor-error-page">

                <div className="mentor-error">
                    {error || "Team could not be found."}
                </div>

                <button
                    className="mentor-outline-button"
                    onClick={() => navigate("/mentor")}
                >
                    ← Back to Dashboard
                </button>

            </div>
        );

    }


    return (
        <div className="mentor-team-details-page">

            {/* ================= HEADER ================= */}

            <div className="mentor-details-header">

                <button
                    className="mentor-back-button"
                    onClick={() =>
                        navigate("/mentor/teams")
                    }
                >
                    ← Back to Assigned Teams
                </button>


                <div>

                    <p className="mentor-eyebrow">
                        TEAM DETAILS
                    </p>

                    <div className="mentor-details-title">

                        <h1>
                            {team.teamName}
                        </h1>

                        <span className="mentor-status-badge">
                            {team.status || "forming"}
                        </span>

                    </div>

                    <p>
                        {team.hackathon?.title}
                    </p>

                </div>

            </div>


            {error && (
                <div className="mentor-error">
                    {error}
                </div>
            )}


            {success && (
                <div className="mentor-success">
                    {success}
                </div>
            )}


            {/* ================= MAIN GRID ================= */}

            <div className="mentor-details-grid">


                {/* ================= LEFT ================= */}

                <div className="mentor-details-left">


                    {/* TEAM INFORMATION */}

                    <section className="mentor-white-card">

                        <div className="mentor-card-heading">

                            <div>
                                <h2>
                                    Team Information
                                </h2>

                                <p>
                                    Basic information about this team.
                                </p>
                            </div>

                        </div>


                        <div className="mentor-info-list">

                            <div className="mentor-info-row">

                                <span>
                                    Team Name
                                </span>

                                <strong>
                                    {team.teamName}
                                </strong>

                            </div>


                            <div className="mentor-info-row">

                                <span>
                                    Hackathon
                                </span>

                                <strong>
                                    {team.hackathon?.title || "—"}
                                </strong>

                            </div>


                            <div className="mentor-info-row">

                                <span>
                                    Hackathon Status
                                </span>

                                <strong>
                                    {team.hackathon?.status || "—"}
                                </strong>

                            </div>


                            <div className="mentor-info-row">

                                <span>
                                    Team Status
                                </span>

                                <strong>
                                    {team.status || "—"}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* TEAM LEADER */}

                    <section className="mentor-white-card">

                        <div className="mentor-card-heading">

                            <div>
                                <h2>
                                    Team Leader
                                </h2>

                                <p>
                                    Leader of this team.
                                </p>
                            </div>

                        </div>


                        <div className="mentor-person-card">

                            <div className="mentor-person-avatar">
                                {team.leader?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}
                            </div>

                            <div>

                                <strong>
                                    {team.leader?.name || "—"}
                                </strong>

                                <span>
                                    {team.leader?.email || "—"}
                                </span>

                            </div>

                        </div>

                    </section>


                    {/* MEMBERS */}

                    <section className="mentor-white-card">

                        <div className="mentor-card-heading">

                            <div>
                                <h2>
                                    Team Members
                                </h2>

                                <p>
                                    {team.members?.length || 0} members
                                </p>
                            </div>

                        </div>


                        <div className="mentor-members-list">

                            {team.members?.map((member) => (

                                <div
                                    className="mentor-member"
                                    key={member._id}
                                >

                                    <div className="mentor-member-avatar">
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

                                    </div>


                                    {member._id === team.leader?._id && (

                                        <span className="mentor-leader-badge">
                                            Leader
                                        </span>

                                    )}

                                </div>

                            ))}

                        </div>

                    </section>

                </div>


                {/* ================= RIGHT ================= */}

                <div className="mentor-details-right">


                    {/* GUIDANCE FORM */}

                    <section className="mentor-white-card guidance-card">

                        <div className="mentor-card-heading">

                            <div>

                                <h2>
                                    Mentor Guidance
                                </h2>

                                <p>
                                    Provide feedback and suggestions
                                    to help this team improve.
                                </p>

                            </div>

                            <div className="guidance-icon">
                                💬
                            </div>

                        </div>


                        <form onSubmit={sendGuidance}>

                            <label>
                                Write Guidance
                            </label>

                            <textarea
                                value={message}
                                onChange={(e) =>
                                    setMessage(e.target.value)
                                }
                                placeholder="Write your feedback, suggestions or guidance for this team..."
                                rows="7"
                            />


                            <div className="guidance-form-footer">

                                <span>
                                    Your guidance will be visible
                                    to the team.
                                </span>

                                <button
                                    type="submit"
                                    className="mentor-primary-button"
                                    disabled={
                                        sending ||
                                        !message.trim()
                                    }
                                >
                                    {sending
                                        ? "Sending..."
                                        : "Send Guidance"}
                                </button>

                            </div>

                        </form>

                    </section>


                    {/* PREVIOUS GUIDANCE */}

                    <section className="mentor-white-card">

                        <div className="mentor-card-heading">

                            <div>

                                <h2>
                                    Previous Guidance
                                </h2>

                                <p>
                                    Feedback already provided to this team.
                                </p>

                            </div>

                        </div>


                        {guidance.length === 0 ? (

                            <div className="guidance-empty">

                                <span>
                                    💬
                                </span>

                                <p>
                                    No guidance has been provided yet.
                                </p>

                            </div>

                        ) : (

                            <div className="guidance-history">

                                {guidance.map((item) => (

                                    <div
                                        className="guidance-item"
                                        key={item._id}
                                    >

                                        <div className="guidance-item-header">

                                            <div className="guidance-author">

                                                <div className="mentor-person-avatar small">
                                                    {item.mentor?.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "M"}
                                                </div>

                                                <div>

                                                    <strong>
                                                        {item.mentor?.name || "Mentor"}
                                                    </strong>

                                                    <span>
                                                        Mentor
                                                    </span>

                                                </div>

                                            </div>


                                            <span className="guidance-date">

                                                {item.createdAt
                                                    ? new Date(
                                                        item.createdAt
                                                    ).toLocaleString()
                                                    : ""}
                                            </span>

                                        </div>


                                        <p>
                                            {item.message}
                                        </p>

                                    </div>

                                ))}

                            </div>

                        )}

                    </section>

                </div>

            
             </div>
            {submission ? (
    <EvaluationResults
        submissionId={submission._id}
    />
) : (
    <div className="evaluation-results-empty">
        <h3>Project Not Submitted</h3>
        <p>
            This team has not submitted a project yet.
            Evaluation results will appear after the project is submitted.
        </p>
    </div>
)}

        </div>
        
    );
};

export default MentorTeamDetails;

