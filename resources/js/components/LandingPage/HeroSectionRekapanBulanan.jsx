import React from 'react';
import { motion } from 'framer-motion';

const HeroSectionRekapanBulanan = ({
    title = 'Rekapan Bulanan',
    subtitle = 'Laporan donasi dan pengeluaran masjid secara berkala'
}) => {
    return (
        <div className="bg-gradient-to-r from-[#59B997] to-[#3a9b7d] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold mb-4">{title}</h1>
                    <p className="text-xl opacity-90">{subtitle}</p>
                </motion.div>
            </div>
        </div>
    );
};

export default HeroSectionRekapanBulanan;
