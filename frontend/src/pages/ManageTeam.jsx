import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ManageTeam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    const [teamName, setTeamName] = useState("");
    const [status, setStatus] = useState("");

    // Search states
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ==========================================
    // FETCH TEAM
    // ==========================================

    const fetchTeam = async () => {
        try {
            setLoading(true);

            const response = await api.get(`/teams/${id}`);

            const teamData = response.data.team;

            setTeam(teamData);
            setTeamName(teamData.teamName);
            setStatus(teamData.status);

        } catch (error) {
            console.error("Error fetching team:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load team"
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchTeam();
    }, [id]);


    // ==========================================
    // SEARCH PARTICIPANTS
    // ==========================================

    const searchParticipants = async (value) => {
        setSearch(value);
        setSelectedUser(null);

        if (value.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setSearchLoading(true);

            const response = await api.get(
                `/users/participants?search=${encodeURIComponent(value)}`
            );

            let users = response.data.users || [];

            // Remove users who are already team members
            if (team?.members) {
                users = users.filter(
                    (searchedUser) =>
                        !team.members.some(
                            (member) =>
                                member._id === searchedUser._id
                        )
                );
            }

            // Don't show the current logged-in user
            users = users.filter(
                (searchedUser) =>
                    searchedUser._id !== user?.id
            );

            setSearchResults(users);

        } catch (error) {
            console.error("Search error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to search participants"
            );
        } finally {
            setSearchLoading(false);
        }
    };


    // ==========================================
    // SELECT PARTICIPANT
    // ==========================================

    const handleSelectUser = (selected) => {
        setSelectedUser(selected);
        setSearch(selected.name);
        setSearchResults([]);
    };


    // ==========================================
    // UPDATE TEAM
    // ==========================================

    const handleUpdateTeam = async (e) => {
        e.preventDefault();

        try {
            setMessage("");
            setError("");

            const response = await api.put(`/teams/${id}`, {
                teamName,
                status
            });

            setTeam((prev) => ({
                ...prev,
                ...response.data.team
            }));

            setMessage("Team updated successfully.");

        } catch (error) {
            console.error("Update team error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to update team"
            );
        }
    };


    // ==========================================
    // ADD MEMBER
    // ==========================================

    const handleAddMember = async () => {
        if (!selectedUser) {
            setError("Please search and select a participant first.");
            return;
        }

        try {
            setMessage("");
            setError("");

            await api.post(`/teams/${id}/members`, {
                userId: selectedUser._id
            });

            setMessage(
                `${selectedUser.name} has been added to the team.`
            );

            // Clear search
            setSearch("");
            setSearchResults([]);
            setSelectedUser(null);

            // Reload team
            await fetchTeam();

        } catch (error) {
            console.error("Add member error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to add member"
            );
        }
    };


    // ==========================================
    // REMOVE MEMBER
    // ==========================================

    const handleRemoveMember = async (userId) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this member?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setMessage("");
            setError("");

            await api.delete(
                `/teams/${id}/members/${userId}`
            );

            setMessage("Member removed successfully.");

            await fetchTeam();

        } catch (error) {
            console.error("Remove member error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to remove member"
            );
        }
    };


    // ==========================================
    // DELETE TEAM
    // ==========================================

    const handleDeleteTeam = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this team?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/teams/${id}`);

            navigate("/participant/team");

        } catch (error) {
            console.error("Delete team error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to delete team"
            );
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="page-container">
                <p>Loading team...</p>
            </div>
        );
    }


    if (!team) {
        return (
            <div className="page-container">
                <p>Team not found.</p>

                <button
                    onClick={() => navigate("/participant/team")}
                >
                    Back to My Teams
                </button>
            </div>
        );
    }


    // ==========================================
    // CHECK TEAM LEADER
    // ==========================================

    const isLeader =
        team.leader?._id === user?.id;


    return (
        <div className="manage-team-page">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="manage-team-header">

                <div>
                    <button
                        className="back-button"
                        onClick={() =>
                            navigate("/participant/team")
                        }
                    >
                        ← Back to My Teams
                    </button>

                    <h1>{team.teamName}</h1>

                    <p>
                        Manage your team members and team details.
                    </p>
                </div>

            </div>


            {/* ==================================
                MESSAGES
            ================================== */}

            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {/* ==================================
                TEAM INFORMATION
            ================================== */}

            <div className="manage-team-card">

                <div className="card-header">
                    <h2>Team Information</h2>
                </div>

                <form
                    onSubmit={handleUpdateTeam}
                    className="team-form"
                >

                    <div className="form-group">

                        <label>
                            Team Name
                        </label>

                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) =>
                                setTeamName(e.target.value)
                            }
                            disabled={!isLeader}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Status
                        </label>

                        <select
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value)
                            }
                            disabled={!isLeader}
                        >

                            <option value="forming">
                                Forming
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="submitted">
                                Submitted
                            </option>

                            <option value="completed">
                                Completed
                            </option>

                        </select>

                    </div>


                    {isLeader && (
                        <button
                            type="submit"
                            className="primary-button"
                        >
                            Save Changes
                        </button>
                    )}

                </form>

            </div>


            {/* ==================================
                TEAM MEMBERS
            ================================== */}

            <div className="manage-team-card">

                <div className="card-header">

                    <div>
                        <h2>Team Members</h2>

                        <p>
                            {team.members?.length || 0} member(s)
                        </p>
                    </div>

                </div>


                {/* ==================================
                    ADD MEMBER
                ================================== */}

                {isLeader && (
                    <div className="add-member-section">

                        <h3>
                            Add Team Member
                        </h3>

                        <p className="helper-text">
                            Search for a participant using their
                            name or email address.
                        </p>


                        <div className="search-member-container">

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    searchParticipants(
                                        e.target.value
                                    )
                                }
                                placeholder="Search by name or email..."
                                className="member-search-input"
                            />


                            {searchLoading && (
                                <p className="search-status">
                                    Searching...
                                </p>
                            )}


                            {/* SEARCH RESULTS */}

                            {searchResults.length > 0 && (

                                <div className="search-results">

                                    {searchResults.map(
                                        (participant) => (

                                            <button
                                                key={participant._id}
                                                type="button"
                                                className="participant-result"
                                                onClick={() =>
                                                    handleSelectUser(
                                                        participant
                                                    )
                                                }
                                            >

                                                <div className="participant-avatar">
                                                    {participant.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="participant-info">

                                                    <strong>
                                                        {participant.name}
                                                    </strong>

                                                    <span>
                                                        {participant.email}
                                                    </span>

                                                    {participant.college && (
                                                        <small>
                                                            {participant.college}
                                                        </small>
                                                    )}

                                                </div>

                                            </button>

                                        )
                                    )}

                                </div>

                            )}


                            {/* NO RESULTS */}

                            {!searchLoading &&
                                search.trim().length >= 2 &&
                                searchResults.length === 0 &&
                                !selectedUser && (
                                    <p className="search-status">
                                        No participants found.
                                    </p>
                                )}

                        </div>


                        {/* SELECTED USER */}

                        {selectedUser && (

                            <div className="selected-member">

                                <div>
                                    <strong>
                                        {selectedUser.name}
                                    </strong>

                                    <span>
                                        {selectedUser.email}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={handleAddMember}
                                >
                                    Add Member
                                </button>

                            </div>

                        )}

                    </div>
                )}


                {/* ==================================
                    MEMBERS LIST
                ================================== */}

                <div className="members-list">

                    {team.members?.map((member) => {

                        const isMemberLeader =
                            member._id === team.leader?._id;

                        return (
                            <div
                                className="member-card"
                                key={member._id}
                            >

                                <div className="member-avatar">
                                    {member.name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                </div>


                                <div className="member-info">

                                    <h3>
                                        {member.name}
                                    </h3>

                                    <p>
                                        {member.email}
                                    </p>

                                </div>


                                {isMemberLeader && (
                                    <span className="leader-badge">
                                        Leader
                                    </span>
                                )}


                                {isLeader &&
                                    !isMemberLeader && (
                                        <button
                                            className="remove-member-button"
                                            onClick={() =>
                                                handleRemoveMember(
                                                    member._id
                                                )
                                            }
                                        >
                                            Remove
                                        </button>
                                    )}

                            </div>
                        );
                    })}

                </div>

            </div>


            {/* ==================================
                DELETE TEAM
            ================================== */}

            {isLeader && (
                <div className="danger-zone">

                    <div>
                        <h3>
                            Delete Team
                        </h3>

                        <p>
                            Permanently delete this team.
                        </p>
                    </div>

                    <button
                        className="delete-team-button"
                        onClick={handleDeleteTeam}
                    >
                        Delete Team
                    </button>

                </div>
            )}

        </div>
    );
};

export default ManageTeam;