import React from "react";
import NavbarBaru from '../components/LandingPage/NavbarBaru'; 
import { SimpleFooter } from "../components/LandingPage/SimpleFooter";

function DonaturUserNotifikasi() {
    return (
        <div className="pt-16 relative">
            <div className="relative z-20">
                <NavbarBaru />
            </div>

            <div className="relative z-10">
                <SimpleFooter />
            </div>
        </div>
    )
}

export default DonaturUserNotifikasi;