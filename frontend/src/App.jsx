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


function App() {

    return (
        <Routes>

            {/* ========================= */}
            {/* DEFAULT */}
            {/* ========================= */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />


            {/* ========================= */}
            {/* AUTHENTICATION */}
            {/* ========================= */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />


            {/* ========================= */}
            {/* PARTICIPANT PORTAL */}
            {/* ========================= */}

            <Route
                path="/participant"
                element={
                    <ProtectedRoute>
                        <ParticipantLayout />
                    </ProtectedRoute>
                }
            >

                {/* Participant Dashboard */}
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


                {/* My Registrations */}
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

                 {/* SUBMISSIONS */}

                <Route
                    path="submissions"
                    element={<Submissions />}
                />

                <Route
                    path="submissions/new"
                    element={<SubmissionForm />}
                />

                <Route
                    path="submissions/:id"
                    element={<SubmissionDetails />}
                />

                <Route
                    path="submissions/:id/edit"
                    element={<SubmissionForm />}
                />
                <Route
                    path="submissions/:id"
                    element={<SubmissionDetails />}
                />
            </Route>


            {/* ========================= */}
            {/* OTHER ROLE DASHBOARDS */}
            {/* ========================= */}

            <Route
                path="/mentor"
                element={
                    <ProtectedRoute>
                        <Dashboard title="Mentor Dashboard" />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/judge"
                element={
                    <ProtectedRoute>
                        <Dashboard title="Judge Dashboard" />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <Dashboard title="Admin Dashboard" />
                    </ProtectedRoute>
                }
            />


            {/* ========================= */}
            {/* UNKNOWN URL */}
            {/* ========================= */}

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