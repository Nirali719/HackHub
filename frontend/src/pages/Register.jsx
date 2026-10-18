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
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
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
        <div className="register-page">

            {/* ================= LEFT SIDE ================= */}

            <div className="register-left">

                <div className="register-brand">

                    <div className="register-logo">
                        H
                    </div>

                    <span>HackHub</span>

                </div>


                <div className="register-left-content">

                    <div className="register-blue-line"></div>

                    <h1>
                        Build.
                        <br />
                        Compete.
                        <br />
                        Innovate.
                    </h1>

                    <p>
                        A complete platform to discover hackathons,
                        build teams, submit projects, evaluate ideas,
                        and celebrate innovation.
                    </p>


                    <div className="register-points">

                        <div className="register-point">
                            <span>✓</span>
                            <p>Join exciting hackathons</p>
                        </div>

                        <div className="register-point">
                            <span>✓</span>
                            <p>Build and manage your team</p>
                        </div>

                        <div className="register-point">
                            <span>✓</span>
                            <p>Submit your innovative project</p>
                        </div>

                        <div className="register-point">
                            <span>✓</span>
                            <p>Track evaluations and results</p>
                        </div>

                    </div>

                </div>

            </div>


            {/* ================= RIGHT SIDE ================= */}

            <div className="register-right">

                <div className="register-form-container">

                    <div className="register-heading">

                        <div className="register-eyebrow">
                            GET STARTED
                        </div>

                        <h2>
                            Create your HackHub account
                        </h2>

                        <p>
                            Enter your details to get started with HackHub.
                        </p>

                    </div>


                    {error && (
                        <div className="register-error">
                            {error}
                        </div>
                    )}


                    {success && (
                        <div className="register-success">
                            {success}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        {/* NAME + EMAIL */}

                        <div className="register-row">

                            <div className="register-field">

                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="register-field">

                                <label>
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>


                        {/* ROLE + COLLEGE */}

                        <div className="register-row">

                            <div className="register-field">

                                <label>
                                    Role
                                </label>

                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="participant">
                                        Participant
                                    </option>

                                    <option value="mentor">
                                        Mentor
                                    </option>

                                    <option value="admin">
                                        Admin
                                    </option>

                                </select>

                            </div>


                            <div className="register-field">

                                <label>
                                    College
                                </label>

                                <input
                                    type="text"
                                    name="college"
                                    placeholder="Enter your college"
                                    value={formData.college}
                                    onChange={handleChange}
                                    required={
                                        formData.role === "participant"
                                    }
                                />

                            </div>

                        </div>


                        {/* PHONE */}

                        <div className="register-field">

                            <label>
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                placeholder="Enter your 10-digit phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                maxLength="10"
                                required
                            />

                        </div>


                        {/* PASSWORD + CONFIRM */}

                        <div className="register-row">

                            <div className="register-field">

                                <label>
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Minimum 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="register-field">

                                <label>
                                    Confirm Password
                                </label>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>


                        {/* BUTTON */}

                        <button
                            className="register-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account"}

                            <span>→</span>

                        </button>

                    </form>


                    {/* LOGIN */}

                    <div className="register-login">

                        <span>
                            Already have an account?
                        </span>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Sign in
                        </button>

                    </div>


                    <div className="register-footer">
                        HackHub · Hackathon Management Portal
                    </div>

                </div>

            </div>

        </div>
    );
};

export default Register;