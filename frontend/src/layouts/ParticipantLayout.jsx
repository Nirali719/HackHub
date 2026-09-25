import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const ParticipantLayout = () => {
    return (
        <div className="participant-layout">

            <Navbar />

            <main className="participant-content">
                <Outlet />
            </main>

        </div>
    );
};

export default ParticipantLayout;