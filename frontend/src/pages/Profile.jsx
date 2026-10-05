import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        college: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==========================================
    // LOAD PROFILE
    // ==========================================

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/users/profile");

                const profile = response.data.user;

                setFormData({
                    name: profile.name || "",
                    email: profile.email || "",
                    phone: profile.phone || "",
                    college: profile.college || ""
                });

                // Keep latest profile in AuthContext/localStorage
                updateUser(profile);

            } catch (err) {
                console.error("Load Profile Error:", err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load profile"
                );
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    // ==========================================
    // INPUT CHANGE
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    // ==========================================
    // UPDATE PROFILE
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.name.trim()) {
            setError("Name is required.");
            return;
        }

        if (!formData.email.trim()) {
            setError("Email is required.");
            return;
        }

        if (!formData.phone.trim()) {
            setError("Phone is required.");
            return;
        }

        if (user?.role === "participant" && !formData.college.trim()) {
            setError("College is required for participants.");
            return;
        }

        try {
            setSaving(true);

            const response = await api.put("/users/profile", {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                college: formData.college.trim()
            });

            const updatedUser = response.data.user;

            // Update React state + localStorage
            updateUser(updatedUser);

            // Keep form synchronized
            setFormData({
                name: updatedUser.name || "",
                email: updatedUser.email || "",
                phone: updatedUser.phone || "",
                college: updatedUser.college || ""
            });

            setSuccess("Profile updated successfully.");

        } catch (err) {
            console.error("Update Profile Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to update profile"
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-card">
                    <div className="profile-loading">
                        Loading profile...
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="profile-page">

            <div className="profile-card">

                {/* HEADER */}

                <div className="profile-page-header">

                    <div>
                        <h1>My Profile</h1>
                        <p>
                            View and update your profile information.
                        </p>
                    </div>

                    <div className="profile-page-avatar">
                        {formData.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="profile-message profile-error">
                        {error}
                    </div>
                )}


                {/* SUCCESS */}

                {success && (
                    <div className="profile-message profile-success">
                        {success}
                    </div>
                )}


                {/* FORM */}

                <form
                    className="profile-form"
                    onSubmit={handleSubmit}
                >

                    {/* NAME */}

                    <div className="profile-form-group">

                        <label htmlFor="name">
                            Full Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="profile-form-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                        />

                    </div>


                    {/* PHONE */}

                    <div className="profile-form-group">

                        <label htmlFor="phone">
                            Phone
                        </label>

                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                        />

                    </div>


                    {/* COLLEGE */}

                    <div className="profile-form-group">

                        <label htmlFor="college">
                            College
                        </label>

                        <input
                            id="college"
                            name="college"
                            type="text"
                            value={formData.college}
                            onChange={handleChange}
                            placeholder="Enter your college"
                        />

                    </div>


                    {/* ROLE */}

                    <div className="profile-form-group">

                        <label>
                            Role
                        </label>

                        <input
                            type="text"
                            value={user?.role || ""}
                            disabled
                            className="profile-readonly"
                        />

                        <small>
                            Your role can only be changed by an administrator.
                        </small>

                    </div>


                    {/* BUTTONS */}

                    <div className="profile-form-actions">

                        <button
                            type="button"
                            className="profile-cancel-button"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="profile-save-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default Profile;