import React from "react";
import NavbarBaru from '../components/NavbarBaru'; 
import HeroSectionRekapanBulanan from "../components/HeroSectionRekapanBulanan";
import { SimpleFooter } from "../components/SimpleFooter";
import DonationChartBulanan from "../components/DonationChartBulanan";

const RekapanBulanan = () => {
    return (
        <div className="pt-16 relative">
        {/* Navbar */}
        <div className="relative z-20">
            <NavbarBaru />
        </div>
        {/* Hero Section */}
        <div className="relative z-10">
            <HeroSectionRekapanBulanan title="Rekapan Bulanan" />
        </div>
        {/* Konten */}
        <div className="relative z-10 pt-6 px-6 pb-8">
            <h1 className="text-2xl font-bold text-center mb-6">Grafik Donasi</h1>
            <DonationChartBulanan />
        </div>

        {/* Footer */}
        <div className="relative z-10">
            <SimpleFooter />
        </div>
        </div>
    );
};

export default RekapanBulanan;
