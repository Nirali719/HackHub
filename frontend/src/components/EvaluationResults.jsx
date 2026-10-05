import { useEffect, useState } from "react";
import api from "../services/api";

function EvaluationResults({ submissionId }) {
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvaluations();
    }, [submissionId]);

const loadEvaluations = async () => {
    try {

        setLoading(true);

        const response = await api.get(
            `/evaluations/submission/${submissionId}`
        );

        setEvaluations(
            response.data.evaluations || []
        );

    } catch (error) {

        console.error(
            "Error loading evaluations:",
            error
        );

        setEvaluations([]);

    } finally {

        setLoading(false);

    }
};

    if (loading) {
        return (
            <div className="evaluation-results-loading">
                Loading evaluations...
            </div>
        );
    }

    if (evaluations.length === 0) {
        return (
            <div className="evaluation-results-empty">
                <h3>Evaluation Pending</h3>

                <p>
                    No judge has submitted an evaluation
                    for this project yet.
                </p>
            </div>
        );
    }

    const completedCount = evaluations.length;

    const finalScore =
        completedCount === 3
            ? evaluations.reduce(
                  (total, evaluation) =>
                      total + Number(evaluation.score || 0),
                  0
              ) / 3
            : null;

    return (
        <div className="evaluation-results-section">

            <div className="evaluation-results-header">

                <div>
                    <h2>Project Evaluations</h2>

                    <p>
                        {completedCount} of 3 judges have
                        completed their evaluation.
                    </p>
                </div>

                {finalScore !== null && (
                    <div className="evaluation-final-score">
                        <span>Final Score</span>

                        <strong>
                            {finalScore.toFixed(2)} / 100
                        </strong>
                    </div>
                )}

            </div>


            {completedCount < 3 && (
                <div className="evaluation-progress-message">
                    Final score will be available after all
                    3 judges complete their evaluations.
                </div>
            )}


            <div className="evaluation-cards">

                {evaluations.map((evaluation, index) => (

                    <div
                        className="evaluation-card"
                        key={evaluation._id}
                    >

                        <div className="evaluation-card-header">

                            <div>
                                <h3>
                                    Judge {index + 1}
                                </h3>

                                {evaluation.judgeId?.name && (
                                    <p>
                                        {evaluation.judgeId.name}
                                    </p>
                                )}
                            </div>

                            <div className="evaluation-score">
                                {evaluation.score}/100
                            </div>

                        </div>


                        <div className="evaluation-criteria-grid">

                            <div>
                                <span>Innovation</span>
                                <strong>
                                    {evaluation.innovation}/20
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Technical Quality
                                </span>
                                <strong>
                                    {evaluation.technicalQuality}/20
                                </strong>
                            </div>

                            <div>
                                <span>Functionality</span>
                                <strong>
                                    {evaluation.functionality}/20
                                </strong>
                            </div>

                            <div>
                                <span>UI / UX</span>
                                <strong>
                                    {evaluation.uiUx}/20
                                </strong>
                            </div>

                            <div>
                                <span>Impact</span>
                                <strong>
                                    {evaluation.impact}/20
                                </strong>
                            </div>

                        </div>


                        <div className="evaluation-remarks">

                            <span>Remarks</span>

                            <p>
                                {evaluation.remarks}
                            </p>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default EvaluationResults;