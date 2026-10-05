import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function JudgeDashboard() {

    const navigate = useNavigate();

    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvaluations();
    }, []);

    const loadEvaluations = async () => {
        try {

            const response = await api.get("/evaluations");

            setEvaluations(
                response.data.evaluations || []
            );

        } catch (error) {

            console.error(
                "Error loading evaluations:",
                error
            );

        } finally {

            setLoading(false);

        }
    };

    if (loading) {
        return (
            <div className="judge-dashboard">
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="judge-dashboard">

            {/* HEADER */}

            <div className="judge-page-header">

                <div>
                    <h1>Judge Dashboard</h1>

                    <p>
                        Review submitted projects and provide
                        evaluation scores.
                    </p>
                </div>

                <button
                    className="judge-primary-button"
                    onClick={() =>
                        navigate("/judge/projects")
                    }
                >
                    View Projects
                </button>

            </div>


            {/* STATISTICS */}

            <div className="judge-stats-grid">

                <div className="judge-stat-card">

                    <h3>My Evaluations</h3>

                    <p className="judge-stat-number">
                        {evaluations.length}
                    </p>

                    <span>
                        Projects evaluated by you
                    </span>

                </div>


                <div className="judge-stat-card">

                    <h3>Evaluation Criteria</h3>

                    <p className="judge-stat-number">
                        5
                    </p>

                    <span>
                        Criteria per project
                    </span>

                </div>


                <div className="judge-stat-card">

                    <h3>Maximum Score</h3>

                    <p className="judge-stat-number">
                        100
                    </p>

                    <span>
                        Total marks
                    </span>

                </div>

            </div>


            {/* RESPONSIBILITIES */}

            <div className="judge-info-card">

                <h2>Judge Responsibilities</h2>

                <ul className="judge-responsibility-list">

                    <li>
                        <span className="judge-check">
                            ✓
                        </span>

                        Review submitted hackathon projects
                    </li>

                    <li>
                        <span className="judge-check">
                            ✓
                        </span>

                        Evaluate projects using predefined criteria
                    </li>

                    <li>
                        <span className="judge-check">
                            ✓
                        </span>

                        Provide remarks and constructive feedback
                    </li>

                    <li>
                        <span className="judge-check">
                            ✓
                        </span>

                        Submit one evaluation for each project
                    </li>

                </ul>

            </div>

        </div>
    );
}

export default JudgeDashboard;