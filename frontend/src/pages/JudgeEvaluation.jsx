import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function JudgeEvaluation() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [submission, setSubmission] = useState(null);
    const [myEvaluation, setMyEvaluation] = useState(null);

    const [form, setForm] = useState({
        innovation: "",
        technicalQuality: "",
        functionality: "",
        uiUx: "",
        impact: "",
        remarks: ""
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [submissionResponse, evaluationResponse] =
                await Promise.all([
                    api.get(`/submissions/${id}`),
                    api.get("/evaluations")
                ]);

            setSubmission(
                submissionResponse.data.submission
            );

            const evaluations =
                evaluationResponse.data.evaluations || [];

            const existingEvaluation =
                evaluations.find(
                    (evaluation) =>
                        evaluation.submission?._id === id ||
                        evaluation.submission === id
                );

            if (existingEvaluation) {
                setMyEvaluation(existingEvaluation);

                setForm({
                    innovation:
                        existingEvaluation.innovation,
                    technicalQuality:
                        existingEvaluation.technicalQuality,
                    functionality:
                        existingEvaluation.functionality,
                    uiUx:
                        existingEvaluation.uiUx,
                    impact:
                        existingEvaluation.impact,
                    remarks:
                        existingEvaluation.remarks
                });
            }

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Unable to load project."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const totalScore =
        Number(form.innovation || 0) +
        Number(form.technicalQuality || 0) +
        Number(form.functionality || 0) +
        Number(form.uiUx || 0) +
        Number(form.impact || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        const scores = [
            form.innovation,
            form.technicalQuality,
            form.functionality,
            form.uiUx,
            form.impact
        ];

        const invalidScore = scores.some(
            (score) =>
                score === "" ||
                Number(score) < 0 ||
                Number(score) > 20
        );

        if (invalidScore) {
            setError(
                "Each criterion must have a score between 0 and 20."
            );

            return;
        }

        if (!form.remarks.trim()) {
            setError("Please enter remarks.");

            return;
        }

        try {
            setSubmitting(true);

            await api.post("/evaluations", {
                submission: id,
                innovation: Number(form.innovation),
                technicalQuality:
                    Number(form.technicalQuality),
                functionality:
                    Number(form.functionality),
                uiUx: Number(form.uiUx),
                impact: Number(form.impact),
                remarks: form.remarks
            });

            alert("Evaluation submitted successfully.");

            navigate("/judge/projects");

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to submit evaluation."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="judge-loading">
                Loading project...
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="judge-empty-state">
                <h3>Project not found</h3>

                <p>
                    The requested submission could not be loaded.
                </p>
            </div>
        );
    }

    return (
        <div className="judge-evaluation-page">

            <div className="judge-evaluation-header">

                <h1>
                    {submission.projectTitle}
                </h1>

                <p>
                    Review this project and provide your evaluation.
                </p>

                <div className="judge-project-details">

                    <div className="judge-detail-box">
                        <span>Hackathon</span>

                        <strong>
                            {submission.hackathon?.title ||
                                "Hackathon"}
                        </strong>
                    </div>

                    <div className="judge-detail-box">
                        <span>Status</span>

                        <strong>
                            {submission.status}
                        </strong>
                    </div>

                </div>

                <div style={{ marginTop: "18px" }}>
                    <p>
                        <strong>Description:</strong>
                    </p>

                    <p>
                        {submission.description}
                    </p>
                </div>

            </div>

            {error && (
                <div className="judge-error-message">
                    {error}
                </div>
            )}

            {myEvaluation ? (

                <div className="judge-existing-evaluation">

                    <h2>
                        Your Evaluation
                    </h2>

                    <p className="judge-existing-evaluation-message">
                        You have already evaluated this project.
                    </p>

                    <div className="judge-score-grid">

                        <div className="judge-score-box">
                            <span>Innovation</span>
                            <strong>
                                {myEvaluation.innovation}/20
                            </strong>
                        </div>

                        <div className="judge-score-box">
                            <span>Technical Quality</span>
                            <strong>
                                {myEvaluation.technicalQuality}/20
                            </strong>
                        </div>

                        <div className="judge-score-box">
                            <span>Functionality</span>
                            <strong>
                                {myEvaluation.functionality}/20
                            </strong>
                        </div>

                        <div className="judge-score-box">
                            <span>UI/UX</span>
                            <strong>
                                {myEvaluation.uiUx}/20
                            </strong>
                        </div>

                        <div className="judge-score-box">
                            <span>Impact</span>
                            <strong>
                                {myEvaluation.impact}/20
                            </strong>
                        </div>

                        <div className="judge-score-box">
                            <span>Total Score</span>
                            <strong>
                                {myEvaluation.score}/100
                            </strong>
                        </div>

                    </div>

                    <div className="judge-detail-box">

                        <span>Remarks</span>

                        <strong>
                            {myEvaluation.remarks}
                        </strong>

                    </div>

                    <div className="judge-form-actions">

                        <button
                            className="judge-secondary-button"
                            onClick={() =>
                                navigate("/judge/projects")
                            }
                        >
                            Back to Projects
                        </button>

                    </div>

                </div>

            ) : (

                <form
                    className="judge-evaluation-form"
                    onSubmit={handleSubmit}
                >

                    <h2>
                        Project Evaluation
                    </h2>

                    <p className="judge-evaluation-form-subtitle">
                        Give a score from 0 to 20 for each criterion.
                    </p>

                    <div className="judge-criteria-list">

                        <div className="judge-criterion">

                            <div className="judge-criterion-header">
                                <span className="judge-criterion-name">
                                    Innovation
                                </span>

                                <span className="judge-criterion-score">
                                    / 20
                                </span>
                            </div>

                            <input
                                type="number"
                                name="innovation"
                                min="0"
                                max="20"
                                value={form.innovation}
                                onChange={handleChange}
                                className="judge-score-input"
                                required
                            />

                        </div>


                        <div className="judge-criterion">

                            <div className="judge-criterion-header">
                                <span className="judge-criterion-name">
                                    Technical Quality
                                </span>

                                <span className="judge-criterion-score">
                                    / 20
                                </span>
                            </div>

                            <input
                                type="number"
                                name="technicalQuality"
                                min="0"
                                max="20"
                                value={form.technicalQuality}
                                onChange={handleChange}
                                className="judge-score-input"
                                required
                            />

                        </div>


                        <div className="judge-criterion">

                            <div className="judge-criterion-header">
                                <span className="judge-criterion-name">
                                    Functionality
                                </span>

                                <span className="judge-criterion-score">
                                    / 20
                                </span>
                            </div>

                            <input
                                type="number"
                                name="functionality"
                                min="0"
                                max="20"
                                value={form.functionality}
                                onChange={handleChange}
                                className="judge-score-input"
                                required
                            />

                        </div>


                        <div className="judge-criterion">

                            <div className="judge-criterion-header">
                                <span className="judge-criterion-name">
                                    UI / UX
                                </span>

                                <span className="judge-criterion-score">
                                    / 20
                                </span>
                            </div>

                            <input
                                type="number"
                                name="uiUx"
                                min="0"
                                max="20"
                                value={form.uiUx}
                                onChange={handleChange}
                                className="judge-score-input"
                                required
                            />

                        </div>


                        <div className="judge-criterion">

                            <div className="judge-criterion-header">
                                <span className="judge-criterion-name">
                                    Impact
                                </span>

                                <span className="judge-criterion-score">
                                    / 20
                                </span>
                            </div>

                            <input
                                type="number"
                                name="impact"
                                min="0"
                                max="20"
                                value={form.impact}
                                onChange={handleChange}
                                className="judge-score-input"
                                required
                            />

                        </div>

                    </div>


                    <div className="judge-total-score">

                        <span className="judge-total-score-label">
                            Current Total
                        </span>

                        <span className="judge-total-score-value">
                            {totalScore} / 100
                        </span>

                    </div>


                    <div className="judge-remarks-section">

                        <label>
                            Remarks / Feedback
                        </label>

                        <textarea
                            name="remarks"
                            value={form.remarks}
                            onChange={handleChange}
                            className="judge-remarks-input"
                            placeholder="Enter your feedback about the project..."
                            required
                        />

                    </div>


                    <div className="judge-form-actions">

                        <button
                            type="button"
                            className="judge-secondary-button"
                            onClick={() =>
                                navigate("/judge/projects")
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="judge-primary-button"
                            disabled={submitting}
                        >
                            {submitting
                                ? "Submitting..."
                                : "Submit Evaluation"}
                        </button>

                    </div>

                </form>

            )}

        </div>
    );
}

export default JudgeEvaluation;