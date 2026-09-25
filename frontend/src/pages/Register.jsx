import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "participant",
        college: "",
        phone: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/users/register", {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                college: formData.college,
                phone: formData.phone
            });

            setSuccess(
                "Registration successful! Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            console.error("Registration Error:", error);

            if (error.response) {
                setError(
                    error.response.data?.message ||
                    "Registration failed."
                );
            } else {
                setError(
                    "Cannot connect to backend. Make sure app.js is running."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card register-card">

                <div className="auth-header">

                    <div className="logo-circle">
                        H
                    </div>

                    <h1>Create Account</h1>

                    <p>
                        Join the Hackathon Management Portal
                    </p>

                </div>

                {error && (
                    <div className="error-box">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-box">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label>Full Name</label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-row">

                        <div className="input-group">
                            <label>Phone</label>

                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Role</label>

                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="participant">
                                    Participant
                                </option>

                                <option value="mentor">
                                    Mentor
                                </option>

                                <option value="judge">
                                    Judge
                                </option>
                            </select>
                        </div>

                    </div>

                    <div className="input-group">
                        <label>College</label>

                        <input
                            type="text"
                            name="college"
                            placeholder="Enter your college"
                            value={formData.college}
                            onChange={handleChange}
                            required={formData.role === "participant"}
                        />
                    </div>

                    <div className="input-row">

                        <div className="input-group">
                            <label>Password</label>

                            <input
                                type="password"
                                name="password"
                                placeholder="Minimum 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Confirm Password</label>

                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>

                    <button
                        className="auth-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>

                <div className="auth-footer">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        type="button"
                        className="link-button"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>

                </div>

            </div>

        </div>
    );
};

export default Register;