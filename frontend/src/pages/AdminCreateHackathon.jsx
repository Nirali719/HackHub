import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminCreateHackathon = () => {
    const navigate = useNavigate();

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

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

        try {
            setLoading(true);

            const response = await api.post(
                "/hackathons",
                {
                   
    title: formData.title,
    description: formData.description,
    eligibility: formData.eligibility,
    rules: formData.rules,
    registrationDeadline:
        formData.registrationDeadline,
    submissionDeadline:
        formData.submissionDeadline,
    startDate: formData.startDate,
    endDate: formData.endDate,
    maxTeamSize: Number(formData.maxTeamSize),
    status: formData.status,

                }
            );

            if (response.data?.success) {
                alert("Hackathon created successfully!");

                navigate("/admin/hackathons");
            }

        } catch (err) {
            console.error(
                "Create Hackathon Error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Failed to create hackathon."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">

            {/* HEADER */}

            <div className="admin-page-header">

                <div>
                    <h1>
                        Create Hackathon
                    </h1>

                    <p>
                        Create a new hackathon for participants.
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


            {/* ERROR */}

            {error && (
                <div className="admin-form-error">
                    {error}
                </div>
            )}


            {/* FORM */}

            <form
                className="admin-hackathon-form"
                onSubmit={handleSubmit}
            >

                {/* BASIC INFORMATION */}

                <div className="admin-form-section">

                    <h2>
                        Basic Information
                    </h2>

                    {/* TITLE */}

                    <div className="admin-form-group">

                        <label>
                            Hackathon Title *
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter hackathon title"
                            required
                        />

                    </div>


                    {/* DESCRIPTION */}

                    <div className="admin-form-group">

                        <label>
                            Description *
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the hackathon"
                            rows="5"
                            required
                        />

                    </div>


                    {/* ELIGIBILITY */}

                    <div className="admin-form-group">

                        <label>
                            Eligibility
                        </label>

                        <textarea
                            name="eligibility"
                            value={formData.eligibility}
                            onChange={handleChange}
                            placeholder="Who can participate?"
                            rows="3"
                        />

                    </div>
                    <div className="form-group">
    <label htmlFor="rules">
        Hackathon Rules
    </label>

    <textarea
        id="rules"
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

                    <h2>
                        Important Dates
                    </h2>


                    <div className="admin-form-grid">

                        {/* REGISTRATION */}

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


                        {/* SUBMISSION */}

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


                        {/* START */}

                        <div className="admin-form-group">

                            <label>
                                Start Date *
                            </label>

                            <input
                                type="datetime-local"
                                name="startDate"
                                value={
                                    formData.startDate
                                }
                                onChange={handleChange}
                                required
                            />

                        </div>


                        {/* END */}

                        <div className="admin-form-group">

                            <label>
                                End Date *
                            </label>

                            <input
                                type="datetime-local"
                                name="endDate"
                                value={
                                    formData.endDate
                                }
                                onChange={handleChange}
                                required
                            />

                        </div>

                    </div>

                </div>


                {/* TEAM SETTINGS */}

                <div className="admin-form-section">

                    <h2>
                        Team Settings
                    </h2>

                    <div className="admin-form-grid">

                        <div className="admin-form-group">

                            <label>
                                Maximum Team Size *
                            </label>

                            <input
                                type="number"
                                name="maxTeamSize"
                                value={
                                    formData.maxTeamSize
                                }
                                onChange={handleChange}
                                min="1"
                                max="20"
                                required
                            />

                        </div>


                        {/* STATUS */}

                        <div className="admin-form-group">

                            <label>
                                Initial Status
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
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Hackathon"}
                    </button>

                </div>

            </form>

        </div>
    );
};

export default AdminCreateHackathon;