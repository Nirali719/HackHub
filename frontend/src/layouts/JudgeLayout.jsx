import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function JudgeLayout() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="judge-layout">
            <nav className="judge-navbar">
                <div
                    className="judge-navbar-brand"
                    onClick={() => navigate("/judge")}
                >
                    Hackathon Portal
                </div>

                <div className="judge-navbar-links">
                    <NavLink
                        to="/judge"
                        end
                        className={({ isActive }) =>
                            isActive ? "judge-nav-link active" : "judge-nav-link"
                        }
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/judge/projects"
                        className={({ isActive }) =>
                            isActive ? "judge-nav-link active" : "judge-nav-link"
                        }
                    >
                        Projects
                    </NavLink>

                    <div className="judge-profile-menu">
                        <button className="judge-profile-button">
                            Profile ▾
                        </button>

                        <div className="judge-profile-dropdown">
                            <p className="judge-profile-name">
                                {user?.name}
                            </p>

                            <p>{user?.email}</p>

                            <p>
                                Role:{" "}
                                <span className="judge-role-text">
                                    {user?.role}
                                </span>
                            </p>

                            <div className="judge-profile-divider"></div>

                            <button
                                className="judge-logout-button"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="judge-page-container">
                <Outlet />
            </main>
        </div>
    );
}

export default JudgeLayout;