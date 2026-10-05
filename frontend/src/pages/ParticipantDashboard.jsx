import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const ParticipantDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        hackathons: 0,
        registrations: 0,
        teams: 0,
        submissions: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);

            const [
                hackathonsResponse,
                registrationsResponse,
                teamsResponse,
                submissionsResponse
            ] = await Promise.all([
                api.get("/hackathons"),
                api.get("/registrations"),
                api.get("/teams"),
                api.get("/submissions")
            ]);

            const hackathons =
                hackathonsResponse.data.hackathons || [];

            const registrations =
                registrationsResponse.data.registrations || [];

            const allTeams =
                teamsResponse.data.teams || [];

            const allSubmissions =
                submissionsResponse.data.submissions || [];

            const userId = String(user?._id || user?.id || "");

            // Find teams where current user is leader or member
            const myTeams = allTeams.filter((team) => {
                const leaderId =
                    team.leader?._id ||
                    team.leader;

                const isLeader =
                    String(leaderId) === userId;

                const isMember =
                    (team.members || []).some((member) => {
                        const memberId =
                            member?._id ||
                            member;

                        return String(memberId) === userId;
                    });

                return isLeader || isMember;
            });

            // Find submissions belonging to user's teams
            const myTeamIds = myTeams.map((team) =>
                String(team._id)
            );

            const mySubmissions = allSubmissions.filter(
                (submission) => {
                    const teamId =
                        submission.team?._id ||
                        submission.team;

                    return myTeamIds.includes(
                        String(teamId)
                    );
                }
            );

            setStats({
                hackathons: hackathons.length,
                registrations: registrations.length,
                teams: myTeams.length,
                submissions: mySubmissions.length
            });

        } catch (error) {
            console.error(
                "Error loading dashboard statistics:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const getInitial = () => {
        if (!user?.name) {
            return "P";
        }

        return user.name
            .charAt(0)
            .toUpperCase();
    };

    return (
        <div className="participant-dashboard">

            {/* =========================
                WELCOME SECTION
            ========================= */}

            <section className="dashboard-welcome">

                <div className="welcome-content">

                    <div className="welcome-text">

                        <span className="welcome-label">
                            PARTICIPANT DASHBOARD
                        </span>

                        <h1>
                            Welcome back,{" "}
                            <span>
                                {user?.name || "Participant"}
                            </span>
                            !
                        </h1>

                        <p>
                            Manage your hackathons,
                            registrations, teams and
                            submissions from one place.
                        </p>

                    </div>

                    <div className="welcome-avatar">
                        {getInitial()}
                    </div>

                </div>

            </section>


            {/* =========================
                STATISTICS
            ========================= */}

            <section className="dashboard-stats">

                {/* Hackathons */}

                <div className="participant-stat-card">

                    <div className="stat-icon blue">
                        ⌁
                    </div>

                    <div className="stat-content">

                        <span>
                            Available Hackathons
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : stats.hackathons}
                        </strong>

                    </div>

                </div>


                {/* Registrations */}

                <div className="participant-stat-card">

                    <div className="stat-icon purple">
                        ✓
                    </div>

                    <div className="stat-content">

                        <span>
                            My Registrations
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : stats.registrations}
                        </strong>

                    </div>

                </div>


                {/* Teams */}

                <div className="participant-stat-card">

                    <div className="stat-icon green">
                        ♟
                    </div>

                    <div className="stat-content">

                        <span>
                            My Teams
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : stats.teams}
                        </strong>

                    </div>

                </div>


                {/* Submissions */}

                <div className="participant-stat-card">

                    <div className="stat-icon orange">
                        ↑
                    </div>

                    <div className="stat-content">

                        <span>
                            My Submissions
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : stats.submissions}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =========================
                QUICK ACTIONS
            ========================= */}

            <section className="dashboard-section participant-actions">

                <div className="section-heading">

                    <div>

                        <h2>
                            Quick Actions
                        </h2>

                        <p>
                            Quickly access the most important
                            participant features.
                        </p>

                    </div>

                </div>


                <div className="participant-action-grid">

                    {/* Explore */}

                    <NavLink
                        to="/participant/hackathons"
                        className="participant-action-card"
                    >

                        <div className="action-icon blue">
                            ⌕
                        </div>

                        <div className="action-content">

                            <h3>
                                Explore Hackathons
                            </h3>

                            <p>
                                Find upcoming hackathons
                                and register for exciting
                                challenges.
                            </p>

                        </div>

                        <span className="action-arrow">
                            →
                        </span>

                    </NavLink>


                    {/* Registrations */}

                    <NavLink
                        to="/participant/registrations"
                        className="participant-action-card"
                    >

                        <div className="action-icon purple">
                            ✓
                        </div>

                        <div className="action-content">

                            <h3>
                                My Registrations
                            </h3>

                            <p>
                                View and manage the
                                hackathons you have joined.
                            </p>

                        </div>

                        <span className="action-arrow">
                            →
                        </span>

                    </NavLink>


                    {/* Team */}

                    <NavLink
                        to="/participant/team"
                        className="participant-action-card"
                    >

                        <div className="action-icon green">
                            ♟
                        </div>

                        <div className="action-content">

                            <h3>
                                My Team
                            </h3>

                            <p>
                                Manage your team members
                                and team information.
                            </p>

                        </div>

                        <span className="action-arrow">
                            →
                        </span>

                    </NavLink>


                    {/* Submissions */}

                    <NavLink
                        to="/participant/submissions"
                        className="participant-action-card"
                    >

                        <div className="action-icon orange">
                            ↑
                        </div>

                        <div className="action-content">

                            <h3>
                                My Submissions
                            </h3>

                            <p>
                                View, update and track
                                your project submissions.
                            </p>

                        </div>

                        <span className="action-arrow">
                            →
                        </span>

                    </NavLink>

                </div>

            </section>


            {/* =========================
                GET STARTED
            ========================= */}

            <section className="dashboard-get-started">

                <div className="get-started-icon">
                    H
                </div>

                <div className="get-started-content">

                    <h2>
                        Ready for your next challenge?
                    </h2>

                    <p>
                        Explore available hackathons and
                        start building something amazing.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/participant/hackathons"
                        )
                    }
                >
                    Explore Hackathons
                    <span>→</span>
                </button>

            </section>

        </div>
    );
};

export default ParticipantDashboard;