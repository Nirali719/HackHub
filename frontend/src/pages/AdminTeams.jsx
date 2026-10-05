import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AdminTeams = () => {
    const [teams, setTeams] = useState([]);
    const [mentors, setMentors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [assigningTeam, setAssigningTeam] = useState(null);
    const [selectedMentor, setSelectedMentor] = useState("");

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [teamsResponse, usersResponse] = await Promise.all([
                api.get("/teams"),
                api.get("/admin/users")
            ]);

            setTeams(teamsResponse.data.teams || []);

            const allUsers = usersResponse.data.users || [];

            setMentors(
                allUsers.filter(
                    (user) => user.role === "mentor"
                )
            );
        } catch (err) {
            console.error("Load Admin Teams Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load teams."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredTeams = useMemo(() => {
        const query = search.trim().toLowerCase();

        return teams.filter((team) => {
            const matchesSearch =
                !query ||
                team.teamName?.toLowerCase().includes(query) ||
                team.hackathon?.title?.toLowerCase().includes(query) ||
                team.leader?.name?.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "all" ||
                team.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [teams, search, statusFilter]);

    const openAssignMentor = (team) => {
        setAssigningTeam(team);
        setSelectedMentor(team.mentor?._id || "");
    };

    const assignMentor = async () => {
        if (!assigningTeam) return;

        if (!selectedMentor) {
            alert("Please select a mentor.");
            return;
        }

        try {
            setSaving(true);

            const response = await api.put(
                `/teams/${assigningTeam._id}/mentor`,
                {
                    mentorId: selectedMentor
                }
            );

            setTeams((previous) =>
                previous.map((team) =>
                    team._id === assigningTeam._id
                        ? response.data.team
                        : team
                )
            );

            setAssigningTeam(null);
            setSelectedMentor("");

            alert("Mentor assigned successfully.");
        } catch (err) {
            console.error("Assign Mentor Error:", err);

            alert(
                err.response?.data?.message ||
                "Unable to assign mentor."
            );
        } finally {
            setSaving(false);
        }
    };

    const deleteTeam = async (team) => {
        const confirmed = window.confirm(
            `Delete team "${team.teamName}"? This action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(team._id);

            await api.delete(`/teams/${team._id}`);

            setTeams((previous) =>
                previous.filter(
                    (item) => item._id !== team._id
                )
            );
        } catch (err) {
            console.error("Delete Team Error:", err);

            alert(
                err.response?.data?.message ||
                "Unable to delete team."
            );
        } finally {
            setDeletingId("");
        }
    };

    const counts = {
        all: teams.length,

        forming: teams.filter(
            (team) => team.status === "forming"
        ).length,

        ready: teams.filter(
            (team) => team.status === "ready"
        ).length,

        submitted: teams.filter(
            (team) => team.status === "submitted"
        ).length,

        completed: teams.filter(
            (team) => team.status === "completed"
        ).length
    };

    if (loading) {
        return (
            <div className="admin-teams-page">
                <p>Loading teams...</p>
            </div>
        );
    }

    return (
        <div className="admin-teams-page">

            {/* HEADER */}

            <div className="admin-teams-heading">
                <div>
                    <p className="admin-teams-eyebrow">
                        ADMINISTRATION
                    </p>

                    <h1>Teams Management</h1>

                    <p>
                        View teams, check their status, assign mentors,
                        and manage team records.
                    </p>
                </div>

                <button
                    className="teams-refresh-button"
                    onClick={loadData}
                >
                    Refresh
                </button>
            </div>

            {/* ERROR */}

            {error && (
                <div className="teams-error">
                    {error}

                    <button onClick={loadData}>
                        Try again
                    </button>
                </div>
            )}

            {/* STATS */}

            <div className="teams-stat-grid">

                <div className="teams-stat-card">
                    <span>Total Teams</span>
                    <strong>{counts.all}</strong>
                </div>

                <div className="teams-stat-card">
                    <span>Forming</span>
                    <strong>{counts.forming}</strong>
                </div>

                <div className="teams-stat-card">
                    <span>Ready</span>
                    <strong>{counts.ready}</strong>
                </div>

                <div className="teams-stat-card">
                    <span>Submitted</span>
                    <strong>{counts.submitted}</strong>
                </div>

                <div className="teams-stat-card">
                    <span>Completed</span>
                    <strong>{counts.completed}</strong>
                </div>

            </div>

            {/* TABLE */}

            <section className="teams-table-panel">

                <div className="teams-toolbar">

                    <input
                        type="search"
                        placeholder="Search team, hackathon, or leader..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <option value="all">
                            All statuses
                        </option>

                        <option value="forming">
                            Forming
                        </option>

                        <option value="ready">
                            Ready
                        </option>

                        <option value="submitted">
                            Submitted
                        </option>

                        <option value="completed">
                            Completed
                        </option>
                    </select>

                </div>

                <div className="teams-table-wrapper">

                    <table className="teams-table">

                        <thead>
                            <tr>
                                <th>Team</th>
                                <th>Hackathon</th>
                                <th>Leader</th>
                                <th>Members</th>
                                <th>Mentor</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredTeams.map((team) => (

                                <tr key={team._id}>

                                    <td>
                                        <strong>
                                            {team.teamName}
                                        </strong>
                                    </td>

                                    <td>
                                        {team.hackathon?.title || "—"}
                                    </td>

                                    <td>
                                        {team.leader?.name || "—"}
                                    </td>

                                    <td>
                                        {team.members?.length || 0}
                                    </td>

                                    <td>
                                        {team.mentor?.name || (
                                            <span className="no-mentor">
                                                Not assigned
                                            </span>
                                        )}
                                    </td>

                                    <td>
                                        <span
                                            className={`team-status status-${team.status}`}
                                        >
                                            {team.status}
                                        </span>
                                    </td>

                                    <td>

                                        <div className="teams-actions">

                                            <button
                                                className="teams-mentor-button"
                                                onClick={() =>
                                                    openAssignMentor(team)
                                                }
                                            >
                                                {team.mentor
                                                    ? "Change Mentor"
                                                    : "Assign Mentor"}
                                            </button>

                                            <button
                                                className="teams-delete-button"
                                                disabled={
                                                    deletingId === team._id
                                                }
                                                onClick={() =>
                                                    deleteTeam(team)
                                                }
                                            >
                                                {deletingId === team._id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                            {filteredTeams.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="teams-empty"
                                    >
                                        No teams found.
                                    </td>
                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>

                <div className="teams-table-footer">
                    Showing {filteredTeams.length} of {teams.length} teams
                </div>

            </section>

            {/* ASSIGN MENTOR MODAL */}

            {assigningTeam && (

                <div
                    className="teams-modal-backdrop"
                    onClick={() =>
                        !saving && setAssigningTeam(null)
                    }
                >

                    <div
                        className="teams-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <h2>
                            Assign Mentor
                        </h2>

                        <p>
                            Select a mentor for{" "}
                            <strong>
                                {assigningTeam.teamName}
                            </strong>
                        </p>

                        <label htmlFor="team-mentor">
                            Mentor
                        </label>

                        <select
                            id="team-mentor"
                            value={selectedMentor}
                            onChange={(event) =>
                                setSelectedMentor(
                                    event.target.value
                                )
                            }
                        >
                            <option value="">
                                Select a mentor
                            </option>

                            {mentors.map((mentor) => (
                                <option
                                    key={mentor._id}
                                    value={mentor._id}
                                >
                                    {mentor.name} — {mentor.email}
                                </option>
                            ))}

                        </select>

                        <div className="teams-modal-actions">

                            <button
                                className="teams-cancel-button"
                                disabled={saving}
                                onClick={() =>
                                    setAssigningTeam(null)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="teams-save-button"
                                disabled={saving}
                                onClick={assignMentor}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Mentor"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default AdminTeams;