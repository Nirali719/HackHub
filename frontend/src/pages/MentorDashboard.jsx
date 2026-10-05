import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const MentorDashboard = () => {

    const navigate = useNavigate();

    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchTeams();
    }, []);


    const fetchTeams = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/teams/mentor/my-teams"
            );

            setTeams(response.data.teams || []);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load assigned teams."
            );

        } finally {

            setLoading(false);

        }
    };


    const activeHackathons = new Set(
        teams
            .filter(team => team.hackathon)
            .map(team => team.hackathon._id)
    ).size;


    if (loading) {
        return (
            <div className="mentor-loading">
                Loading dashboard...
            </div>
        );
    }


    return (
        <div className="mentor-dashboard-page">

            {/* ================= HERO ================= */}

            <section className="mentor-dashboard-hero">

                <div>

                    <p className="mentor-eyebrow">
                        MENTOR PORTAL
                    </p>

                    <h1>
                        Welcome back, Mentor!
                    </h1>

                    <p>
                        Monitor your assigned teams, review their progress
                        and provide guidance throughout the hackathon.
                    </p>

                </div>

                <div className="mentor-hero-icon">
                    🎓
                </div>

            </section>


            {/* ================= STATS ================= */}

            <section className="mentor-stats">

                <div className="mentor-stat-card">

                    <div className="mentor-stat-icon">
                        👥
                    </div>

                    <div>
                        <span>
                            Assigned Teams
                        </span>

                        <strong>
                            {teams.length}
                        </strong>
                    </div>

                </div>


                <div className="mentor-stat-card">

                    <div className="mentor-stat-icon">
                        🏆
                    </div>

                    <div>
                        <span>
                            Active Hackathons
                        </span>

                        <strong>
                            {activeHackathons}
                        </strong>
                    </div>

                </div>


                <div className="mentor-stat-card">

                    <div className="mentor-stat-icon">
                        💬
                    </div>

                    <div>
                        <span>
                            Mentorship
                        </span>

                        <strong>
                            Active
                        </strong>
                    </div>

                </div>

            </section>


            {/* ================= ASSIGNED TEAMS ================= */}

            <section className="mentor-section">

                <div className="mentor-section-heading">

                    <div>
                        <h2>
                            My Assigned Teams
                        </h2>

                        <p>
                            Teams currently assigned to you for mentorship.
                        </p>
                    </div>


                    <button
                        className="mentor-outline-button"
                        onClick={() => navigate("/mentor/teams")}
                    >
                        View All
                    </button>

                </div>


                {error && (
                    <div className="mentor-error">
                        {error}
                    </div>
                )}


                {!error && teams.length === 0 && (

                    <div className="mentor-empty-card">

                        <div className="mentor-empty-icon">
                            👥
                        </div>

                        <h3>
                            No Teams Assigned
                        </h3>

                        <p>
                            You currently don't have any teams assigned
                            for mentorship.
                        </p>

                    </div>

                )}


                <div className="mentor-team-grid">

                    {teams.slice(0, 3).map((team) => (

                        <div
                            className="mentor-team-card"
                            key={team._id}
                        >

                            <div className="mentor-team-card-top">

                                <div className="mentor-team-letter">
                                    {team.teamName
                                        ?.charAt(0)
                                        ?.toUpperCase() || "T"}
                                </div>

                                <span className="mentor-status-badge">
                                    {team.status || "forming"}
                                </span>

                            </div>


                            <h3>
                                {team.teamName}
                            </h3>


                            <div className="mentor-team-info">

                                <div>
                                    <span>
                                        Hackathon
                                    </span>

                                    <strong>
                                        {team.hackathon?.title || "—"}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Team Leader
                                    </span>

                                    <strong>
                                        {team.leader?.name || "—"}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Members
                                    </span>

                                    <strong>
                                        {team.members?.length || 0}
                                    </strong>
                                </div>

                            </div>


                            <button
                                className="mentor-primary-button"
                                onClick={() =>
                                    navigate(
                                        `/mentor/teams/${team._id}`
                                    )
                                }
                            >
                                View Team →
                            </button>

                        </div>

                    ))}

                </div>

            </section>

        </div>
    );
};

export default MentorDashboard;