import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function MyTeam() {
    const navigate = useNavigate();


    const [teams, setTeams] = useState([]);
    const [guidance, setGuidance] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    
    useEffect(() => {
        fetchMyTeams();
    }, []);

    const fetchMyTeams = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/teams");

            const allTeams = response.data.teams || [];

            const currentUser = JSON.parse(
                localStorage.getItem("user")
            );

            if (!currentUser) {
                setError("User information not found.");
                return;
            }

            const myTeams = allTeams.filter((team) =>
                team.members?.some(
                    (member) =>
                        member._id?.toString() ===
                        currentUser.id?.toString()
                )
            );

            setTeams(myTeams);

            // Fetch guidance for each team
            for (const team of myTeams) {
                try {
                    const guidanceResponse = await api.get(
                        `/teams/${team._id}/guidance`
                    );

                    setGuidance((previous) => ({
                        ...previous,
                        [team._id]:
                            guidanceResponse.data.guidance || []
                    }));
                } catch (guidanceError) {
                    console.log(
                        `No guidance found for ${team.teamName}`
                    );

                    setGuidance((previous) => ({
                        ...previous,
                        [team._id]: []
                    }));
                }
            }

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load your teams."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="my-team-page">
                <div className="loading-card">
                    <div className="loading-spinner"></div>
                    <p>Loading your team...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-team-page">
                <div className="error-card">
                    <h2>Unable to load team</h2>
                    <p>{error}</p>

                    <button
                        onClick={fetchMyTeams}
                        className="primary-button"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (teams.length === 0) {
        return (
            <div className="my-team-page">
                <div className="page-header">
                    <div>
                        <p className="page-label">
                            TEAM MANAGEMENT
                        </p>

                        <h1>My Team</h1>

                        <p>
                            View your team, mentor and guidance.
                        </p>
                    </div>
                </div>

                <div className="empty-card">
                    <div className="empty-icon">👥</div>

                    <h2>No Team Yet</h2>

                    <p>
                        You are not currently a member of any team.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/participant/hackathons")
                        }
                        className="primary-button"
                    >
                        Explore Hackathons
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="my-team-page">

            {/* PAGE HEADER */}
            <div className="page-header">
                <div>
                    <p className="page-label">
                        TEAM MANAGEMENT
                    </p>

                    <h1>My Team</h1>

                    <p>
                        View your team members, assigned mentor
                        and mentor guidance.
                    </p>
                </div>

                <button
                    className="secondary-button"
                    onClick={fetchMyTeams}
                >
                    Refresh
                </button>
            </div>

            {/* TEAM CARDS */}
            <div className="team-list">

                {teams.map((team) => {
                    const teamGuidance =
                        guidance[team._id] || [];

                    return (
                        <div
                            className="team-container"
                            key={team._id}
                        >

                            {/* TEAM HEADER */}
                            <div className="team-header">

                                <div>
                                    <span className="team-label">
                                        YOUR TEAM
                                    </span>

                                    <h2>{team.teamName}</h2>

                                    <p>
                                        {team.hackathon?.title ||
                                            "Hackathon"}
                                    </p>
                                </div>

                                <span
                                    className={`status-badge ${
                                        team.status || "forming"
                                    }`}
                                >
                                    {team.status || "forming"}
                                </span>
                            </div>

                            {/* TEAM CONTENT */}
                            <div className="team-grid">

                                {/* TEAM INFORMATION */}
                                <div className="info-card">

                                    <div className="card-title">
                                        <span>👥</span>
                                        <h3>Team Members</h3>
                                    </div>

                                    <div className="member-count">
                                        {team.members?.length || 0} members
                                    </div>

                                    <div className="members-list">

                                        {team.members?.map(
                                            (member) => (
                                                <div
                                                    className="member-row"
                                                    key={member._id}
                                                >

                                                    <div className="avatar">
                                                        {member.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase()}
                                                    </div>

                                                    <div className="member-info">
                                                        <strong>
                                                            {member.name}
                                                        </strong>

                                                        <span>
                                                            {member.email}
                                                        </span>
                                                    </div>

                                                    {team.leader?._id ===
                                                        member._id && (
                                                        <span className="leader-badge">
                                                            Leader
                                                        </span>
                                                    )}

                                                </div>
                                            )
                                        )}

                                    </div>

                                    <button
                                        className="outline-button"
                                        onClick={() =>
                                            navigate(
                                                `/participant/team/${team._id}`
                                            )
                                        }
                                    >
                                        Manage Team →
                                    </button>

                                </div>

                                {/* MENTOR */}
                                <div className="info-card mentor-card">

                                    <div className="card-title">
                                        <span>🎓</span>
                                        <h3>Assigned Mentor</h3>
                                    </div>

                                    {team.mentor ? (
                                        <div className="mentor-content">

                                            <div className="mentor-avatar">
                                                {team.mentor.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase()}
                                            </div>

                                            <div>
                                                <h3>
                                                    {team.mentor.name}
                                                </h3>

                                                <p>
                                                    {team.mentor.email}
                                                </p>

                                                <span className="mentor-status">
                                                    Mentor assigned
                                                </span>
                                            </div>

                                        </div>
                                    ) : (
                                        <div className="no-mentor">
                                            <div className="no-mentor-icon">
                                                🎓
                                            </div>

                                            <h3>
                                                Mentor not assigned
                                            </h3>

                                            <p>
                                                A mentor has not been
                                                assigned to your team yet.
                                            </p>
                                        </div>
                                    )}

                                </div>

                            </div>

                            {/* GUIDANCE SECTION */}
                            <div className="guidance-section">

                                <div className="section-heading">

                                    <div>
                                        <span className="team-label">
                                            MENTOR SUPPORT
                                        </span>

                                        <h2>Mentor Guidance</h2>

                                        <p>
                                            Suggestions and feedback
                                            provided by your assigned
                                            mentor.
                                        </p>
                                    </div>

                                    <div className="guidance-count">
                                        {teamGuidance.length}
                                        {" "}
                                        {teamGuidance.length === 1
                                            ? "message"
                                            : "messages"}
                                    </div>

                                </div>

                                {teamGuidance.length === 0 ? (
                                    <div className="no-guidance">

                                        <div className="guidance-icon">
                                            💬
                                        </div>

                                        <div>
                                            <h3>
                                                No guidance yet
                                            </h3>

                                            <p>
                                                Your mentor has not
                                                provided any guidance
                                                yet. New feedback will
                                                appear here.
                                            </p>
                                        </div>

                                    </div>
                                ) : (
                                    <div className="guidance-list">

                                        {teamGuidance
                                            .slice()
                                            .reverse()
                                            .map((item) => (
                                                <div
                                                    className="guidance-card"
                                                    key={item._id}
                                                >

                                                    <div className="guidance-top">

                                                        <div className="guidance-mentor">

                                                            <div className="guidance-avatar">
                                                                {item.mentor?.name
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <strong>
                                                                    {item
                                                                        .mentor
                                                                        ?.name ||
                                                                        "Mentor"}
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
                                                                ).toLocaleDateString(
                                                                    "en-IN",
                                                                    {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric"
                                                                    }
                                                                )
                                                                : ""}
                                                        </span>

                                                    </div>

                                                    <div className="guidance-message">
                                                        {item.message}
                                                    </div>

                                                </div>
                                            ))}

                                    </div>
                                )}

                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}

export default MyTeam;
