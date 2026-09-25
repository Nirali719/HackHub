
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const MyTeam = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [teams, setTeams] = useState([]);
    const [hackathons, setHackathons] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCreateForm, setShowCreateForm] = useState(false);

    const [teamName, setTeamName] = useState("");
    const [selectedHackathon, setSelectedHackathon] = useState("");

    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchTeams();
        fetchHackathons();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/teams");

            const allTeams = response.data.teams || [];

            const myTeams = allTeams.filter((team) => {
                const isLeader =
                    team.leader?._id === user?.id;

                const isMember =
                    team.members?.some(
                        (member) => member._id === user?.id
                    );

                return isLeader || isMember;
            });

            setTeams(myTeams);
        } catch (error) {
            console.error("Error fetching teams:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load your teams."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchHackathons = async () => {
        try {
            const response = await api.get("/hackathons");

            setHackathons(
                response.data.hackathons || []
            );
        } catch (error) {
            console.error(
                "Error fetching hackathons:",
                error
            );
        }
    };

    const handleCreateTeam = async (event) => {
        event.preventDefault();

        if (!teamName.trim()) {
            setError("Please enter a team name.");
            return;
        }

        if (!selectedHackathon) {
            setError("Please select a hackathon.");
            return;
        }

        try {
            setCreating(true);
            setError("");

            await api.post("/teams", {
                teamName: teamName.trim(),
                hackathon: selectedHackathon
            });

            setTeamName("");
            setSelectedHackathon("");
            setShowCreateForm(false);

            await fetchTeams();
        } catch (error) {
            console.error(
                "Error creating team:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to create team."
            );
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteTeam = async (teamId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this team?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(teamId);
            setError("");

            await api.delete(`/teams/${teamId}`);

            setTeams((previousTeams) =>
                previousTeams.filter(
                    (team) => team._id !== teamId
                )
            );
        } catch (error) {
            console.error(
                "Error deleting team:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to delete team."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "ready":
                return "team-status ready";

            case "submitted":
                return "team-status submitted";

            case "forming":
            default:
                return "team-status forming";
        }
    };

    const getStatusText = (status) => {
        if (!status) {
            return "Forming";
        }

        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );
    };

    const isTeamLeader = (team) => {
        return (
            team.leader?._id === user?.id
        );
    };

    if (loading) {
        return (
            <div className="team-page">
                <div className="team-container">
                    <div className="team-loading">
                        Loading your teams...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="team-page">
            <div className="team-container">

                <div className="team-page-header">
                    <div>
                        <h1>My Team</h1>
                        <p>
                            Create and manage your
                            hackathon teams.
                        </p>
                    </div>

                    <button
                        className="create-team-button"
                        onClick={() =>
                            setShowCreateForm(
                                !showCreateForm
                            )
                        }
                    >
                        {showCreateForm
                            ? "Close"
                            : "+ Create Team"}
                    </button>
                </div>

                {error && (
                    <div className="error-box">
                        {error}
                    </div>
                )}

                {showCreateForm && (
                    <div className="create-team-card">
                        <div className="create-team-header">
                            <h2>Create New Team</h2>
                            <p>
                                Create a team for one of
                                the available hackathons.
                            </p>
                        </div>

                        <form
                            onSubmit={handleCreateTeam}
                            className="create-team-form"
                        >
                            <div className="form-group">
                                <label>
                                    Team Name
                                </label>

                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(event) =>
                                        setTeamName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter team name"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Hackathon
                                </label>

                                <select
                                    value={
                                        selectedHackathon
                                    }
                                    onChange={(event) =>
                                        setSelectedHackathon(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Select a hackathon
                                    </option>

                                    {hackathons.map(
                                        (hackathon) => (
                                            <option
                                                key={
                                                    hackathon._id
                                                }
                                                value={
                                                    hackathon._id
                                                }
                                            >
                                                {
                                                    hackathon.title
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="create-team-actions">
                                <button
                                    type="button"
                                    className="team-secondary-button"
                                    onClick={() => {
                                        setShowCreateForm(
                                            false
                                        );
                                        setTeamName("");
                                        setSelectedHackathon(
                                            ""
                                        );
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="team-primary-button"
                                    disabled={creating}
                                >
                                    {creating
                                        ? "Creating..."
                                        : "Create Team"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="team-summary">
                    <div className="team-summary-card">
                        <span>My Teams</span>
                        <strong>
                            {teams.length}
                        </strong>
                    </div>

                    <div className="team-summary-card">
                        <span>Teams I Lead</span>
                        <strong>
                            {
                                teams.filter(
                                    (team) =>
                                        isTeamLeader(
                                            team
                                        )
                                ).length
                            }
                        </strong>
                    </div>
                </div>

                <div className="teams-section">
                    <div className="teams-section-header">
                        <div>
                            <h2>Your Teams</h2>
                            <p>
                                Teams you are currently
                                participating in.
                            </p>
                        </div>
                    </div>

                    {teams.length === 0 ? (
                        <div className="no-teams">
                            <div className="team-empty-icon">
                                T
                            </div>

                            <h3>
                                You don't have a team yet
                            </h3>

                            <p>
                                Create a team and start
                                collaborating with other
                                participants.
                            </p>

                            <button
                                onClick={() =>
                                    setShowCreateForm(
                                        true
                                    )
                                }
                            >
                                Create Your Team
                            </button>
                        </div>
                    ) : (
                        <div className="team-list">
                            {teams.map((team) => (
                                <div
                                    className="team-card"
                                    key={team._id}
                                >
                                    <div className="team-card-header">
                                        <div>
                                            <h3>
                                                {
                                                    team.teamName
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    team
                                                        .hackathon
                                                        ?.title
                                                }
                                            </p>
                                        </div>

                                        <span
                                            className={getStatusClass(
                                                team.status
                                            )}
                                        >
                                            {getStatusText(
                                                team.status
                                            )}
                                        </span>
                                    </div>

                                    <div className="team-info">
                                        <div>
                                            <span>
                                                Hackathon
                                            </span>

                                            <strong>
                                                {
                                                    team
                                                        .hackathon
                                                        ?.title ||
                                                    "Not available"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Leader
                                            </span>

                                            <strong>
                                                {
                                                    team
                                                        .leader
                                                        ?.name ||
                                                    "Not available"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Members
                                            </span>

                                            <strong>
                                                {
                                                    team
                                                        .members
                                                        ?.length ||
                                                    0
                                                }
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="team-members">
                                        <h4>
                                            Team Members
                                        </h4>

                                        <div className="member-list">
                                            {team.members?.map(
                                                (member) => (
                                                    <div
                                                        className="member-item"
                                                        key={
                                                            member._id
                                                        }
                                                    >
                                                        <div className="member-avatar">
                                                            {member.name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <div className="member-info">
                                                            <strong>
                                                                {
                                                                    member.name
                                                                }

                                                                {member._id ===
                                                                    team
                                                                        .leader
                                                                        ?._id && (
                                                                    <span className="leader-badge">
                                                                        Leader
                                                                    </span>
                                                                )}
                                                            </strong>

                                                            <span>
                                                                {
                                                                    member.email
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    <div className="team-card-actions">
                                        <button
                                            className="team-view-button"
                                            onClick={() =>
                                                navigate(
                                                    `/participant/team/${team._id}`
                                                )
                                            }
                                        >
                                            Manage Team
                                        </button>

                                        {isTeamLeader(
                                            team
                                        ) && (
                                            <button
                                                className="team-delete-button"
                                                onClick={() =>
                                                    handleDeleteTeam(
                                                        team._id
                                                    )
                                                }
                                                disabled={
                                                    deletingId ===
                                                    team._id
                                                }
                                            >
                                                {deletingId ===
                                                team._id
                                                    ? "Deleting..."
                                                    : "Delete Team"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyTeam;

