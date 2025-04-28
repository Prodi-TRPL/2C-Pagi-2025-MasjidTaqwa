// pages/Beranda.jsx
import React from 'react';
import Navbar from '../components/Navbar'; // Pastikan path-nya benar
import HomeContent from '../components/HomeContent';

function Beranda() {
  return (
    <div className="relative">
      {/* Navbar selalu di atas */}
      <div className="relative z-20">
        <Navbar />
      </div>

      {/* HomeContent di bawah */}
      <div className="relative z-10">
        <HomeContent />
      </div>
    </div>
  );
}

export default Beranda;
