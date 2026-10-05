import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function JudgeProjects() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const [submissionResponse, evaluationResponse] =
                await Promise.all([
                    api.get("/submissions"),
                    api.get("/evaluations")
                ]);

            const submissions =
                submissionResponse.data.submissions || [];

            const judgeEvaluations =
                evaluationResponse.data.evaluations || [];

            const submittedProjects = submissions.filter(
                (submission) =>
                    submission.status === "submitted" ||
                    submission.status === "under_review" ||
                    submission.status === "evaluated"
            );

            setProjects(submittedProjects);
            setEvaluations(judgeEvaluations);

        } catch (error) {
            console.error(
                "Error loading judge projects:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const getMyEvaluation = (submissionId) => {
        return evaluations.find(
            (evaluation) =>
                evaluation.submission?._id === submissionId ||
                evaluation.submission === submissionId
        );
    };

    if (loading) {
        return (
            <div className="judge-loading">
                Loading projects...
            </div>
        );
    }

    return (
        <div className="judge-projects-page">

            <div className="judge-page-header">
                <div>
                    <h1>Submitted Projects</h1>

                    <p>
                        Review and evaluate hackathon projects
                        assigned to you.
                    </p>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="judge-empty-state">
                    <h3>No submitted projects</h3>

                    <p>
                        There are currently no projects available
                        for evaluation.
                    </p>
                </div>
            ) : (
                <div className="judge-projects-grid">

                    {projects.map((project) => {

                        const myEvaluation =
                            getMyEvaluation(project._id);

                        return (
                            <div
                                className="judge-project-card"
                                key={project._id}
                            >

                                <div className="judge-project-card-header">

                                    <div>
                                        <h3>
                                            {project.projectTitle}
                                        </h3>
                                    </div>

                                    <span
                                        className={`judge-status-badge ${
                                            project.status === "submitted"
                                                ? "judge-status-submitted"
                                                : project.status === "under_review"
                                                ? "judge-status-review"
                                                : "judge-status-evaluated"
                                        }`}
                                    >
                                        {project.status
                                            .replace("_", " ")
                                            .toUpperCase()}
                                    </span>

                                </div>

                                <p className="judge-project-description">
                                    {project.description}
                                </p>

                                <div className="judge-project-info">

                                    <div className="judge-project-info-item">
                                        <span className="judge-project-info-label">
                                            Hackathon
                                        </span>

                                        <span className="judge-project-info-value">
                                            {project.hackathon?.title ||
                                                "Hackathon"}
                                        </span>
                                    </div>

                                    <div className="judge-project-info-item">
                                        <span className="judge-project-info-label">
                                            Submission
                                        </span>

                                        <span className="judge-project-info-value">
                                            {project.submissionDate
                                                ? new Date(
                                                      project.submissionDate
                                                  ).toLocaleDateString()
                                                : "N/A"}
                                        </span>
                                    </div>

                                </div>

                                <div className="judge-project-card-footer">

                                    {myEvaluation ? (
                                        <>
                                            <span className="judge-evaluation-state judge-evaluation-complete">
                                                Evaluated •{" "}
                                                {myEvaluation.score}/100
                                            </span>

                                            <button
                                                className="judge-secondary-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/judge/projects/${project._id}`
                                                    )
                                                }
                                            >
                                                View Evaluation
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="judge-evaluation-state">
                                                Evaluation pending
                                            </span>

                                            <button
                                                className="judge-primary-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/judge/projects/${project._id}`
                                                    )
                                                }
                                            >
                                                Evaluate Project
                                            </button>
                                        </>
                                    )}

                                </div>

                            </div>
                        );
                    })}

                </div>
            )}
        </div>
    );
}

export default JudgeProjects;