const HackathonCard = ({ hackathon, onViewDetails }) => {
    const formatDate = (date) => {
        if (!date) return "Not specified";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="hackathon-card">

            <div className="hackathon-card-header">
                <span className={`status-badge status-${hackathon.status}`}>
                    {hackathon.status}
                </span>
            </div>

            <h2>{hackathon.title}</h2>

            <p className="hackathon-description">
                {hackathon.description}
            </p>

            <div className="hackathon-info">

                <div>
                    <strong>Registration Deadline</strong>
                    <span>
                        {formatDate(hackathon.registrationDeadline)}
                    </span>
                </div>

                <div>
                    <strong>Submission Deadline</strong>
                    <span>
                        {formatDate(hackathon.submissionDeadline)}
                    </span>
                </div>

                <div>
                    <strong>Team Size</strong>
                    <span>
                        Maximum {hackathon.maxTeamSize} members
                    </span>
                </div>

            </div>

            {hackathon.eligibility && (
                <div className="eligibility">
                    <strong>Eligibility:</strong>{" "}
                    {hackathon.eligibility}
                </div>
            )}

            <button
                className="view-button"
                onClick={() => onViewDetails(hackathon._id)}
            >
                View Details
            </button>

        </div>
    );
};

export default HackathonCard;