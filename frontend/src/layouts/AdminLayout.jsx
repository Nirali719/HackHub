
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
    const { user, logout } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();

    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navLinks = [
        {
            name: "Dashboard",
            path: "/admin",
            exact: true
        },
        {
            name: "Hackathons",
            path: "/admin/hackathons"
        },
        {
            name: "Users",
            path: "/admin/users"
        },
        {
            name: "Teams",
            path: "/admin/teams"
        },
        {
            name: "Submissions",
            path: "/admin/submissions"
        },
        {
            name: "Evaluations & Results",
            path: "/admin/evaluations"
        }
    ];

    const isActive = (link) => {
        if (link.exact) {
            return location.pathname === link.path;
        }

        return location.pathname.startsWith(link.path);
    };

    return (
        <div className="admin-app">

            {/* NAVBAR */}

            <header className="admin-navbar">

                {/* BRAND */}

                <div
                    className="admin-brand"
                    onClick={() => navigate("/admin")}
                >
                    <div className="admin-brand-icon">
                        H
                    </div>

                    <div className="admin-brand-info">
                        <div className="admin-brand-title">
                            Hackathon Portal
                        </div>

                        <div className="admin-brand-subtitle">
                            Admin
                        </div>
                    </div>
                </div>

                {/* NAVIGATION */}

                <nav className="admin-nav">

                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={
                                isActive(link)
                                    ? "admin-nav-link active"
                                    : "admin-nav-link"
                            }
                        >
                            {link.name}
                        </Link>
                    ))}

                </nav>

                {/* PROFILE */}

                <div className="admin-profile-wrapper">

                    <button
                        type="button"
                        className="admin-profile-button"
                        onClick={() => setProfileOpen(!profileOpen)}
                    >
                        <div className="admin-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || "A"}
                        </div>

                        <span className="admin-profile-name">
                            {user?.name || "Admin"}
                        </span>

                        <span className="admin-profile-arrow">
                            ▾
                        </span>
                    </button>

                    {profileOpen && (
                        <>
                            <div
                                className="admin-dropdown-overlay"
                                onClick={() => setProfileOpen(false)}
                            />

                            <div className="admin-profile-menu">

                                <div className="admin-profile-header">

                                    <div className="admin-menu-avatar">
                                        {user?.name?.charAt(0)?.toUpperCase() || "A"}
                                    </div>

                                    <div className="admin-profile-user-info">
                                        <strong>
                                            {user?.name || "Admin"}
                                        </strong>

                                        <span>
                                            {user?.email}
                                        </span>
                                    </div>

                                </div>

                                <div className="admin-profile-role">
                                    <span>Role</span>

                                    <strong>
                                        {user?.role || "admin"}
                                    </strong>
                                </div>

                                <button
                                    className="admin-logout-button"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>

                            </div>
                        </>
                    )}

                </div>

            </header>

            {/* PAGE CONTENT */}

            <main className="admin-main">
                <Outlet />
            </main>

        </div>
    );
};

export default AdminLayout;
