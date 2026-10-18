import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();

    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await login(
                formData.email,
                formData.password
            );

            console.log("Login successful:", response);

            // Get logged-in user's role
            const role = response.user?.role;

            // Redirect according to role
            if (role === "admin") {
                navigate("/admin");
            } else if (role === "judge") {
                navigate("/judge");
            } else if (role === "mentor") {
                navigate("/mentor");
            } else {
                navigate("/participant");
            }

        } catch (error) {
            console.error("Login failed:", error);

            const message =
                error.response?.data?.message ||
                "Login failed. Please check your email and password.";

            setError(message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {/* =====================================
                LEFT BRANDING SECTION
            ===================================== */}

            <div className="login-brand-section">

                <div className="login-brand-content">

                    <div className="login-brand-header">
                        <div className="login-logo">
                            H
                        </div>

                        <span className="login-brand-name">
                            HackHub
                        </span>
                    </div>

                    <div className="login-brand-line"></div>

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

                    <div className="login-features">

                        <div className="login-feature">
                            <span className="feature-icon">✓</span>
                            <span>Join exciting hackathons</span>
                        </div>

                        <div className="login-feature">
                            <span className="feature-icon">✓</span>
                            <span>Build and manage your team</span>
                        </div>

                        <div className="login-feature">
                            <span className="feature-icon">✓</span>
                            <span>Submit your innovative project</span>
                        </div>

                        <div className="login-feature">
                            <span className="feature-icon">✓</span>
                            <span>Track evaluations and results</span>
                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================
                RIGHT LOGIN SECTION
            ===================================== */}

            <div className="login-form-section">

                <div className="login-card">

                    {/* Mobile Logo */}

                    <div className="login-mobile-logo">

                        <div className="login-logo">
                            H
                        </div>

                        <span>
                            HackHub
                        </span>

                    </div>


                    {/* Heading */}

                    <div className="login-heading">

                        <span className="login-eyebrow">
                            WELCOME BACK
                        </span>

                        <h2>
                            Sign in to HackHub
                        </h2>

                        <p>
                            Enter your credentials to continue
                            to your account.
                        </p>

                    </div>


                    {/* Error */}

                    {error && (
                        <div className="login-error">

                            <span className="login-error-icon">
                                !
                            </span>

                            <span>
                                {error}
                            </span>

                        </div>
                    )}


                    {/* Form */}

                    <form onSubmit={handleSubmit}>

                        {/* Email */}

                        <div className="login-field">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="login-input-wrapper">

                                <span className="login-input-icon">
                                    @
                                </span>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    required
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        {/* Password */}

                        <div className="login-field">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="login-input-wrapper">

                                <span className="login-input-icon">
                                    •••
                                </span>

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    disabled={loading}
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>


                        {/* Login Button */}

                        <button
                            type="submit"
                            className="login-submit-button"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="login-spinner"></span>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Login
                                    <span className="login-arrow">
                                        →
                                    </span>
                                </>
                            )}

                        </button>

                    </form>


                    {/* Register */}

                    <div className="login-register">

                        <span>
                            Don't have an account?
                        </span>

                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                        >
                            Create an account
                        </button>

                    </div>


                    <div className="login-footer">
                        HackHub · Hackathon Management Portal
                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;