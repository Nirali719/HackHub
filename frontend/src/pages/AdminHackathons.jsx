import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminHackathons = () => {
    const navigate = useNavigate();

    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadHackathons();
    }, []);

    const loadHackathons = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/hackathons");

            if (response.data?.success) {
                setHackathons(response.data.hackathons || []);
            } else {
                setError("Unable to load hackathons");
            }
        } catch (err) {
            console.error(
                "Admin Hackathons Error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load hackathons"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this hackathon?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/hackathons/${id}`);

            setHackathons((current) =>
                current.filter((hackathon) => hackathon._id !== id)
            );
        } catch (err) {
            console.error(
                "Delete Hackathon Error:",
                err.response?.data || err
            );

            alert(
                err.response?.data?.message ||
                "Failed to delete hackathon"
            );
        }
    };

    const formatDate = (date) => {
        if (!date) return "Not set";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "published":
                return "status-published";

            case "ongoing":
                return "status-ongoing";

            case "completed":
                return "status-completed";

            case "cancelled":
                return "status-cancelled";

            default:
                return "status-draft";
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    Loading hackathons...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">

            {/* HEADER */}

            <div className="admin-page-header">

                <div>
                    <h1>Hackathons</h1>

                    <p>
                        Create and manage hackathons on the platform.
                    </p>
                </div>

                <button
                    className="admin-primary-button"
                    onClick={() => navigate("/admin/hackathons/create")}
                >
                    + Create Hackathon
                </button>

            </div>


            {/* ERROR */}

            {error && (
                <div className="admin-error">
                    <p>{error}</p>

                    <button
                        className="admin-retry-button"
                        onClick={loadHackathons}
                    >
                        Try Again
                    </button>
                </div>
            )}


            {/* EMPTY STATE */}

            {!error && hackathons.length === 0 && (
                <div className="admin-empty-state">

                    <h2>No Hackathons Yet</h2>

                    <p>
                        Create your first hackathon to get started.
                    </p>

                    <button
                        className="admin-primary-button"
                        onClick={() =>
                            navigate("/admin/hackathons/create")
                        }
                    >
                        Create Hackathon
                    </button>

                </div>
            )}


            {/* HACKATHON LIST */}

            {!error && hackathons.length > 0 && (

                <div className="admin-hackathon-list">

                    {hackathons.map((hackathon) => (

                        <div
                            className="admin-hackathon-card"
                            key={hackathon._id}
                        >

                            <div className="admin-hackathon-info">

                                <div className="admin-hackathon-title-row">

                                    <h2>
                                        {hackathon.title}
                                    </h2>

                                    <span
                                        className={`admin-status ${getStatusClass(
                                            hackathon.status
                                        )}`}
                                    >
                                        {hackathon.status}
                                    </span>

                                </div>

                                <p className="admin-hackathon-description">
                                    {hackathon.description}
                                </p>

                                <div className="admin-hackathon-details">

                                    <div>
                                        <span>
                                            Registration Deadline
                                        </span>

                                        <strong>
                                            {formatDate(
                                                hackathon.registrationDeadline
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Submission Deadline
                                        </span>

                                        <strong>
                                            {formatDate(
                                                hackathon.submissionDeadline
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Start Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                hackathon.startDate
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            End Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                hackathon.endDate
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Max Team Size
                                        </span>

                                        <strong>
                                            {hackathon.maxTeamSize}
                                        </strong>
                                    </div>

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="admin-hackathon-actions">

                                <button
                                    className="admin-secondary-button"
                                    onClick={() =>
                                        navigate(
                                            `/admin/hackathons/edit/${hackathon._id}`
                                        )
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    className="admin-danger-button"
                                    onClick={() =>
                                        handleDelete(hackathon._id)
                                    }
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
};

export default AdminHackathons;