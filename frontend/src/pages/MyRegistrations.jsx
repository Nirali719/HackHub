import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const MyRegistrations = () => {
    const navigate = useNavigate();

    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/registrations");

            setRegistrations(
                response.data.registrations || []
            );

        } catch (error) {
            console.error(
                "Error fetching registrations:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load your registrations."
            );

        } finally {
            setLoading(false);
        }
    };


    const handleCancel = async (registrationId) => {

        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this registration?"
        );

        if (!confirmCancel) {
            return;
        }

        try {

            setCancellingId(registrationId);
            setError("");

            await api.delete(
                `/registrations/${registrationId}`
            );

            // Remove cancelled registration from the current list
            setRegistrations((previousRegistrations) =>
                previousRegistrations.filter(
                    (registration) =>
                        registration._id !== registrationId
                )
            );

        } catch (error) {

            console.error(
                "Error cancelling registration:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to cancel registration."
            );

        } finally {
            setCancellingId(null);
        }
    };


    const formatDate = (date) => {

        if (!date) {
            return "Not available";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    const getStatusClass = (status) => {

        switch (status) {

            case "approved":
                return "registration-status approved";

            case "rejected":
                return "registration-status rejected";

            case "cancelled":
                return "registration-status cancelled";

            case "pending":
            default:
                return "registration-status pending";
        }
    };


    const getStatusText = (status) => {

        if (!status) {
            return "Pending";
        }

        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );
    };


    const totalRegistrations =
        registrations.length;

    const pendingRegistrations =
        registrations.filter(
            (registration) =>
                registration.status === "pending"
        ).length;

    const approvedRegistrations =
        registrations.filter(
            (registration) =>
                registration.status === "approved"
        ).length;


    if (loading) {
        return (
            <div className="registrations-page">

                <div className="registrations-container">

                    <div className="registrations-loading">
                        Loading your registrations...
                    </div>

                </div>

            </div>
        );
    }


    return (
        <div className="registrations-page">

            <div className="registrations-container">

                {/* PAGE HEADER */}

                <div className="registrations-header">

                    <div>

                        <h1>
                            My Registrations
                        </h1>

                        <p>
                            View and manage the hackathons
                            you have registered for.
                        </p>

                    </div>

                    <button
                        className="registration-refresh-button"
                        onClick={fetchRegistrations}
                    >
                        Refresh
                    </button>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="error-box">
                        {error}
                    </div>
                )}


                {/* STATISTICS */}

                <div className="registration-stats">

                    <div className="registration-stat-card">

                        <span>
                            Total Registrations
                        </span>

                        <strong>
                            {totalRegistrations}
                        </strong>

                    </div>


                    <div className="registration-stat-card">

                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingRegistrations}
                        </strong>

                    </div>


                    <div className="registration-stat-card">

                        <span>
                            Approved
                        </span>

                        <strong>
                            {approvedRegistrations}
                        </strong>

                    </div>

                </div>


                {/* REGISTRATION LIST */}

                <div className="registrations-section">

                    <div className="registrations-section-header">

                        <h2>
                            Your Registrations
                        </h2>

                        <span>
                            {totalRegistrations}{" "}
                            {totalRegistrations === 1
                                ? "registration"
                                : "registrations"}
                        </span>

                    </div>


                    {registrations.length === 0 ? (

                        <div className="no-registrations">

                            <div className="empty-icon">
                                R
                            </div>

                            <h3>
                                No Registrations Yet
                            </h3>

                            <p>
                                You haven't registered for
                                any hackathons yet.
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/participant/hackathons"
                                    )
                                }
                            >
                                Explore Hackathons
                            </button>

                        </div>

                    ) : (

                        <div className="registration-list">

                            {registrations.map(
                                (registration) => (

                                    <div
                                        className="registration-card"
                                        key={
                                            registration._id
                                        }
                                    >

                                        <div className="registration-card-main">

                                            <div className="registration-title-row">

                                                <h3>
                                                    {registration
                                                        .hackathon
                                                        ?.title ||
                                                        "Hackathon"}
                                                </h3>

                                                <span
                                                    className={getStatusClass(
                                                        registration.status
                                                    )}
                                                >
                                                    {getStatusText(
                                                        registration.status
                                                    )}
                                                </span>

                                            </div>


                                            <div className="registration-meta">

                                                <div>
                                                    <span>
                                                        Registered On
                                                    </span>

                                                    <strong>
                                                        {formatDate(
                                                            registration.registrationDate
                                                        )}
                                                    </strong>
                                                </div>


                                                <div>
                                                    <span>
                                                        Hackathon Status
                                                    </span>

                                                    <strong>
                                                        {getStatusText(
                                                            registration
                                                                .hackathon
                                                                ?.status
                                                        )}
                                                    </strong>
                                                </div>

                                            </div>

                                        </div>


                                        <div className="registration-actions">

                                            <button
                                                className="registration-view-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/participant/hackathons/${registration.hackathon?._id}`
                                                    )
                                                }
                                            >
                                                View Details
                                            </button>


                                            <button
                                                className="registration-cancel-button"
                                                onClick={() =>
                                                    handleCancel(
                                                        registration._id
                                                    )
                                                }
                                                disabled={
                                                    cancellingId ===
                                                    registration._id
                                                }
                                            >
                                                {cancellingId ===
                                                registration._id
                                                    ? "Cancelling..."
                                                    : "Cancel"}
                                            </button>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};

export default MyRegistrations;