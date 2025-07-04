// pages/Beranda.jsx
import React from 'react';
import NavbarBaru from '../components/LandingPage/NavbarBaru'; // Pastikan path-nya benar
import HomeContent from '../components/LandingPage/HomeContent';
import HomeContentAbout from '../components/LandingPage/HomeContentAbout'; 
import HomeContentAdvantage from '../components/LandingPage/HomeContentAdvantage';
import HomeContentContact from '../components/LandingPage/HomeContentContact';
import HomeContentSignUp from '../components/LandingPage/HomeContentSignUp';
import { SimpleFooter } from '../components/LandingPage/SimpleFooter';

function Beranda() {
  return (
    <div className="pt-16 relative">
      {/* Navbar selalu di atas */}
      <div className="relative z-20">
        <NavbarBaru />
      </div>
      {/* HomeContent di bawah */}
      <div className="relative z-10">
        <HomeContent />
      </div>
      <div className="relative z-0">
        <HomeContentAbout />
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
