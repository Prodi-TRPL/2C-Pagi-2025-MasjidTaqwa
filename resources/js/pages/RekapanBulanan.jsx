import React, { useState, useEffect } from "react";
import NavbarBaru from '../components/LandingPage/NavbarBaru'; 
import HeroSectionRekapanBulanan from "../components/LandingPage/HeroSectionRekapanBulanan";
import { SimpleFooter } from "../components/LandingPage/SimpleFooter";
import DonationChartBulanan from "../components/LandingPage/DonationChartBulanan";
import { motion } from "framer-motion";

const RekapanBulanan = () => {
    const [loading, setLoading] = useState(true);

    // Simulate loading state for better user experience
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Navbar */}
            <div className="relative z-20">
                <NavbarBaru />
            </div>
            
            {/* Main Content */}
            <div className="flex-grow pt-16">
                {/* Hero Section */}
                <HeroSectionRekapanBulanan 
                    title="Rekapan Bulanan" 
                    subtitle="Laporan donasi dan pengeluaran masjid secara berkala" 
                />
                
                {/* Chart Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-xl shadow-sm overflow-hidden"
                    >
                        {loading ? (
                            <div className="flex justify-center items-center py-32">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#59B997]"></div>
                            </div>
                        ) : (
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Grafik Donasi dan Pengeluaran</h2>
                                <DonationChartBulanan />
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
            
            {/* Footer */}
            <SimpleFooter />
        </div>
    );
};

export default RekapanBulanan;
