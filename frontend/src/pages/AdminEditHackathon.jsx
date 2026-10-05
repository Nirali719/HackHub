import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const AdminEditHackathon = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        eligibility: "",
        rules: "",
        registrationDeadline: "",
        submissionDeadline: "",
        startDate: "",
        endDate: "",
        maxTeamSize: 4,
        status: "draft",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadHackathon();
    }, [id]);

    const formatDateTimeForInput = (date) => {
        if (!date) return "";

        const d = new Date(date);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const loadHackathon = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/hackathons/${id}`);

            if (!response.data?.success) {
                setError("Unable to load hackathon.");
                return;
            }

            const hackathon = response.data.hackathon;

            setFormData({
                title: hackathon.title || "",
                description: hackathon.description || "",
                eligibility: hackathon.eligibility || "",
                rules: hackathon.rules || "",

                registrationDeadline:
                    formatDateTimeForInput(
                        hackathon.registrationDeadline
                    ),

                submissionDeadline:
                    formatDateTimeForInput(
                        hackathon.submissionDeadline
                    ),

                startDate:
                    formatDateTimeForInput(
                        hackathon.startDate
                    ),

                endDate:
                    formatDateTimeForInput(
                        hackathon.endDate
                    ),

                maxTeamSize:
                    hackathon.maxTeamSize || 4,

                status:
                    hackathon.status || "draft",
            });

        } catch (err) {
            console.error(
                "Load Hackathon Error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load hackathon."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (
            !formData.title ||
            !formData.description ||
            !formData.registrationDeadline ||
            !formData.submissionDeadline ||
            !formData.startDate ||
            !formData.endDate
        ) {
            setError("Please fill all required fields.");
            return;
        }

        if (
            new Date(formData.registrationDeadline) >
            new Date(formData.submissionDeadline)
        ) {
            setError(
                "Registration deadline cannot be after the submission deadline."
            );
            return;
        }

        try {
            setSaving(true);

            const response = await api.put(
                `/hackathons/${id}`,
                {
                    title: formData.title,
                    description: formData.description,
                    eligibility: formData.eligibility,
                    rules: formData.rules,

                    registrationDeadline:
                        formData.registrationDeadline,

                    submissionDeadline:
                        formData.submissionDeadline,

                    startDate:
                        formData.startDate,

                    endDate:
                        formData.endDate,

                    maxTeamSize:
                        Number(formData.maxTeamSize),

                    status:
                        formData.status,
                }
            );

            if (response.data?.success) {
                alert("Hackathon updated successfully!");

                navigate("/admin/hackathons");
            }

        } catch (err) {
            console.error(
                "Update Hackathon Error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Failed to update hackathon."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    Loading hackathon...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">

            <div className="admin-page-header">

                <div>
                    <h1>Edit Hackathon</h1>

                    <p>
                        Update hackathon rules, deadlines and details.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() =>
                        navigate("/admin/hackathons")
                    }
                >
                    ← Back
                </button>

            </div>


            {error && (
                <div className="admin-form-error">
                    {error}
                </div>
            )}


            <form
                className="admin-hackathon-form"
                onSubmit={handleSubmit}
            >

                {/* BASIC INFORMATION */}

                <div className="admin-form-section">

                    <h2>Basic Information</h2>

                    <div className="admin-form-group">

                        <label>
                            Hackathon Title *
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    <div className="admin-form-group">

                        <label>
                            Description *
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            required
                        />

                    </div>


                    <div className="admin-form-group">

                        <label>
                            Eligibility
                        </label>

                        <textarea
                            name="eligibility"
                            value={formData.eligibility}
                            onChange={handleChange}
                            rows="3"
                        />

                    </div>


                    <div className="admin-form-group">

                        <label>
                            Hackathon Rules
                        </label>

                        <textarea
                            name="rules"
                            value={formData.rules}
                            onChange={handleChange}
                            placeholder="Enter hackathon rules and guidelines"
                            rows="5"
                        />

                    </div>

                </div>


                {/* DATES */}

                <div className="admin-form-section">

                    <h2>Important Dates</h2>

                    <div className="admin-form-grid">

                        <div className="admin-form-group">

                            <label>
                                Registration Deadline *
                            </label>

                            <input
                                type="datetime-local"
                                name="registrationDeadline"
                                value={
                                    formData.registrationDeadline
                                }
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="admin-form-group">

                            <label>
                                Submission Deadline *
                            </label>

                            <input
                                type="datetime-local"
                                name="submissionDeadline"
                                value={
                                    formData.submissionDeadline
                                }
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="admin-form-group">

                            <label>
                                Start Date *
                            </label>

                            <input
                                type="datetime-local"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="admin-form-group">

                            <label>
                                End Date *
                            </label>

                            <input
                                type="datetime-local"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                            />

                        </div>

                    </div>

                </div>


                {/* TEAM SETTINGS */}

                <div className="admin-form-section">

                    <h2>Team Settings</h2>

                    <div className="admin-form-grid">

                        <div className="admin-form-group">

                            <label>
                                Maximum Team Size *
                            </label>

                            <input
                                type="number"
                                name="maxTeamSize"
                                value={formData.maxTeamSize}
                                onChange={handleChange}
                                min="1"
                                max="20"
                                required
                            />

                        </div>


                        <div className="admin-form-group">

                            <label>
                                Status
                            </label>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="draft">
                                    Draft
                                </option>

                                <option value="published">
                                    Published
                                </option>

                                <option value="ongoing">
                                    Ongoing
                                </option>

                                <option value="completed">
                                    Completed
                                </option>

                                <option value="cancelled">
                                    Cancelled
                                </option>
                            </select>

                        </div>

                    </div>

                </div>


                {/* ACTIONS */}

                <div className="admin-form-actions">

                    <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() =>
                            navigate("/admin/hackathons")
                        }
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="admin-primary-button"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                </div>

            </form>

        </div>
    );
};

export default AdminEditHackathon;