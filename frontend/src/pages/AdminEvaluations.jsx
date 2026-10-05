import React, { useEffect, useState } from "react";
import api from "../services/api";

const AdminEvaluations = () => {
    const [evaluations, setEvaluations] = useState([]);
    const [results, setResults] = useState([]);
    const [hackathons, setHackathons] = useState([]);

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const [search, setSearch] = useState("");
    const [selectedHackathon, setSelectedHackathon] = useState("all");

    const [selectedEvaluation, setSelectedEvaluation] = useState(null);
    const [selectedResult, setSelectedResult] = useState(null);

    // Edit result states
    const [editingResult, setEditingResult] = useState(null);
    const [editScore, setEditScore] = useState("");
    const [editStatus, setEditStatus] = useState("participant");
    const [updatingResult, setUpdatingResult] = useState(false);

    const [error, setError] = useState("");

    // ==========================================
    // FETCH DATA
    // ==========================================

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                evaluationsResponse,
                resultsResponse,
                hackathonsResponse
            ] = await Promise.all([
                api.get("/evaluations"),
                api.get("/results"),
                api.get("/hackathons")
            ]);

            setEvaluations(
                evaluationsResponse.data.evaluations || []
            );

            setResults(
                resultsResponse.data.results || []
            );

            setHackathons(
                hackathonsResponse.data.hackathons || []
            );

        } catch (err) {
            console.error(
                "Admin Evaluations Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Error loading evaluations and results"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ==========================================
    // DELETE EVALUATION
    // ==========================================

    const handleDeleteEvaluation = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this evaluation?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/evaluations/${id}`);

            setEvaluations((prev) =>
                prev.filter(
                    (evaluation) =>
                        evaluation._id !== id
                )
            );

            setSelectedEvaluation(null);

            alert("Evaluation deleted successfully.");

        } catch (err) {
            console.error(
                "Delete Evaluation Error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Error deleting evaluation"
            );
        }
    };

    // ==========================================
    // DELETE RESULT
    // ==========================================

    const handleDeleteResult = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this result?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/results/${id}`);

            setResults((prev) =>
                prev.filter(
                    (result) =>
                        result._id !== id
                )
            );

            setSelectedResult(null);

            alert("Result deleted successfully.");

        } catch (err) {
            console.error(
                "Delete Result Error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Error deleting result"
            );
        }
    };

    // ==========================================
    // UPDATE RESULT
    // ==========================================

    const handleUpdateResult = async (e) => {
        e.preventDefault();

        if (!editingResult) return;

        if (
            editScore === "" ||
            Number(editScore) < 0 ||
            Number(editScore) > 100
        ) {
            alert(
                "Final score must be between 0 and 100."
            );
            return;
        }

        try {
            setUpdatingResult(true);

            const response = await api.put(
                `/results/${editingResult._id}`,
                {
                    finalScore: Number(editScore),
                    resultStatus: editStatus
                }
            );

            const updatedResult =
                response.data.result;

            setResults((prev) =>
                prev.map((result) =>
                    result._id === updatedResult._id
                        ? {
                            ...result,
                            ...updatedResult,
                            hackathon:
                                result.hackathon,
                            teamId:
                                result.teamId,
                            submission:
                                result.submission
                        }
                        : result
                )
            );

            setEditingResult(null);
            setSelectedResult(null);

            alert("Result updated successfully.");

        } catch (err) {
            console.error(
                "Update Result Error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Error updating result"
            );
        } finally {
            setUpdatingResult(false);
        }
    };

    // ==========================================
    // GENERATE RESULTS
    // ==========================================

    const handleGenerateResults = async (
        hackathonId
    ) => {
        const confirmed = window.confirm(
            "Generate results for this hackathon?\n\n" +
            "Only submissions with exactly 3 judge evaluations will receive a result."
        );

        if (!confirmed) return;

        try {
            setGenerating(true);

            const response = await api.post(
                `/results/generate/${hackathonId}`
            );

            alert(
                response.data.message ||
                "Results generated successfully."
            );

            await fetchData();

        } catch (err) {
            console.error(
                "Generate Results Error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Error generating results"
            );
        } finally {
            setGenerating(false);
        }
    };
// ==========================================
// PUBLISH RESULTS
// ==========================================

