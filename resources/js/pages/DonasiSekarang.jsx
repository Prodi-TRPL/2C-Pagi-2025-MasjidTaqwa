import React from "react";
import NavbarBaru from '../components/LandingPage/NavbarBaru'; 
import DonationFirstPage from "../components/LandingPage/DonationFirstPage";
import { SimpleFooter } from '../components/LandingPage/SimpleFooter';

const DonasiSekarang = () => {
    return (
        <div className="pt-16 relative">
        {/* Navbar */}
        <div className="relative z-20">
            <NavbarBaru />
        </div>
        {/* Hero Section */}
        <div className="relative z-5">
            <DonationFirstPage title="Donasi Sekarang" />
        </div>
        {/* Footer */}
        <div className="relative z-10">
            <SimpleFooter />
        </div>
        </div>
    );
};

export default DonasiSekarang;
