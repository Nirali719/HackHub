import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const MentorTeams = () => {

    const navigate = useNavigate();

    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        fetchTeams();
    }, []);


    const fetchTeams = async () => {

        try {

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


    if (loading) {
        return (
            <div className="mentor-loading">
                Loading assigned teams...
            </div>
        );
    }


    return (
        <div className="mentor-page">

            {/* ================= HEADER ================= */}

            <div className="mentor-page-header">

                <div>

                    <p className="mentor-eyebrow">
                        MENTORSHIP
                    </p>

                    <h1>
                        Assigned Teams
                    </h1>

                    <p>
                        Review the teams assigned to you and provide
                        guidance throughout the hackathon.
                    </p>

                </div>


                <button
                    className="mentor-outline-button"
                    onClick={fetchTeams}
                >
                    Refresh
                </button>

            </div>


            {/* ================= ERROR ================= */}

            {error && (
                <div className="mentor-error">
                    {error}
                </div>
            )}


            {/* ================= EMPTY ================= */}

            {!error && teams.length === 0 && (

                <div className="mentor-empty-card">

                    <div className="mentor-empty-icon">
                        👥
                    </div>

                    <h2>
                        No Assigned Teams
                    </h2>

                    <p>
                        No teams have been assigned to you yet.
                    </p>

                </div>

            )}


            {/* ================= TEAMS ================= */}

            <div className="mentor-all-teams">

                {teams.map((team) => (

                    <div
                        className="mentor-large-team-card"
                        key={team._id}
                    >

                        <div className="mentor-large-team-main">

                            <div className="mentor-team-letter large">
                                {team.teamName
                                    ?.charAt(0)
                                    ?.toUpperCase() || "T"}
                            </div>


                            <div>

                                <div className="mentor-team-title-row">

                                    <h2>
                                        {team.teamName}
                                    </h2>

                                    <span className="mentor-status-badge">
                                        {team.status || "forming"}
                                    </span>

                                </div>


                                <p className="mentor-hackathon-name">
                                    {team.hackathon?.title || "No hackathon"}
                                </p>

                            </div>

                        </div>


                        <div className="mentor-large-team-details">

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


                            <div>
                                <span>
                                    Hackathon Status
                                </span>

                                <strong>
                                    {team.hackathon?.status || "—"}
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

        </div>
    );
};

export default MentorTeams;