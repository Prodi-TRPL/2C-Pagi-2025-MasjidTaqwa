import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import '../css/app.css'; // Tailwind
import Beranda from './pages/Beranda';
import Hubungi from './pages/Hubungi';
import RekapanBulanan from './pages/RekapanBulanan';
import RekapanDonatur from './pages/RekapanDonatur';
import LoginBaru from './pages/LoginBaru';
import SignUp from './pages/SignUp';
import LupaPassword from './pages/LupaPassword';
import DashboardHome from './pages/dashboard/DashboardAdmin/DashboardHome';
import ScrollToTop from './components/LandingPage/ScrollToTop';

import { AppWrapper } from './components/common/PageMeta'; // Import AppWrapper for HelmetProvider
import AppLayout from './layout/AppLayout'; // Dashboard layout component

// Komponen wrapper untuk routing dengan animasi transisi
const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    // No loader logic needed anymore
  }, [location]);

  return (
    <>
      <ScrollToTop />
      <TransitionGroup>
        <CSSTransition
          key={location.key}
          classNames="slide"
          timeout={300}
        >
          <Routes location={location}>
            {/* Public routes */}
            <Route path="/" element={<Beranda />} />
            <Route path="/hubungi" element={<Hubungi />} />
            <Route path="/rekapanbulanan" element={<RekapanBulanan />} />
            <Route path="/rekapandonatur" element={<RekapanDonatur />} />
            <Route path="/loginbaru" element={<LoginBaru />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/lupapassword" element={<LupaPassword />} />

            {/* Dashboard routes wrapped in layout */}
            <Route path="/dashboardhome" element={<AppLayout />}>
              <Route index element={<DashboardHome />} />
              {/* Add other dashboard routes here */}
            </Route>
          </Routes>
        </CSSTransition>
      </TransitionGroup>
    </>
  );
};

// Komponen utama yang di-render
import { ThemeProvider } from './context/ThemeContext';

const App = () => (
  <AppWrapper>
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  </AppWrapper>
);

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