const handlePublishResults = async (hackathonId) => {

    const confirmed = window.confirm(
        "Publish results for this hackathon?\n\n" +
        "After publishing, participants will be able to see their results."
    );

    if (!confirmed) return;

    try {

        setGenerating(true);

        const response = await api.post(
            `/results/publish/${hackathonId}`
        );

        alert(
            response.data.message ||
            "Results published successfully."
        );

        await fetchData();

    } catch (err) {

        console.error(
            "Publish Results Error:",
            err
        );

        alert(
            err.response?.data?.message ||
            "Error publishing results"
        );

    } finally {

        setGenerating(false);

    }
};


// ==========================================
// GENERATE CERTIFICATES
// ==========================================

const handleGenerateCertificates = async (
    hackathonId
) => {

    const confirmed = window.confirm(
        "Generate certificates for this hackathon?"
    );

    if (!confirmed) return;

    try {

        setGenerating(true);

        const response = await api.post(
            `/certificates/generate/${hackathonId}`
        );

        alert(
            response.data.message ||
            "Certificates generated successfully."
        );

    } catch (err) {

        console.error(
            "Generate Certificates Error:",
            err
        );

        alert(
            err.response?.data?.message ||
            "Error generating certificates"
        );

    } finally {

        setGenerating(false);

    }
};
    // ==========================================
    // FILTER EVALUATIONS
    // ==========================================

    const filteredEvaluations =
        evaluations.filter((evaluation) => {

            const project =
                evaluation.submission?.projectTitle ||
                "";

            const judge =
                evaluation.judgeId?.name ||
                "";

            const email =
                evaluation.judgeId?.email ||
                "";

            const text =
                `${project} ${judge} ${email}`
                    .toLowerCase();

            return text.includes(
                search.toLowerCase()
            );
        });

    // ==========================================
    // FILTER RESULTS
    // ==========================================

    const filteredResults =
        results.filter((result) => {

            const hackathon =
                result.hackathon?.title ||
                "";

            const team =
                result.teamId?.teamName ||
                "";

            const project =
                result.submission?.projectTitle ||
                "";

            const text =
                `${hackathon} ${team} ${project}`
                    .toLowerCase();

            const matchesSearch =
                text.includes(
                    search.toLowerCase()
                );

            const matchesHackathon =
                selectedHackathon === "all" ||
                result.hackathon?._id ===
                selectedHackathon;

            return (
                matchesSearch &&
                matchesHackathon
            );
        });

    // ==========================================
    // STATISTICS
    // ==========================================

    const totalEvaluations =
        evaluations.length;

    const evaluatedSubmissions =
        new Set(
            evaluations.map(
                (evaluation) =>
                    evaluation.submission?._id
            )
        ).size;

    const resultCount =
        results.length;

    const winnerCount =
        results.filter(
            (result) =>
                result.resultStatus === "winner"
        ).length;

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="admin-evaluations-page">
                <div className="admin-loading">
                    Loading evaluations and results...
                </div>
            </div>
        );
    }

    // ==========================================
    // MAIN UI
    // ==========================================

    return (
        <div className="admin-evaluations-page">

            {/* ================= PAGE HEADER ================= */}

            <div className="admin-page-header">

                <div>
                    <h1>
                        Evaluations & Results
                    </h1>

                    <p>
                        Monitor judge evaluations
                        and manage hackathon results.
                    </p>
                </div>

            </div>

            {/* ================= ERROR ================= */}

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            {/* ================= STATS ================= */}

            <div className="evaluation-stats">

                <div className="evaluation-stat-card">
                    <span>
                        Total Evaluations
                    </span>

                    <strong>
                        {totalEvaluations}
                    </strong>
                </div>

                <div className="evaluation-stat-card">
                    <span>
                        Evaluated Projects
                    </span>

                    <strong>
                        {evaluatedSubmissions}
                    </strong>
                </div>

                <div className="evaluation-stat-card">
                    <span>
                        Generated Results
                    </span>

                    <strong>
                        {resultCount}
                    </strong>
                </div>

                <div className="evaluation-stat-card">
                    <span>
                        Winners
                    </span>

                    <strong>
                        {winnerCount}
                    </strong>
                </div>

            </div>

            {/* ================= FILTERS ================= */}

            <div className="evaluation-filters">

                <input
                    type="text"
                    placeholder="Search project, team or judge..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

                <select
                    value={selectedHackathon}
                    onChange={(e) =>
                        setSelectedHackathon(
                            e.target.value
                        )
                    }
                >

                    <option value="all">
                        All Hackathons
                    </option>

                    {hackathons.map(
                        (hackathon) => (
                            <option
                                key={hackathon._id}
                                value={hackathon._id}
                            >
                                {hackathon.title}
                            </option>
                        )
                    )}

                </select>

            </div>

            {/* ================= EVALUATIONS ================= */}

            <div className="admin-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Judge Evaluations
                        </h2>

                        <p>
                            All evaluations submitted
                            by judges.
                        </p>

                    </div>

                </div>

                {filteredEvaluations.length === 0 ? (

                    <div className="empty-state">
                        No evaluations found.
                    </div>

                ) : (

                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>

                                    <th>
                                        Project
                                    </th>

                                    <th>
                                        Judge
                                    </th>

                                    <th>
                                        Innovation
                                    </th>

                                    <th>
                                        Technical
                                    </th>

                                    <th>
                                        Functionality
                                    </th>

                                    <th>
                                        UI/UX
                                    </th>

                                    <th>
                                        Impact
                                    </th>

                                    <th>
                                        Total
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredEvaluations.map(
                                    (evaluation) => (

                                        <tr
                                            key={
                                                evaluation._id
                                            }
                                        >

                                            <td>
                                                <strong>
                                                    {
                                                        evaluation
                                                            .submission
                                                            ?.projectTitle ||
                                                        "Unknown Project"
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    evaluation
                                                        .judgeId
                                                        ?.name ||
                                                    "Unknown Judge"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    evaluation
                                                        .innovation
                                                }
                                                /20
                                            </td>

                                            <td>
                                                {
                                                    evaluation
                                                        .technicalQuality
                                                }
                                                /20
                                            </td>

                                            <td>
                                                {
                                                    evaluation
                                                        .functionality
                                                }
                                                /20
                                            </td>

                                            <td>
                                                {
                                                    evaluation
                                                        .uiUx
                                                }
                                                /20
                                            </td>

                                            <td>
                                                {
                                                    evaluation
                                                        .impact
                                                }
                                                /20
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        evaluation
                                                            .score
                                                    }
                                                    /100
                                                </strong>
                                            </td>

                                            <td>

                                                <button
                                                    className="view-btn"
                                                    onClick={() =>
                                                        setSelectedEvaluation(
                                                            evaluation
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* ================= RESULTS ================= */}

            <div className="admin-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Hackathon Results
                        </h2>

                        <p>
                            Final results generated
                            from judge evaluations.
                        </p>

                    </div>

                </div>

                {filteredResults.length === 0 ? (

                    <div className="empty-state">
                        No results generated yet.
                    </div>

                ) : (

                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>

                                    <th>
                                        Rank
                                    </th>

                                    <th>
                                        Hackathon
                                    </th>

                                    <th>
                                        Team
                                    </th>

                                    <th>
                                        Project
                                    </th>

                                    <th>
                                        Final Score
                                    </th>

                                    <th>
                                        Result
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredResults.map(
                                    (result, index) => (

                                        <tr
                                            key={
                                                result._id
                                            }
                                        >

                                            <td>
                                                #{index + 1}
                                            </td>

                                            <td>
                                                {
                                                    result
                                                        .hackathon
                                                        ?.title ||
                                                    "Unknown"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    result
                                                        .teamId
                                                        ?.teamName ||
                                                    "Unknown"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    result
                                                        .submission
                                                        ?.projectTitle ||
                                                    "Unknown"
                                                }
                                            </td>

                                            <td>
                                                <strong>
                                                    {Number(
                                                        result.finalScore
                                                    ).toFixed(2)}
                                                </strong>
                                            </td>

                                            <td>

                                                <span
                                                    className={`result-badge ${result.resultStatus}`}
                                                >
                                                    {result
                                                        .resultStatus
                                                        ?.replace(
                                                            "_",
                                                            " "
                                                        )
                                                        .toUpperCase()}
                                                </span>

                                            </td>

                                            <td>

                                                <button
                                                    className="view-btn"
                                                    onClick={() =>
                                                        setSelectedResult(
                                                            result
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* ================= GENERATE RESULTS ================= */}

            <div className="admin-section generate-results-section">

                <div>

                    <h2>
                        Generate Results
                    </h2>

                    <p>
                        Results are generated using
                        the average score of exactly
                        3 judge evaluations.
                    </p>

                </div>

                <div className="generate-buttons">

    {hackathons.map(
        (hackathon) => (

            <div
                key={hackathon._id}
                style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "15px"
                }}
            >

                <button
                    className="generate-btn"
                    disabled={generating}
                    onClick={() =>
                        handleGenerateResults(
                            hackathon._id
                        )
                    }
                >
                    Generate Results for{" "}
                    {hackathon.title}
                </button>


                <button
                    className="generate-btn"
                    disabled={generating}
                    onClick={() =>
                        handlePublishResults(
                            hackathon._id
                        )
                    }
                >
                    Publish Results
                </button>


                <button
                    className="generate-btn"
                    disabled={generating}
                    onClick={() =>
                        handleGenerateCertificates(
                            hackathon._id
                        )
                    }
                >
                    Generate Certificates
                </button>

            </div>

        )
    )}

</div>

            </div>

            {/* ================= GENERATE CERTIFICATES ================= */}

<div className="admin-section generate-results-section">

    <div>

        <h2>
            Generate Certificates
        </h2>

        <p>
            Certificates can be generated only
            after the hackathon results have been
            published.
        </p>

    </div>

    <div className="generate-buttons">

        {hackathons.map(
            (hackathon) => (

                <button
                    key={hackathon._id}
                    className="generate-btn"
                    disabled={generating}
                    onClick={async () => {

                        const confirmed =
                            window.confirm(
                                `Generate certificates for ${hackathon.title}?`
                            );

                        if (!confirmed) {
                            return;
                        }

                        try {

                            setGenerating(true);

                            const response =
                                await api.post(
                                    `/certificates/generate/${hackathon._id}`
                                );

                            alert(
                                response.data.message ||
                                "Certificates generated successfully."
                            );

                        } catch (err) {

                            console.error(
                                "Generate Certificates Error:",
                                err
                            );

                            alert(
                                err.response?.data?.message ||
                                "Error generating certificates"
                            );

                        } finally {

                            setGenerating(false);
                        }

                    }}
                >
                    Generate Certificates for{" "}
                    {hackathon.title}
                </button>

            )
        )}

    </div>

</div>

            {/* ================= EVALUATION MODAL ================= */}

            {selectedEvaluation && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setSelectedEvaluation(null)
                    }
                >

                    <div
                        className="admin-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <h2>
                                Evaluation Details
                            </h2>

                            <button
                                onClick={() =>
                                    setSelectedEvaluation(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="modal-content">

                            <p>
                                <strong>
                                    Project:
                                </strong>{" "}
                                {
                                    selectedEvaluation
                                        .submission
                                        ?.projectTitle
                                }
                            </p>

                            <p>
                                <strong>
                                    Judge:
                                </strong>{" "}
                                {
                                    selectedEvaluation
                                        .judgeId
                                        ?.name
                                }
                            </p>

                            <p>
                                <strong>
                                    Email:
                                </strong>{" "}
                                {
                                    selectedEvaluation
                                        .judgeId
                                        ?.email
                                }
                            </p>

                            <div className="score-grid">

                                <div>
                                    <span>
                                        Innovation
                                    </span>

                                    <strong>
                                        {
                                            selectedEvaluation
                                                .innovation
                                        }
                                        /20
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Technical Quality
                                    </span>

                                    <strong>
                                        {
                                            selectedEvaluation
                                                .technicalQuality
                                        }
                                        /20
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Functionality
                                    </span>

                                    <strong>
                                        {
                                            selectedEvaluation
                                                .functionality
                                        }
                                        /20
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        UI/UX
                                    </span>

                                    <strong>
                                        {
                                            selectedEvaluation
                                                .uiUx
                                        }
                                        /20
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Impact
                                    </span>

                                    <strong>
                                        {
                                            selectedEvaluation
                                                .impact
                                        }
                                        /20
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Total Score
                                    </span>

                                    <strong>
                                        {
                                            selectedEvaluation
                                                .score
                                        }
                                        /100
                                    </strong>
                                </div>

                            </div>

                            <div className="remarks-box">

                                <h3>
                                    Remarks
                                </h3>

                                <p>
                                    {
                                        selectedEvaluation
                                            .remarks ||
                                        "No remarks provided."
                                    }
                                </p>

                            </div>

                            <button
                                className="danger-btn"
                                onClick={() =>
                                    handleDeleteEvaluation(
                                        selectedEvaluation._id
                                    )
                                }
                            >
                                Delete Evaluation
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* ================= RESULT MODAL ================= */}

            {selectedResult && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setSelectedResult(null)
                    }
                >

                    <div
                        className="admin-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <h2>
                                Result Details
                            </h2>

                            <button
                                onClick={() =>
                                    setSelectedResult(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="modal-content">

                            <p>
                                <strong>
                                    Hackathon:
                                </strong>{" "}
                                {
                                    selectedResult
                                        .hackathon
                                        ?.title
                                }
                            </p>

                            <p>
                                <strong>
                                    Team:
                                </strong>{" "}
                                {
                                    selectedResult
                                        .teamId
                                        ?.teamName
                                }
                            </p>

                            <p>
                                <strong>
                                    Project:
                                </strong>{" "}
                                {
                                    selectedResult
                                        .submission
                                        ?.projectTitle
                                }
                            </p>

                            <p>
                                <strong>
                                    Final Score:
                                </strong>{" "}
                                {Number(
                                    selectedResult
                                        .finalScore
                                ).toFixed(2)}
                                /100
                            </p>

                            <p>
                                <strong>
                                    Result:
                                </strong>{" "}
                                {
                                    selectedResult
                                        .resultStatus
                                        ?.replace(
                                            "_",
                                            " "
                                        )
                                        .toUpperCase()
                                }
                            </p>

                            {/* RESULT ACTIONS */}

                            <div className="result-modal-actions">

                                <button
                                    className="edit-result-btn"
                                    onClick={() => {

                                        setEditScore(
                                            selectedResult
                                                .finalScore
                                        );

                                        setEditStatus(
                                            selectedResult
                                                .resultStatus ||
                                            "participant"
                                        );

                                        setEditingResult(
                                            selectedResult
                                        );

                                    }}
                                >
                                    Edit Result
                                </button>

                                <button
                                    className="danger-btn"
                                    onClick={() =>
                                        handleDeleteResult(
                                            selectedResult._id
                                        )
                                    }
                                >
                                    Delete Result
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {/* ================= EDIT RESULT MODAL ================= */}

            {editingResult && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setEditingResult(null)
                    }
                >

                    <div
                        className="admin-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <h2>
                                Edit Result
                            </h2>

                            <button
                                onClick={() =>
                                    setEditingResult(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            className="edit-result-form"
                            onSubmit={
                                handleUpdateResult
                            }
                        >

                            <div className="form-info">

                                <p>
                                    <strong>
                                        Hackathon:
                                    </strong>{" "}
                                    {
                                        editingResult
                                            .hackathon
                                            ?.title
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Team:
                                    </strong>{" "}
                                    {
                                        editingResult
                                            .teamId
                                            ?.teamName
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Project:
                                    </strong>{" "}
                                    {
                                        editingResult
                                            .submission
                                            ?.projectTitle
                                    }
                                </p>

                            </div>

                            <div className="form-group">

                                <label>
                                    Final Score
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={editScore}
                                    onChange={(e) =>
                                        setEditScore(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                                <small>
                                    Enter a score between
                                    0 and 100.
                                </small>

                            </div>

                            <div className="form-group">

                                <label>
                                    Result Status
                                </label>

                                <select
                                    value={editStatus}
                                    onChange={(e) =>
                                        setEditStatus(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="winner">
                                        Winner
                                    </option>

                                    <option value="runner_up">
                                        Runner Up
                                    </option>

                                    <option value="finalist">
                                        Finalist
                                    </option>

                                    <option value="participant">
                                        Participant
                                    </option>

                                </select>

                            </div>

                            <div className="edit-result-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() =>
                                        setEditingResult(
                                            null
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-result-btn"
                                    disabled={
                                        updatingResult
                                    }
                                >
                                    {updatingResult
                                        ? "Updating..."
                                        : "Update Result"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default AdminEvaluations;