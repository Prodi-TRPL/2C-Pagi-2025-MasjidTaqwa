import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMosque } from '@fortawesome/free-solid-svg-icons';

export default function WelcomeCard() {
  return (
    <div className="bg-[#59B997] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center h-70 flex flex-col justify-between">
      <div className="text-white max-w-xs">
        <h2 className="text-2xl font-bold mb-2">Selamat Datang, Admin</h2>
        <p className="mb-4">Terus pantau pembangunan Masjid Taqwa Muhammadiyah</p>
        <button className="bg-white text-green-600 font-semibold px-4 py-2 rounded-lg hover:bg-green-100 transition">
          Lihat Pembangunan
        </button>
      </div>
      <div className="w-full flex justify-center md:justify-end">
        <FontAwesomeIcon icon={faMosque} className="text-white" style={{ width: '7rem', height: '6rem' }} />
      </div>
    </div>
  );
}
