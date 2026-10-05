import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Hackathons from "./pages/Hackathons";
import HackathonDetails from "./pages/HackathonDetails";

import ParticipantDashboard from "./pages/ParticipantDashboard";
import ParticipantLayout from "./layouts/ParticipantLayout";

import { useAuth } from "./context/AuthContext";

import MyRegistrations from "./pages/MyRegistrations";
import MyTeam from "./pages/MyTeam";


import ManageTeam from "./pages/ManageTeam";

import Submissions from "./pages/Submissions";
import SubmissionForm from "./pages/SubmissionForm";
import SubmissionDetails from "./pages/SubmissionDetails";

import Results from "./pages/Results";

import MentorLayout from "./layouts/MentorLayout";
import MentorDashboard from "./pages/MentorDashboard";
import MentorTeams from "./pages/MentorTeams";
import MentorTeamDetails from "./pages/MentorTeamDetails";

import JudgeLayout from "./layouts/JudgeLayout";
import JudgeDashboard from "./pages/JudgeDashboard";
import JudgeProjects from "./pages/JudgeProjects";
import JudgeEvaluation from "./pages/JudgeEvaluation";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHackathons from "./pages/AdminHackathons";
import AdminCreateHackathon from "./pages/AdminCreateHackathon";
import AdminUsers from "./pages/AdminUsers";
import AdminTeams from "./pages/AdminTeams";
import AdminSubmissions from "./pages/AdminSubmissions";
import AdminEvaluations from "./pages/AdminEvaluations";
import AdminEditHackathon from "./pages/AdminEditHackathon";

import Profile from "./pages/Profile";
import Certificates
    from "./pages/Certificates";
// =====================================================
// SIMPLE DASHBOARD
// =====================================================

const Dashboard = ({ title }) => {
    const { user, logout } = useAuth();

    return (
        <div className="dashboard-page">
            <div className="dashboard-card">

                <h1>{title}</h1>

                {user && (
                    <>
                        <h2>Welcome, {user.name}</h2>
                        <p>Email: {user.email}</p>
                        <p>Role: {user.role}</p>
                    </>
                )}

                <button
                    className="auth-button"
                    onClick={logout}
                >
                    Logout
                </button>

            </div>
        </div>
    );
};


// =====================================================
// PROTECTED ROUTE
// =====================================================

const ProtectedRoute = ({ children }) => {

    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
};


// =====================================================
// ROLE PROTECTED ROUTE
// =====================================================

const RoleProtectedRoute = ({ children, role }) => {

    const { isLoggedIn, user } = useAuth();

    // Not logged in
    if (!isLoggedIn) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // Logged in but wrong role
    if (user?.role !== role) {

        if (user?.role === "participant") {
            return (
                <Navigate
                    to="/participant"
                    replace
                />
            );
        }

        if (user?.role === "mentor") {
            return (
                <Navigate
                    to="/mentor"
                    replace
                />
            );
        }

        if (user?.role === "judge") {
            return (
                <Navigate
                    to="/judge"
                    replace
                />
            );
        }

        if (user?.role === "admin") {
            return (
                <Navigate
                    to="/admin"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
};


// =====================================================
// APP
// =====================================================

function App() {

    return (
        <Routes>

            {/* ================================================= */}
            {/* DEFAULT */}
            {/* ================================================= */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />


            {/* ================================================= */}
            {/* AUTHENTICATION */}
            {/* ================================================= */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />
            <Route
    path="/profile"
    element={
        <ProtectedRoute>
            <Profile />
        </ProtectedRoute>
    }
/>


            {/* ================================================= */}
            {/* PARTICIPANT PORTAL */}
            {/* ================================================= */}

            <Route
                path="/participant"
                element={
                    <RoleProtectedRoute role="participant">
                        <ParticipantLayout />
                    </RoleProtectedRoute>
                }
            >

                {/* Dashboard */}
                <Route
                    index
                    element={<ParticipantDashboard />}
                />


                {/* Hackathons */}
                <Route
                    path="hackathons"
                    element={<Hackathons />}
                />


                {/* Hackathon Details */}
                <Route
                    path="hackathons/:id"
                    element={<HackathonDetails />}
                />

                {/* Registrations */}
                <Route
                    path="registrations"
                    element={<MyRegistrations />}
                />


                {/* My Team */}
                <Route
                    path="team"
                    element={<MyTeam />}
                />

                {/* Manage Team */}
                <Route
                    path="team/:id"
                    element={<ManageTeam />}
                />

                {/* Submissions */}
                <Route
                    path="submissions"
                    element={<Submissions />}
                />

                {/* Create Submission */}
                <Route
                    path="submissions/new"
                    element={<SubmissionForm />}
                />

                {/* Submission Details */}
                <Route
                    path="submissions/:id"
                    element={<SubmissionDetails />}
                />

                {/* Edit Submission */}
                <Route
                    path="submissions/:id/edit"
                    element={<SubmissionForm />}
                />

                {/* Results */}
                <Route
                    path="results"
                    element={<Results />}
                />
                <Route
    path="/participant/certificates"
    element={
        <ProtectedRoute>
            <Certificates />
        </ProtectedRoute>
    }
/>
<Route
    path="certificates"
    element={<Certificates />}
/>
            </Route>


            {/* ================================================= */}
            {/* MENTOR PORTAL */}
            {/* ================================================= */}

            <Route
                path="/mentor"
                element={
                    <RoleProtectedRoute role="mentor">
                        <MentorLayout />
                    </RoleProtectedRoute>
                }
            >

                {/* Mentor Dashboard */}
                <Route
                    index
                    element={<MentorDashboard />}
                />

                {/* Assigned Teams */}
                <Route
                    path="teams"
                    element={<MentorTeams />}
                />

                {/* Assigned Team Details */}
                <Route
                    path="teams/:id"
                    element={<MentorTeamDetails />}
                />

            </Route>


            {/* ================================================= */}
            {/* JUDGE PORTAL */}
            {/* ================================================= */}

            <Route
    path="/judge"
    element={
        <RoleProtectedRoute role="judge">
            <JudgeLayout />
        </RoleProtectedRoute>
    }
>
                <Route index element={<JudgeDashboard />} />

                <Route
                    path="projects"
                    element={<JudgeProjects />}
                />
                <Route
        path="projects/:id"
        element={<JudgeEvaluation />}
    />
            </Route>


            {/* ================================================= */}
            {/* ADMIN PORTAL */}
            {/* ================================================= */}

{/* ================================================= */}
{/* ADMIN PORTAL */}
{/* ================================================= */}

<Route
    path="/admin"
    element={
        <RoleProtectedRoute role="admin">
            <AdminLayout />
        </RoleProtectedRoute>
    }
>

    <Route
        index
        element={<AdminDashboard />}
    />
    <Route
        path="hackathons"
        element={<AdminHackathons />}
    />
    <Route
        path="hackathons/create"
        element={<AdminCreateHackathon />}
    />
    <Route
        path="users"
        element={<AdminUsers />}
    />
    <Route
        path="teams"
        element={<AdminTeams />}
    />
    <Route
        path="submissions"
        element={<AdminSubmissions />}
    />
    <Route
    path="/admin/evaluations"
    element={
        <AdminEvaluations />
    }
    />
    <Route
    path="hackathons/edit/:id"
    element={<AdminEditHackathon />}
/>

</Route>

            {/* ================================================= */}
            {/* UNKNOWN URL */}
            {/* ================================================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

        </Routes>
    );
}


export default App;