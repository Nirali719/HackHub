import {
    useEffect,
    useState
} from "react";

import api from "../services/api";


const AdminDashboard = () => {

    const [stats, setStats] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        loadDashboard();

    }, []);


    const loadDashboard = async () => {

        try {

            setLoading(true);

            setError("");

            const response =
                await api.get(
                    "/admin/dashboard"
                );

            setStats(
                response.data.stats
            );

        } catch (err) {

            console.error(
                "Admin dashboard error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load admin dashboard."
            );

        } finally {

            setLoading(false);

        }

    };


    if (loading) {

        return (

            <div className="admin-loading">

                Loading admin dashboard...

            </div>

        );

    }


    if (error) {

        return (

            <div className="admin-dashboard-page">

                <div className="admin-error">

                    {error}

                </div>

            </div>

        );

    }


    return (

        <div className="admin-dashboard-page">


            {/* ==========================================
                HERO
            ========================================== */}

            <section className="admin-dashboard-hero">

                <div>

                    <p className="admin-eyebrow">
                        ADMIN PORTAL
                    </p>

                    <h1>
                        Welcome, {stats ? "Admin" : "Admin"}!
                    </h1>

                    <p>
                        Manage hackathons, users, teams,
                        submissions, evaluations and final
                        results from one place.
                    </p>

                </div>


                <div className="admin-hero-icon">
                    ⚙️
                </div>

            </section>


            {/* ==========================================
                USER STATISTICS
            ========================================== */}

            <section className="admin-section">

                <div className="admin-section-heading">

                    <div>

                        <h2>
                            Users
                        </h2>

                        <p>
                            Overview of registered users
                            by role.
                        </p>

                    </div>

                </div>


                <div className="admin-stat-grid">

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            👥
                        </div>

                        <div>

                            <span>
                                Total Users
                            </span>

                            <strong>
                                {stats.users.total}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            🧑‍💻
                        </div>

                        <div>

                            <span>
                                Participants
                            </span>

                            <strong>
                                {stats.users.participants}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            🎓
                        </div>

                        <div>

                            <span>
                                Mentors
                            </span>

                            <strong>
                                {stats.users.mentors}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            ⚖️
                        </div>

                        <div>

                            <span>
                                Judges
                            </span>

                            <strong>
                                {stats.users.judges}
                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==========================================
                HACKATHON STATISTICS
            ========================================== */}

            <section className="admin-section">

                <div className="admin-section-heading">

                    <div>

                        <h2>
                            Hackathons
                        </h2>

                        <p>
                            Current hackathon overview.
                        </p>

                    </div>

                </div>


                <div className="admin-stat-grid">

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            🏆
                        </div>

                        <div>

                            <span>
                                Total Hackathons
                            </span>

                            <strong>
                                {stats.hackathons.total}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            🚀
                        </div>

                        <div>

                            <span>
                                Active
                            </span>

                            <strong>
                                {stats.hackathons.active}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            ✅
                        </div>

                        <div>

                            <span>
                                Completed
                            </span>

                            <strong>
                                {stats.hackathons.completed}
                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==========================================
                ACTIVITY
            ========================================== */}

            <section className="admin-section">

                <div className="admin-section-heading">

                    <div>

                        <h2>
                            Portal Activity
                        </h2>

                        <p>
                            Current progress across the
                            hackathon workflow.
                        </p>

                    </div>

                </div>


                <div className="admin-stat-grid">


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            👨‍👩‍👧‍👦
                        </div>

                        <div>

                            <span>
                                Teams
                            </span>

                            <strong>
                                {stats.teams.total}
                            </strong>

                            <small>
                                {stats.teams.completed}
                                {" "}completed
                            </small>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            📤
                        </div>

                        <div>

                            <span>
                                Submissions
                            </span>

                            <strong>
                                {stats.submissions.total}
                            </strong>

                            <small>
                                {stats.submissions.evaluated}
                                {" "}evaluated
                            </small>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            ⭐
                        </div>

                        <div>

                            <span>
                                Evaluations
                            </span>

                            <strong>
                                {stats.evaluations.total}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            🥇
                        </div>

                        <div>

                            <span>
                                Results
                            </span>

                            <strong>
                                {stats.results.total}
                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==========================================
                REGISTRATION SUMMARY
            ========================================== */}

            <section className="admin-section">

                <div className="admin-summary-card">

                    <div>

                        <h2>
                            Registration Summary
                        </h2>

                        <p>
                            {stats.registrations.approved}
                            {" "}of{" "}
                            {stats.registrations.total}
                            {" "}registrations are approved.
                        </p>

                    </div>


                    <div className="admin-summary-number">

                        {stats.registrations.total}

                    </div>

                </div>

            </section>


        </div>

    );

};


export default AdminDashboard;