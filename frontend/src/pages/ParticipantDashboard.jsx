import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ParticipantDashboard = () => {

    const { user } = useAuth();

    return (
        <div className="participant-dashboard">

            {/* HEADER */}

            <div className="dashboard-header">

                <div>
                    <h1>
                        Welcome, {user?.name || "Participant"}!
                    </h1>

                    <p>
                        Manage your hackathons, registrations,
                        teams and submissions from one place.
                    </p>
                </div>

            </div>


            {/* STATISTICS */}

            <div className="dashboard-stats">

                <div className="stat-card">
                    <span className="stat-title">
                        Available Hackathons
                    </span>

                    <strong className="stat-number">
                        —
                    </strong>
                </div>


                <div className="stat-card">
                    <span className="stat-title">
                        My Registrations
                    </span>

                    <strong className="stat-number">
                        —
                    </strong>
                </div>


                <div className="stat-card">
                    <span className="stat-title">
                        My Team
                    </span>

                    <strong className="stat-number">
                        —
                    </strong>
                </div>


                <div className="stat-card">
                    <span className="stat-title">
                        Submissions
                    </span>

                    <strong className="stat-number">
                        —
                    </strong>
                </div>

            </div>


            {/* QUICK ACTIONS */}

            <div className="dashboard-section">

                <div className="section-header">

                    <h2>
                        Quick Actions
                    </h2>

                    <p className="section-description">
                        Quickly access the most important
                        participant features.
                    </p>

                </div>


                <div className="quick-actions">

                    <NavLink to="/participant/hackathons">
                        <strong>Explore Hackathons</strong>

                        <span>
                            Find and register for hackathons
                        </span>
                    </NavLink>


                    <NavLink to="/participant/registrations">
                        <strong>My Registrations</strong>

                        <span>
                            View your registered hackathons
                        </span>
                    </NavLink>


                    <NavLink to="/participant/team">
                        <strong>My Team</strong>

                        <span>
                            Manage your hackathon team
                        </span>
                    </NavLink>


                    <button
                        type="button"
                        className="profile-action"
                        onClick={() => {
                            window.scrollTo({
                                top: 0,
                                behavior: "smooth"
                            });
                        }}
                    >
                        <strong>My Profile</strong>

                        <span>
                            View your account information
                        </span>
                    </button>

                </div>

            </div>

        </div>
    );
};

export default ParticipantDashboard;