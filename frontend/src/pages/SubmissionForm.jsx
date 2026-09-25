import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams
} from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function SubmissionForm() {

    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const isEditMode = Boolean(id);

    const [teams, setTeams] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    const [formData, setFormData] = useState({
        hackathon: "",
        team: "",
        projectTitle: "",
        description: "",
        githubUrl: "",
        demoUrl: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // ==========================================
    // LOAD DATA
    // ==========================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [teamResponse, submissionResponse] =
                await Promise.all([
                    api.get("/teams"),
                    api.get("/submissions")
                ]);

            const allTeams =
                teamResponse.data.teams || [];

            const allSubmissions =
                submissionResponse.data.submissions || [];

            setTeams(allTeams);
            setSubmissions(allSubmissions);

            // EDIT MODE
            if (isEditMode) {

                const response = await api.get(
                    `/submissions/${id}`
                );

                const submission =
                    response.data.submission;

                setFormData({
                    hackathon:
                        submission.hackathon?._id ||
                        submission.hackathon ||
                        "",

                    team:
                        submission.team?._id ||
                        submission.team ||
                        "",

                    projectTitle:
                        submission.projectTitle || "",

                    description:
                        submission.description || "",

                    githubUrl:
                        submission.githubUrl || "",

                    demoUrl:
                        submission.demoUrl || ""
                });
            }

        } catch (err) {

            console.error(
                "Load submission form error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load submission form"
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    // ==========================================
    // FIND USER'S TEAMS
    // ==========================================

    const myTeams = teams.filter((team) => {

        const isLeader =
            team.leader?._id === user?.id;

        const isMember =
            team.members?.some(
                (member) => member._id === user?.id
            );

        return isLeader || isMember;
    });

    // ==========================================
    // ONLY LEADER CAN CREATE
    // ==========================================

    const leaderTeams = myTeams.filter(
        (team) =>
            team.leader?._id === user?.id
    );

    // ==========================================
    // TEAMS WITHOUT SUBMISSIONS
    // ==========================================

    const availableTeams = leaderTeams.filter(
        (team) => {

            // Keep current team while editing
            if (
                isEditMode &&
                team._id === formData.team
            ) {
                return true;
            }

            const alreadyExists =
                submissions.some(
                    (submission) =>
                        submission.team?._id === team._id
                );

            return !alreadyExists;
        }
    );

    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        // When team changes,
        // automatically select its hackathon
        if (name === "team") {

            const selectedTeam =
                teams.find(
                    (team) => team._id === value
                );

            setFormData((previous) => ({
                ...previous,
                team: value,
                hackathon:
                    selectedTeam?.hackathon?._id ||
                    selectedTeam?.hackathon ||
                    ""
            }));
        }
    };

    // ==========================================
    // CREATE SUBMISSION
    // ==========================================

    const createSubmission = async () => {

        const response = await api.post(
            "/submissions",
            {
                hackathon: formData.hackathon,
                team: formData.team,
                projectTitle: formData.projectTitle,
                description: formData.description,
                githubUrl: formData.githubUrl,
                demoUrl: formData.demoUrl
            }
        );

        return response.data;
    };

    // ==========================================
    // UPDATE SUBMISSION
    // ==========================================

    const updateSubmission = async () => {

        const response = await api.put(
            `/submissions/${id}`,
            {
                projectTitle: formData.projectTitle,
                description: formData.description,
                githubUrl: formData.githubUrl,
                demoUrl: formData.demoUrl
            }
        );

        return response.data;
    };

    // ==========================================
    // HANDLE SUBMIT FORM
    // ==========================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");

        if (!formData.projectTitle.trim()) {
            setError("Project title is required.");
            return;
        }

        if (!formData.description.trim()) {
            setError("Project description is required.");
            return;
        }

        if (!formData.githubUrl.trim()) {
            setError("GitHub URL is required.");
            return;
        }

        if (!isEditMode && !formData.team) {
            setError("Please select a team.");
            return;
        }

        try {

            setSaving(true);

            if (isEditMode) {

                await updateSubmission();

                setMessage(
                    "Submission updated successfully."
                );

            } else {

                await createSubmission();

                setMessage(
                    "Submission draft created successfully."
                );

            }

            setTimeout(() => {
                navigate("/participant/submissions");
            }, 800);

        } catch (err) {

            console.error(
                "Save submission error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to save submission"
            );

        } finally {

            setSaving(false);

        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="submission-page">

                <div className="submission-loading">
                    Loading...
                </div>

            </div>
        );
    }

    // ==========================================
    // EDIT MODE - ONLY LEADER
    // ==========================================

    if (isEditMode) {

        const currentSubmission =
            submissions.find(
                (submission) =>
                    submission._id === id
            );

        const currentTeam =
            teams.find(
                (team) =>
                    team._id === formData.team
            );

        const isLeader =
            currentTeam?.leader?._id === user?.id;

        if (
            currentSubmission &&
            currentSubmission.status === "evaluated"
        ) {

            return (
                <div className="submission-page">

                    <div className="submission-form-card">

                        <h1>Submission Locked</h1>

                        <p>
                            An evaluated submission cannot be modified.
                        </p>

                        <button
                            className="submission-primary-btn"
                            onClick={() =>
                                navigate(
                                    "/participant/submissions"
                                )
                            }
                        >
                            Back to Submissions
                        </button>

                    </div>

                </div>
            );
        }

        if (!isLeader) {

            return (
                <div className="submission-page">

                    <div className="submission-form-card">

                        <h1>Access Denied</h1>

                        <p>
                            Only the team leader can edit this submission.
                        </p>

                        <button
                            className="submission-primary-btn"
                            onClick={() =>
                                navigate(
                                    "/participant/submissions"
                                )
                            }
                        >
                            Back to Submissions
                        </button>

                    </div>

                </div>
            );
        }
    }

    return (
        <div className="submission-page">

            <div className="submission-form-header">

                <div>

                    <h1>
                        {isEditMode
                            ? "Edit Submission"
                            : "Create Submission"}
                    </h1>

                    <p>
                        {isEditMode
                            ? "Update your project information."
                            : "Create a draft submission for your team."}
                    </p>

                </div>

                <button
                    className="submission-secondary-btn"
                    onClick={() =>
                        navigate(
                            "/participant/submissions"
                        )
                    }
                >
                    ← Back
                </button>

            </div>

            {error && (
                <div className="submission-message error">
                    {error}
                </div>
            )}

            {message && (
                <div className="submission-message success">
                    {message}
                </div>
            )}

            <form
                className="submission-form-card"
                onSubmit={handleSubmit}
            >

                {/* TEAM */}

                {!isEditMode && (
                    <div className="submission-form-group">

                        <label>
                            Select Team
                        </label>

                        <select
                            name="team"
                            value={formData.team}
                            onChange={handleChange}
                            required
                        >

                            <option value="">
                                Select your team
                            </option>

                            {availableTeams.map(
                                (team) => (
                                    <option
                                        key={team._id}
                                        value={team._id}
                                    >
                                        {team.teamName}
                                        {" — "}
                                        {team.hackathon?.title ||
                                            "Hackathon"}
                                    </option>
                                )
                            )}

                        </select>

                        {availableTeams.length === 0 && (
                            <small className="submission-help">
                                You do not have a team available for a new submission.
                                A team can have only one submission.
                            </small>
                        )}

                    </div>
                )}

                {/* HACKATHON */}

                {isEditMode && (
                    <div className="submission-form-group">

                        <label>
                            Hackathon
                        </label>

                        <input
                            type="text"
                            value={
                                submissions.find(
                                    (submission) =>
                                        submission._id === id
                                )?.hackathon?.title ||
                                "Hackathon"
                            }
                            disabled
                        />

                    </div>
                )}

                {/* PROJECT TITLE */}

                <div className="submission-form-group">

                    <label>
                        Project Title
                    </label>

                    <input
                        type="text"
                        name="projectTitle"
                        value={formData.projectTitle}
                        onChange={handleChange}
                        placeholder="Enter your project title"
                        required
                    />

                </div>

                {/* DESCRIPTION */}

                <div className="submission-form-group">

                    <label>
                        Project Description
                    </label>

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your project, features and technology used..."
                        rows="7"
                        required
                    />

                </div>

                {/* GITHUB */}

                <div className="submission-form-group">

                    <label>
                        GitHub Repository URL
                    </label>

                    <input
                        type="url"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleChange}
                        placeholder="https://github.com/username/project"
                        required
                    />

                    <small className="submission-help">
                        Provide the GitHub repository containing your project source code.
                    </small>

                </div>

                {/* DEMO */}

                <div className="submission-form-group">

                    <label>
                        Live Demo URL
                        <span className="optional-label">
                            Optional
                        </span>
                    </label>

                    <input
                        type="url"
                        name="demoUrl"
                        value={formData.demoUrl}
                        onChange={handleChange}
                        placeholder="https://your-demo-link.com"
                    />

                </div>

                {/* BUTTONS */}

                <div className="submission-form-actions">

                    <button
                        type="button"
                        className="submission-secondary-btn"
                        onClick={() =>
                            navigate(
                                "/participant/submissions"
                            )
                        }
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="submission-primary-btn"
                        disabled={
                            saving ||
                            (!isEditMode &&
                                availableTeams.length === 0)
                        }
                    >
                        {saving
                            ? "Saving..."
                            : isEditMode
                                ? "Update Submission"
                                : "Create Draft"}
                    </button>

                </div>

            </form>

        </div>
    );
}

export default SubmissionForm;