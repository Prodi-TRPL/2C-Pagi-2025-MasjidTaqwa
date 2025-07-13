import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMosque } from '@fortawesome/free-solid-svg-icons';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Custom color for consistency with other pages
const customGreen = "#59B997";

export default function WelcomeCard({ userName }) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center h-70 flex flex-col justify-between"
      style={{ 
        background: `linear-gradient(120deg, ${customGreen} 0%, #4da583 100%)`
      }}
    >
      <div className="text-white max-w-xs">
        <h2 className="text-2xl font-bold mb-2">Selamat Datang, {userName || "Admin"}</h2>
        <p className="mb-4">Terus pantau pembangunan Masjid Taqwa Muhammadiyah</p>
        <Link to="/dashboardhome/proyek-pembangunan">
          <button className="bg-white text-green-600 font-semibold px-4 py-2 rounded-lg hover:bg-green-100 transition">
            Lihat Pembangunan
          </button>
        </Link>
      </div>
      <div className="w-full flex justify-center md:justify-end">
        <FontAwesomeIcon icon={faMosque} className="text-white" style={{ width: '7rem', height: '6rem' }} />
      </div>
    </motion.div>
  );
}
