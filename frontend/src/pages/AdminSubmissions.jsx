import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AdminSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [deletingId, setDeletingId] = useState("");

    const loadSubmissions = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/submissions");

            setSubmissions(
                response.data.submissions || []
            );
        } catch (err) {
            console.error(
                "Load Admin Submissions Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load submissions."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubmissions();
    }, []);

    const filteredSubmissions = useMemo(() => {
        const query = search.trim().toLowerCase();

        return submissions.filter((submission) => {
            const matchesSearch =
                !query ||
                submission.projectTitle
                    ?.toLowerCase()
                    .includes(query) ||
                submission.team?.teamName
                    ?.toLowerCase()
                    .includes(query) ||
                submission.hackathon?.title
                    ?.toLowerCase()
                    .includes(query);

            const matchesStatus =
                statusFilter === "all" ||
                submission.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [submissions, search, statusFilter]);

    const deleteSubmission = async (submission) => {
        const confirmed = window.confirm(
            `Delete submission "${submission.projectTitle}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(submission._id);

            await api.delete(
                `/submissions/${submission._id}`
            );

            setSubmissions((previous) =>
                previous.filter(
                    (item) =>
                        item._id !== submission._id
                )
            );

            if (
                selectedSubmission?._id ===
                submission._id
            ) {
                setSelectedSubmission(null);
            }

        } catch (err) {
            console.error(
                "Delete Submission Error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Unable to delete submission."
            );
        } finally {
            setDeletingId("");
        }
    };

    const counts = {
        all: submissions.length,

        draft: submissions.filter(
            (item) => item.status === "draft"
        ).length,

        submitted: submissions.filter(
            (item) => item.status === "submitted"
        ).length,

        underReview: submissions.filter(
            (item) => item.status === "under_review"
        ).length,

        evaluated: submissions.filter(
            (item) => item.status === "evaluated"
        ).length
    };

    if (loading) {
        return (
            <div className="admin-submissions-page">
                <p>Loading submissions...</p>
            </div>
        );
    }

    return (
        <div className="admin-submissions-page">

            {/* HEADER */}

            <div className="admin-submissions-heading">

                <div>
                    <p className="admin-submissions-eyebrow">
                        ADMINISTRATION
                    </p>

                    <h1>Submissions Management</h1>

                    <p>
                        View and manage hackathon project
                        submissions.
                    </p>
                </div>

                <button
                    className="submissions-refresh-button"
                    onClick={loadSubmissions}
                >
                    Refresh
                </button>

            </div>

            {/* ERROR */}

            {error && (
                <div className="submissions-error">
                    {error}

                    <button onClick={loadSubmissions}>
                        Try again
                    </button>
                </div>
            )}

            {/* STATS */}

            <div className="submissions-stat-grid">

                <div className="submission-stat-card">
                    <span>Total</span>
                    <strong>{counts.all}</strong>
                </div>

                <div className="submission-stat-card">
                    <span>Draft</span>
                    <strong>{counts.draft}</strong>
                </div>

                <div className="submission-stat-card">
                    <span>Submitted</span>
                    <strong>{counts.submitted}</strong>
                </div>

                <div className="submission-stat-card">
                    <span>Under Review</span>
                    <strong>{counts.underReview}</strong>
                </div>

                <div className="submission-stat-card">
                    <span>Evaluated</span>
                    <strong>{counts.evaluated}</strong>
                </div>

            </div>

            {/* TABLE */}

            <section className="submissions-table-panel">

                <div className="submissions-toolbar">

                    <input
                        type="search"
                        placeholder="Search project, team, or hackathon..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <option value="all">
                            All statuses
                        </option>

                        <option value="draft">
                            Draft
                        </option>

                        <option value="submitted">
                            Submitted
                        </option>

                        <option value="under_review">
                            Under Review
                        </option>

                        <option value="evaluated">
                            Evaluated
                        </option>
                    </select>

                </div>

                <div className="submissions-table-wrapper">

                    <table className="submissions-table">

                        <thead>
                            <tr>
                                <th>Project</th>
                                <th>Team</th>
                                <th>Hackathon</th>
                                <th>Status</th>
                                <th>Submitted On</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredSubmissions.map(
                                (submission) => (

                                    <tr
                                        key={
                                            submission._id
                                        }
                                    >

                                        <td>
                                            <strong>
                                                {
                                                    submission.projectTitle
                                                }
                                            </strong>

                                            <div className="submission-description">
                                                {
                                                    submission.description
                                                        ?.slice(
                                                            0,
                                                            70
                                                        )
                                                }
                                                {submission.description
                                                    ?.length > 70
                                                    ? "..."
                                                    : ""}
                                            </div>
                                        </td>

                                        <td>
                                            {
                                                submission
                                                    .team
                                                    ?.teamName ||
                                                "—"
                                            }
                                        </td>

                                        <td>
                                            {
                                                submission
                                                    .hackathon
                                                    ?.title ||
                                                "—"
                                            }
                                        </td>

                                        <td>
                                            <span
                                                className={`submission-status status-${submission.status}`}
                                            >
                                                {submission.status
                                                    ?.replace(
                                                        "_",
                                                        " "
                                                    )}
                                            </span>
                                        </td>

                                        <td>
                                            {submission.submissionDate
                                                ? new Date(
                                                      submission.submissionDate
                                                  ).toLocaleDateString()
                                                : "—"}
                                        </td>

                                        <td>

                                            <div className="submission-actions">

                                                <button
                                                    className="submission-view-button"
                                                    onClick={() =>
                                                        setSelectedSubmission(
                                                            submission
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>

                                                <button
                                                    className="submission-delete-button"
                                                    disabled={
                                                        deletingId ===
                                                        submission._id
                                                    }
                                                    onClick={() =>
                                                        deleteSubmission(
                                                            submission
                                                        )
                                                    }
                                                >
                                                    {deletingId ===
                                                    submission._id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                )
                            )}

                            {filteredSubmissions.length ===
                                0 && (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="submissions-empty"
                                    >
                                        No submissions found.
                                    </td>
                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>

                <div className="submissions-table-footer">
                    Showing{" "}
                    {filteredSubmissions.length} of{" "}
                    {submissions.length} submissions
                </div>

            </section>

            {/* VIEW MODAL */}

            {selectedSubmission && (

                <div
                    className="submission-modal-backdrop"
                    onClick={() =>
                        setSelectedSubmission(null)
                    }
                >

                    <div
                        className="submission-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="submission-modal-header">

                            <div>
                                <p>
                                    PROJECT SUBMISSION
                                </p>

                                <h2>
                                    {
                                        selectedSubmission.projectTitle
                                    }
                                </h2>
                            </div>

                            <button
                                className="submission-modal-close"
                                onClick={() =>
                                    setSelectedSubmission(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="submission-details">

                            <div className="submission-detail-item">
                                <span>Team</span>
                                <strong>
                                    {
                                        selectedSubmission
                                            .team
                                            ?.teamName ||
                                        "—"
                                    }
                                </strong>
                            </div>

                            <div className="submission-detail-item">
                                <span>Hackathon</span>
                                <strong>
                                    {
                                        selectedSubmission
                                            .hackathon
                                            ?.title ||
                                        "—"
                                    }
                                </strong>
                            </div>

                            <div className="submission-detail-item">
                                <span>Status</span>
                                <strong>
                                    {
                                        selectedSubmission.status
                                    }
                                </strong>
                            </div>

                            <div className="submission-detail-item">
                                <span>Submission Date</span>
                                <strong>
                                    {selectedSubmission.submissionDate
                                        ? new Date(
                                              selectedSubmission.submissionDate
                                          ).toLocaleString()
                                        : "—"}
                                </strong>
                            </div>

                        </div>

                        <div className="submission-description-box">

                            <h3>Description</h3>

                            <p>
                                {
                                    selectedSubmission.description ||
                                    "No description available."
                                }
                            </p>

                        </div>

                        <div className="submission-links">

                            <h3>Project Links</h3>

                            <a
                                href={
                                    selectedSubmission.githubUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                            >
                                GitHub Repository
                            </a>

                            {selectedSubmission.demoUrl && (
                                <a
                                    href={
                                        selectedSubmission.demoUrl
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Live Demo
                                </a>
                            )}

                        </div>

                        <div className="submission-modal-footer">

                            <button
                                className="submission-close-button"
                                onClick={() =>
                                    setSelectedSubmission(
                                        null
                                    )
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default AdminSubmissions;