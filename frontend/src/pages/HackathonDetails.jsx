import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const HackathonDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    const [registrations, setRegistrations] = useState([]);
    const [userTeam, setUserTeam] = useState(null);

    const [teamName, setTeamName] = useState("");
    const [creatingTeam, setCreatingTeam] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==========================================
    // LOAD HACKATHON
    // ==========================================

    useEffect(() => {
        fetchHackathon();
        fetchRegistrationAndTeam();
    }, [id]);


    // ==========================================
    // FETCH HACKATHON
    // ==========================================

    const fetchHackathon = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/hackathons/${id}`
            );

            setHackathon(
                response.data.hackathon
            );

        } catch (error) {
            console.error(
                "Error fetching hackathon:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load hackathon details."
            );

        } finally {
            setLoading(false);
        }
    };


    // ==========================================
    // CHECK REGISTRATION + TEAM
    // ==========================================

    const fetchRegistrationAndTeam = async () => {
        try {

            // Get user's registrations
            const registrationResponse =
                await api.get("/registrations");

            const userRegistrations =
                registrationResponse.data.registrations ||
                [];

            setRegistrations(
                userRegistrations
            );

            // Get all teams
            const teamResponse =
                await api.get("/teams");

            const allTeams =
                teamResponse.data.teams || [];

            const currentUser =
                JSON.parse(
                    localStorage.getItem("user")
                );

            if (!currentUser) {
                return;
            }

            // Find a team for THIS hackathon
            // where the current user is a member
            const teamForThisHackathon =
                allTeams.find((team) => {

                    const sameHackathon =
                        team.hackathon?._id?.toString() ===
                        id?.toString();

                    const isMember =
                        team.members?.some(
                            (member) =>
                                member._id?.toString() ===
                                currentUser.id?.toString()
                        );

                    return (
                        sameHackathon &&
                        isMember
                    );
                });

            setUserTeam(
                teamForThisHackathon || null
            );

        } catch (error) {

            console.error(
                "Error checking registration/team:",
                error
            );
        }
    };


    // ==========================================
    // CHECK IF REGISTERED
    // ==========================================

    const isRegistered =
        registrations.some(
            (registration) =>
                registration.hackathon?._id?.toString() ===
                id?.toString() &&
                registration.status !== "cancelled"
        );


    // ==========================================
    // REGISTER
    // ==========================================

    const handleRegistration = async () => {

        try {

            setRegistering(true);
            setError("");
            setSuccess("");

            const response =
                await api.post(
                    "/registrations",
                    {
                        hackathon: id
                    }
                );

            setSuccess(
                response.data.message ||
                "Registration successful!"
            );

            // Refresh registration state
            await fetchRegistrationAndTeam();

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to register for this hackathon."
            );

        } finally {

            setRegistering(false);
        }
    };


    // ==========================================
    // CREATE TEAM
    // ==========================================

    const handleCreateTeam = async (e) => {

        e.preventDefault();

        if (!teamName.trim()) {

            setError(
                "Please enter a team name."
            );

            return;
        }

        try {

            setCreatingTeam(true);
            setError("");
            setSuccess("");

            const response =
                await api.post(
                    "/teams",
                    {
                        teamName:
                            teamName.trim(),

                        hackathon: id
                    }
                );

            setSuccess(
                response.data.message ||
                "Team created successfully!"
            );

            setTeamName("");

            // Store newly created team
            setUserTeam(
                response.data.team
            );

        } catch (error) {

            console.error(
                "Create team error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to create team."
            );

        } finally {

            setCreatingTeam(false);
        }
    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {

        if (!date) {
            return "Not specified";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="details-page">

                <div className="loading-message">
                    Loading hackathon details...
                </div>

            </div>
        );
    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error && !hackathon) {

        return (
            <div className="details-page">

                <div className="error-box">
                    {error}
                </div>

                <button
                    className="back-button"
                    onClick={() =>
                        navigate(
                            "/participant/hackathons"
                        )
                    }
                >
                    ← Back to Hackathons
                </button>

            </div>
        );
    }


    if (!hackathon) {
        return null;
    }


    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="details-page">

            <div className="details-container">

                <button
                    className="back-button"
                    onClick={() =>
                        navigate(
                            "/participant/hackathons"
                        )
                    }
                >
                    ← Back to Hackathons
                </button>


                <div className="details-card">


                    {/* ================================
                        HEADER
                    ================================= */}

                    <div className="details-top">

                        <span
                            className={`status-badge status-${hackathon.status}`}
                        >
                            {hackathon.status}
                        </span>

                        <h1>
                            {hackathon.title}
                        </h1>

                    </div>


                    {/* ERROR */}

                    {error && (
                        <div className="error-box">
                            {error}
                        </div>
                    )}


                    {/* SUCCESS */}

                    {success && (
                        <div className="success-box">
                            {success}
                        </div>
                    )}


                    {/* ================================
                        DESCRIPTION
                    ================================= */}

                    <section className="details-section">

                        <h2>
                            Description
                        </h2>

                        <p>
                            {hackathon.description}
                        </p>

                    </section>


                    {/* ================================
                        ELIGIBILITY
                    ================================= */}

                    {hackathon.eligibility && (

                        <section className="details-section">

                            <h2>
                                Eligibility
                            </h2>

                            <p>
                                {hackathon.eligibility}
                            </p>

                        </section>

                    )}


                    {/* ================================
                        HACKATHON INFORMATION
                    ================================= */}

                    <section className="details-section">

                        <h2>
                            Hackathon Information
                        </h2>

                        <div className="details-grid">

                            <div>
                                <strong>
                                    Registration Deadline
                                </strong>

                                <span>
                                    {formatDate(
                                        hackathon.registrationDeadline
                                    )}
                                </span>
                            </div>


                            <div>
                                <strong>
                                    Submission Deadline
                                </strong>

                                <span>
                                    {formatDate(
                                        hackathon.submissionDeadline
                                    )}
                                </span>
                            </div>


                            <div>
                                <strong>
                                    Start Date
                                </strong>

                                <span>
                                    {formatDate(
                                        hackathon.startDate
                                    )}
                                </span>
                            </div>


                            <div>
                                <strong>
                                    End Date
                                </strong>

                                <span>
                                    {formatDate(
                                        hackathon.endDate
                                    )}
                                </span>
                            </div>


                            <div>
                                <strong>
                                    Maximum Team Size
                                </strong>

                                <span>
                                    {hackathon.maxTeamSize}
                                    {" "}
                                    members
                                </span>
                            </div>


                            <div>
                                <strong>
                                    Organizer
                                </strong>

                                <span>
                                    {hackathon.organizer?.name ||
                                        "Not specified"}
                                </span>
                            </div>

                        </div>

                    </section>


                    {/* ================================
                        TEAM MANAGEMENT
                    ================================= */}

                    {isRegistered && (

                        <section className="details-section">

                            <h2>
                                Team Management
                            </h2>


                            {/* TEAM ALREADY EXISTS */}

                            {userTeam ? (

                                <div className="success-box">

                                    <strong>
                                        Your team:
                                    </strong>

                                    {" "}

                                    {userTeam.teamName}

                                    <br />

                                    <button
                                        className="primary-action-button"
                                        onClick={() =>
                                            navigate(
                                                `/participant/team/${userTeam._id}`
                                            )
                                        }
                                        style={{
                                            marginTop:
                                                "15px"
                                        }}
                                    >
                                        Manage Team
                                    </button>

                                </div>

                            ) : (

                                <>
                                    <p>
                                        You are registered for
                                        this hackathon, but you
                                        have not created a team
                                        yet.
                                    </p>


                                    <form
                                        onSubmit={
                                            handleCreateTeam
                                        }
                                    >

                                        <div
                                            className="form-group"
                                        >

                                            <label>
                                                Team Name
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    teamName
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setTeamName(
                                                        e.target
                                                            .value
                                                    )
                                                }
                                                placeholder="Enter your team name"
                                                required
                                            />

                                        </div>


                                        <button
                                            type="submit"
                                            className="primary-action-button"
                                            disabled={
                                                creatingTeam
                                            }
                                        >
                                            {creatingTeam
                                                ? "Creating Team..."
                                                : "Create Team"}
                                        </button>

                                    </form>

                                    <p
                                        style={{
                                            marginTop:
                                                "15px"
                                        }}
                                    >
                                        After creating the
                                        team, you can add other
                                        participants from the
                                        Manage Team page.
                                    </p>

                                </>

                            )}

                        </section>

                    )}


                    {/* ================================
                        REGISTRATION
                    ================================= */}

                   

                        {new Date() <= new Date(hackathon.registrationDeadline) &&
    hackathon.status !== "completed" && (
        <button
            className="primary-action-button"
            onClick={handleRegistration}
            disabled={registering}
        >
            {registering
                ? "Registering..."
                : "Register for Hackathon"}
        </button>
    )}

{new Date() > new Date(hackathon.registrationDeadline) && (
    <button
        className="primary-action-button"
        disabled
    >
        Registration Closed
    </button>
)}

                   


                </div>

            </div>

        </div>
    );
};

export default HackathonDetails;