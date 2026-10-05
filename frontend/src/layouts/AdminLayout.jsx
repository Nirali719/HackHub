import {
    Link,
    Outlet,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    useState
} from "react";

import {
    useAuth
} from "../context/AuthContext";


const AdminLayout = () => {

    const {
        user,
        logout
    } = useAuth();

    const location = useLocation();

    const navigate = useNavigate();

    const [profileOpen, setProfileOpen] =
        useState(false);


    const handleLogout = () => {

        logout();

        navigate("/login");

    };


    return (

        <div className="admin-app">


            {/* ==========================================
                NAVBAR
            ========================================== */}

            <header className="admin-navbar">


                {/* BRAND */}

                <div
                    className="admin-brand"
                    onClick={() =>
                        navigate("/admin")
                    }
                >

                    <div className="admin-brand-icon">
                        H
                    </div>

                    <div>

                        <div className="admin-brand-title">
                            Hackathon Portal
                        </div>

                        <div className="admin-brand-subtitle">
                            Admin Portal
                        </div>

                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="admin-nav">

    {/* DASHBOARD */}

    <Link
        to="/admin"
        className={
            location.pathname === "/admin"
                ? "admin-nav-link active"
                : "admin-nav-link"
        }
    >
        Dashboard
    </Link>


    {/* HACKATHONS */}

    <Link
        to="/admin/hackathons"
        className={
            location.pathname.startsWith("/admin/hackathons")
                ? "admin-nav-link active"
                : "admin-nav-link"
        }
    >
        Hackathons
    </Link>
    <Link
    to="/admin/users"
    className={
        location.pathname.startsWith("/admin/users")
            ? "admin-nav-link active"
            : "admin-nav-link"
    }
>
    Users
</Link>
<Link
    to="/admin/teams"
    className={
        location.pathname.startsWith("/admin/teams")
            ? "admin-nav-link active"
            : "admin-nav-link"
    }
>
    Teams
</Link>
<Link
    to="/admin/submissions"
    className={
        location.pathname.startsWith("/admin/submissions")
            ? "admin-nav-link active"
            : "admin-nav-link"
    }
>
    Submissions
</Link>
<Link
    to="/admin/evaluations"
    className={
        location.pathname.startsWith("/admin/evaluations")
            ? "active"
            : ""
    }
>
    Evaluations & Results
</Link>

</nav>


                {/* PROFILE */}

                <div className="admin-profile-wrapper">

                    <button
                        className="admin-profile-button"
                        onClick={() =>
                            setProfileOpen(!profileOpen)
                        }
                    >

                        <div className="admin-avatar">

                            {user?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "A"}

                        </div>

                        <span>
                            {user?.name || "Admin"}
                        </span>

                        <span className="admin-profile-arrow">
                            ▾
                        </span>

                    </button>


                    {profileOpen && (

                        <div className="admin-profile-menu">

                            <div className="admin-profile-header">

                                <div className="admin-menu-avatar">

                                    {user?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "A"}

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


                            <div className="admin-profile-role">

                                <span>
                                    Role
                                </span>

                                <strong>
                                    {user?.role}
                                </strong>

                            </div>


                            <button
                                className="admin-logout-button"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>

                        </div>

                    )}

                </div>

            </header>


            {/* ==========================================
                PAGE CONTENT
            ========================================== */}

            <main className="admin-main">

                <Outlet />

            </main>

        </div>

    );

};


export default AdminLayout;