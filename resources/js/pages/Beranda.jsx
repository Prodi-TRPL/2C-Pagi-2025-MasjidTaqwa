// pages/Beranda.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarBaru from '../components/LandingPage/NavbarBaru'; // Pastikan path-nya benar
import HomeContent from '../components/LandingPage/HomeContent';
import HomeContentAbout from '../components/LandingPage/HomeContentAbout'; 
import HomeContentAdvantage from '../components/LandingPage/HomeContentAdvantage';
import HomeContentContact from '../components/LandingPage/HomeContentContact';
import HomeContentSignUp from '../components/LandingPage/HomeContentSignUp';
import SpaceWave from '../components/LandingPage/SpaceWave';
import { SimpleFooter } from '../components/LandingPage/SimpleFooter';
import { isAdmin } from '../utils/auth';

function Beranda() {
  const navigate = useNavigate();

  // Check if user is admin and redirect to dashboard
  useEffect(() => {
    // Check if the user is logged in as admin
    if (isAdmin()) {
      // Redirect to dashboard
      navigate('/dashboardhome');
    }
  }, [navigate]);

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

      <div className="relative z-0 bg-[#dcfce4]">
        <SpaceWave variant="wave1" />
      </div>

      <div className="relative z-0">
        <HomeContentAbout />
      </div>

      <div className="relative z-0">
        <SpaceWave variant="wave2" />
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
