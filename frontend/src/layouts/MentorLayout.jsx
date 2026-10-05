import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const MentorLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="mentor-app">

            {/* ================= NAVBAR ================= */}

            <header className="mentor-navbar">

                <div
                    className="mentor-brand"
                    onClick={() => navigate("/mentor")}
                >
                    <div className="mentor-brand-icon">
                        H
                    </div>

                    <div>
                        <div className="mentor-brand-title">
                           Hackathon Portal
                        </div>

                        <div className="mentor-brand-subtitle">
                            Mentor Portal
                        </div>
                    </div>
                </div>


                <nav className="mentor-nav">

                    <Link
                        to="/mentor"
                        className={
                            location.pathname === "/mentor"
                                ? "mentor-nav-link active"
                                : "mentor-nav-link"
                        }
                    >
                        Dashboard
                    </Link>


                    <Link
                        to="/mentor/teams"
                        className={
                            location.pathname.startsWith("/mentor/teams")
                                ? "mentor-nav-link active"
                                : "mentor-nav-link"
                        }
                    >
                        Assigned Teams
                    </Link>

                </nav>


                {/* ================= PROFILE ================= */}

                <div className="mentor-profile-wrapper">

                    <button
                        className="mentor-profile-button"
                        onClick={() => setProfileOpen(!profileOpen)}
                    >

                        <div className="mentor-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || "M"}
                        </div>

                        <span>
                            {user?.name || "Mentor"}
                        </span>

                        <span className="mentor-profile-arrow">
                            ▾
                        </span>

                    </button>


                    {profileOpen && (

                        <div className="mentor-profile-menu">

                            <div className="mentor-profile-header">

                                <div className="mentor-menu-avatar">
                                    {user?.name?.charAt(0)?.toUpperCase() || "M"}
                                </div>

                                <div>
                                    <strong>
                                        {user?.name}
                                    </strong>

                                    <span>
                                        {user?.email}
                                    </span>
                                </div>

                            </div>


                            <div className="mentor-profile-role">
                                <span>Role</span>
                                <strong>
                                    {user?.role}
                                </strong>
                            </div>


                            <button
                                className="mentor-logout-button"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>

                        </div>

                    )}

                </div>

            </header>


            {/* ================= PAGE CONTENT ================= */}

            <main className="mentor-main">
                <Outlet />
            </main>

        </div>
    );
};

export default MentorLayout;