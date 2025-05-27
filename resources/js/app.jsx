import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import DonaturUserProfile from './pages/DonaturUserProfile';
import DonaturUserNotifikasi from './pages/DonaturUserNotifikasi';
import DonaturUserRiwayatTransaksi from './pages/DonaturUserRiwayatTransaksi';
import Pengeluaran from './pages/dashboard/DashboardAdmin/Pengeluaran';
import KategoriPengeluaran from './pages/dashboard/DashboardAdmin/KategoriPengeluaran'

import { AppWrapper } from './components/common/PageMeta'; // Import AppWrapper for HelmetProvider
import AppLayout from './layout/AppLayout'; // Dashboard layout component

// PrivateRoute component to protect dashboard routes
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Not logged in, redirect to login
    return <Navigate to="/loginbaru" replace />;
  }
  return children;
};

// PublicRoute component to redirect logged-in users away from login page
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Logged in, redirect to dashboard
    return <Navigate to="/dashboardhome" replace />;
  }
  return children;
};

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
            <Route path="/profile" element={<DonaturUserProfile />} />
            <Route path="/riwayat-transaksi" element={<DonaturUserRiwayatTransaksi />} />
            <Route
              path="/loginbaru"
              element={
                <PublicRoute>
                  <LoginBaru />
                </PublicRoute>
              }
            />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/lupapassword" element={<LupaPassword />} />

            {/* Dashboard routes wrapped in layout and protected */}
            <Route
              path="/dashboardhome"
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              {/* Add other dashboard routes here */}
              <Route path="notifikasi" element={<DonaturUserNotifikasi />} />
              <Route path="Pengeluaran" element={<Pengeluaran />} />
               <Route path="KategoriPengeluaran" element={<KategoriPengeluaran />} />
              
            </Route>
            <Route path="/notifikasi" element={<DonaturUserNotifikasi />} />
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
