// pages/Beranda.jsx
import React from 'react';
import Navbar from '../components/Navbar'; // Pastikan path-nya benar
import HomeContent from '../components/HomeContent';
import HomeContentAbout from '../components/HomeContentAbout'; 
import HomeContentEco from '../components/HomeContentEco';
import HomeContentAdvantage from '../components/HomeContentAdvantage';
import HomeContentContact from '../components/HomeContentContact';
import HomeContentSignUp from '../components/HomeContentSignUp';
import { SimpleFooter } from '../components/SimpleFooter';

function Beranda() {
  return (
    <div className="pt-16 relative">
      {/* Navbar selalu di atas */}
      <div className="relative z-20">
        <Navbar />
      </div>
      {/* HomeContent di bawah */}
      <div className="relative z-10">
        <HomeContent />
      </div>
      <div className="relative z-0">
        <HomeContentAbout />
      </div>
      <div className="relative z-0">
        <HomeContentEco />
      </div>
      <div className="relative z-0">
        <HomeContentAdvantage />
      </div>
      <div className="relative z-0">
        <HomeContentContact />
      </div>
      <div className="relative z-0">
        <HomeContentSignUp />
      </div>
      <div className="relative z-0">
        <SimpleFooter />
      </div>
    </div>
  );
}

export default Beranda;
