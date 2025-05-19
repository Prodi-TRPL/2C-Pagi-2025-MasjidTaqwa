import React from "react";
import NavbarBaru from '../components/LandingPage/NavbarBaru'; 
import { SimpleFooter } from "../components/LandingPage/SimpleFooter";

function DonaturUserProfile() {
    return (
        <div className="pt-16 relative min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="relative z-20">
                <NavbarBaru />
            </div>

            <div className="relative z-10">
                <SimpleFooter />
            </div>
        </div>
    );
}

export default DonaturUserProfile;
