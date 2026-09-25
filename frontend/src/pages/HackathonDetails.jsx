import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const HackathonDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchHackathon();
    }, [id]);

    const fetchHackathon = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/hackathons/${id}`);

            setHackathon(response.data.hackathon);
        } catch (error) {
            console.error("Error fetching hackathon:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load hackathon details."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRegistration = async () => {
        try {
            setRegistering(true);
            setError("");
            setSuccess("");

            const response = await api.post("/registrations", {
                hackathon: id
            });

            setSuccess(
                response.data.message ||
                "Registration successful!"
            );

        } catch (error) {
            console.error("Registration error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to register for this hackathon."
            );
        } finally {
            setRegistering(false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "Not specified";
        }

        return new Date(date).toLocaleDateString("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="details-page">
                <div className="loading-message">
                    Loading hackathon details...
                </div>
            </div>
        );
    }

    if (error && !hackathon) {
        return (
            <div className="details-page">
                <div className="error-box">
                    {error}
                </div>

                <button
                    className="back-button"
                    onClick={() =>navigate("/participant/hackathons")}
                >
                    ← Back to Hackathons
                </button>
            </div>
        );
    }

    if (!hackathon) {
        return null;
    }

    return (
        <div className="details-page">

            <div className="details-container">

                <button
                    className="back-button"
                    onClick={() =>navigate("/participant/hackathons")}
                >
                    ← Back to Hackathons
                </button>

                <div className="details-card">

                    <div className="details-top">

                        <span
                            className={`status-badge status-${hackathon.status}`}
                        >
                            {hackathon.status}
                        </span>

                        <h1>{hackathon.title}</h1>

                    </div>

                    {/* Error */}
                    {error && (
                        <div className="error-box">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="success-box">
                            {success}
                        </div>
                    )}

                    <section className="details-section">

                        <h2>Description</h2>

                        <p>
                            {hackathon.description}
                        </p>

                    </section>

                    {hackathon.eligibility && (
                        <section className="details-section">

                            <h2>Eligibility</h2>

                            <p>
                                {hackathon.eligibility}
                            </p>

                        </section>
                    )}

                    <section className="details-section">

                        <h2>Hackathon Information</h2>

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
                                    {hackathon.maxTeamSize} members
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

                    <button
                        className="primary-action-button"
                        onClick={handleRegistration}
                        disabled={registering}
                    >
                        {registering
                            ? "Registering..."
                            : "Register for Hackathon"}
                    </button>

                </div>

            </div>

        </div>
    );
};

export default HackathonDetails;