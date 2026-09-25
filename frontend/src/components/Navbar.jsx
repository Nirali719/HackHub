import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getInitial = () => {
        if (!user?.name) {
            return "P";
        }

        return user.name.charAt(0).toUpperCase();
    };

    return (
        <header className="navbar">

            {/* LOGO / BRAND */}
            <div
                className="navbar-brand"
                onClick={() => navigate("/participant")}
            >

                <div className="navbar-logo">
                    H
                </div>

                <div className="brand-text">
                    <h2>Hackathon Portal</h2>
                    <span>Participant</span>
                </div>

            </div>


            {/* NAVIGATION */}
            <nav className="navbar-links">

                <NavLink
                    to="/participant"
                    end
                    className={({ isActive }) =>
                        `navbar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/participant/hackathons"
                    className={({ isActive }) =>
                        `navbar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    Hackathons
                </NavLink>

                <NavLink
                    to="/participant/registrations"
                    className={({ isActive }) =>
                        `navbar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    Registrations
                </NavLink>

                <NavLink
                    to="/participant/team"
                    className={({ isActive }) =>
                        `navbar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    My Team
                </NavLink>

                <NavLink
                    to="/participant/submissions"
                    className={({ isActive }) =>
                        `navbar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    Submissions
                </NavLink>

                <NavLink
                    to="/participant/results"
                    className={({ isActive }) =>
                        `navbar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    Results
                </NavLink>

            </nav>


            {/* PROFILE */}
            <div className="profile-container">

                <button
                    className="profile-button"
                    onClick={() => setProfileOpen(!profileOpen)}
                >

                    <div className="profile-avatar">
                        {getInitial()}
                    </div>

                    <span className="profile-name">
                        {user?.name || "Profile"}
                    </span>

                    <span className="profile-arrow">
                        {profileOpen ? "▲" : "▼"}
                    </span>

                </button>


                {/* PROFILE DROPDOWN */}
                {profileOpen && (

                    <div className="profile-dropdown">

                        <div className="profile-header">

                            <div className="profile-large-avatar">
                                {getInitial()}
                            </div>

                            <div>
                                <h3>
                                    {user?.name || "Participant"}
                                </h3>

                                <span>
                                    Participant
                                </span>
                            </div>

                        </div>


                        <div className="profile-divider"></div>


                        <div className="profile-details">

                            <div className="profile-detail">

                                <span className="detail-label">
                                    Email
                                </span>

                                <span className="detail-value">
                                    {user?.email || "Not available"}
                                </span>

                            </div>


                            <div className="profile-detail">

                                <span className="detail-label">
                                    Phone
                                </span>

                                <span className="detail-value">
                                    {user?.phone || "Not available"}
                                </span>

                            </div>


                            <div className="profile-detail">

                                <span className="detail-label">
                                    College
                                </span>

                                <span className="detail-value">
                                    {user?.college || "Not available"}
                                </span>

                            </div>


                            <div className="profile-detail">

                                <span className="detail-label">
                                    Role
                                </span>

                                <span className="detail-value role-value">
                                    {user?.role || "Participant"}
                                </span>

                            </div>

                        </div>


                        <div className="profile-divider"></div>


                        <button
                            className="profile-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                )}

            </div>

        </header>
    );
};

export default Navbar;