import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import HackathonCard from "../components/HackathonCard";

const Hackathons = () => {
    const navigate = useNavigate();

    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchHackathons();
    }, []);

    const fetchHackathons = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/hackathons");

            setHackathons(response.data.hackathons || []);

        } catch (error) {
            console.error("Error fetching hackathons:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load hackathons."
            );
        } finally {
            setLoading(false);
        }
    };

   const handleViewDetails = (id) => {
    navigate(`/participant/hackathons/${id}`);
};

    return (
        <div className="hackathons-page">

            <div className="hackathons-container">

                <div className="page-header">

                    <div>
                        <h1>Hackathons</h1>

                        <p>
                            Explore available hackathons and participate
                            in exciting challenges.
                        </p>
                    </div>

                    <button
                        className="refresh-button"
                        onClick={fetchHackathons}
                    >
                        Refresh
                    </button>

                </div>

                {loading && (
                    <div className="loading-message">
                        Loading hackathons...
                    </div>
                )}

                {error && (
                    <div className="error-box">
                        {error}
                    </div>
                )}

                {!loading && !error && hackathons.length === 0 && (
                    <div className="empty-message">
                        <h2>No Hackathons Available</h2>

                        <p>
                            There are currently no hackathons
                            available.
                        </p>
                    </div>
                )}

                {!loading && !error && hackathons.length > 0 && (
                    <div className="hackathon-grid">

                        {hackathons.map((hackathon) => (
                            <HackathonCard
                                key={hackathon._id}
                                hackathon={hackathon}
                                onViewDetails={handleViewDetails}
                            />
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
};

export default Hackathons;