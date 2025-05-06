import React from "react";
import NavbarBaru from '../components/NavbarBaru'; 
import HeroSectionRekapanDonatur from "../components/HeroSectionRekapanDonatur";
import DonationTableDonatur from "../components/DonationTableDonatur"; 
import { SimpleFooter } from "../components/SimpleFooter";
function RekapanDonatur() {
    return (
        <div className="pt-16 relative">
            <div className="relative z-20">
                <NavbarBaru />
            </div>
            <div className="relative z-10">
                <HeroSectionRekapanDonatur title="Rekapan Donatur" />
            </div>
            <div className="relative z-10 px-6 py-8">
                <DonationTableDonatur /> 
            </div>
            <div className="relative z-10">
                <SimpleFooter />
            </div>
        </div>
    );
}

export default RekapanDonatur;
