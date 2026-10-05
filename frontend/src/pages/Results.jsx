import { useEffect, useState } from "react";
import api from "../services/api";

function Results() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadResults = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/results");

            console.log("Results:", response.data);

            setResults(
                response.data.results || []
            );

        } catch (err) {
            console.error(
                "Load results error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load results"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadResults();
    }, []);

    // ==========================================
    // RESULT STATUS
    // ==========================================

    const getStatusLabel = (status) => {
        switch (status) {
            case "winner":
                return "Winner";

            case "runner_up":
                return "Runner Up";

            case "finalist":
                return "Finalist";

            case "participant":
                return "Participant";

            default:
                return status || "Unknown";
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "winner":
                return "result-status winner";

            case "runner_up":
                return "result-status runner-up";

            case "finalist":
                return "result-status finalist";

            default:
                return "result-status participant";
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="results-page">

                <div className="results-loading">
                    Loading results...
                </div>

            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div className="results-page">

                <div className="results-header">
                    <div>
                        <h1>Results</h1>

                        <p>
                            View hackathon results
                            and final scores.
                        </p>
                    </div>
                </div>

                <div className="results-message error">
                    {error}
                </div>

                <button
                    className="results-primary-btn"
                    onClick={loadResults}
                >
                    Try Again
                </button>

            </div>
        );
    }

    // ==========================================
    // EMPTY
    // ==========================================

    if (results.length === 0) {
        return (
            <div className="results-page">

                <div className="results-header">

                    <div>
                        <h1>Results</h1>

                        <p>
                            View hackathon results
                            and final scores.
                        </p>
                    </div>

                </div>

                <div className="results-empty">

                    <div className="results-empty-icon">
                        🏆
                    </div>

                    <h2>
                        Results Not Available
                    </h2>

                    <p>
                        Hackathon results have not
                        been published yet.
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================
    // RESULTS
    // ==========================================

    return (
        <div className="results-page">

            {/* =====================================
                HEADER
            ====================================== */}

            <div className="results-header">

                <div>

                    <h1>
                        Results
                    </h1>

                    <p>
                        View hackathon results,
                        rankings and final scores.
                    </p>

                </div>

            </div>


            {/* =====================================
                SUMMARY
            ====================================== */}

            <div className="results-summary">

                <div className="results-summary-card">

                    <span>
                        Total Results
                    </span>

                    <strong>
                        {results.length}
                    </strong>

                </div>


                <div className="results-summary-card">

                    <span>
                        Winners
                    </span>

                    <strong>
                        {
                            results.filter(
                                (result) =>
                                    result.resultStatus ===
                                    "winner"
                            ).length
                        }
                    </strong>

                </div>


                <div className="results-summary-card">

                    <span>
                        Finalists
                    </span>

                    <strong>
                        {
                            results.filter(
                                (result) =>
                                    result.resultStatus ===
                                    "finalist"
                            ).length
                        }
                    </strong>

                </div>

            </div>


            {/* =====================================
                RESULTS LIST
            ====================================== */}

            <div className="results-list">

                {results.map((result, index) => (

                    <div
                        className="result-card"
                        key={result._id}
                    >

                        {/* RANK */}

                        <div className="result-rank">

                            <span>
                                Rank
                            </span>

                            <strong>
                                #{index + 1}
                            </strong>

                        </div>


                        {/* MAIN INFORMATION */}

                        <div className="result-main">

                            <div className="result-title-row">

                                <div>

                                    <h2>
                                        {result.teamId?.teamName ||
                                            "Team"}
                                    </h2>

                                    <p>
                                        {result.hackathon?.title ||
                                            "Hackathon"}
                                    </p>

                                </div>

                                <span
                                    className={getStatusClass(
                                        result.resultStatus
                                    )}
                                >
                                    {getStatusLabel(
                                        result.resultStatus
                                    )}
                                </span>

                            </div>


                            <div className="result-details">

                                <div className="result-detail">

                                    <span>
                                        Project
                                    </span>

                                    <strong>
                                        {result.submission
                                            ?.projectTitle ||
                                            "Not available"}
                                    </strong>

                                </div>


                                <div className="result-detail">

                                    <span>
                                        Final Score
                                    </span>

                                    <strong>
                                        {Number(
                                            result.finalScore
                                        ).toFixed(2)}
                                        /100
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default Results;