import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { SidebarProvider } from './context/SidebarContext';
import { ThemeProvider } from './context/ThemeContext';
import { setupPermissionChecker } from './utils/permissionChecker';
import { invalidatePermissionsCache } from './utils/permissions';

import '../css/app.css'; // Tailwind
import Beranda from './pages/Beranda';
import Hubungi from './pages/Hubungi';
import RekapanBulanan from './pages/RekapanBulanan';
import RekapanDonatur from './pages/RekapanDonatur';
import DistribusiDanaProyek from './pages/DistribusiDanaProyek';
import LoginBaru from './pages/LoginBaru';
import SignUp from './pages/SignUp';
import LupaPassword from './pages/LupaPassword';
import DashboardHome from './pages/dashboard/DashboardAdmin/DashboardHome';
import ScrollToTop from './components/LandingPage/ScrollToTop';
import DonaturUserProfile from './pages/DonaturUserProfile';
import DonaturUserNotifikasi from './pages/DonaturUserNotifikasi';
import DonaturUserRiwayatTransaksi from './pages/DonaturUserRiwayatTransaksi';
import DonaturUserPembangunan from './pages/DonaturUserPembangunan';
import Pengeluaran from './pages/dashboard/DashboardAdmin/Pengeluaran';
import DonasiSekarang from './pages/DonasiSekarang';
import KategoriPengeluaran from './pages/dashboard/DashboardAdmin/KategoriPengeluaran';
import DataDonasi from './pages/dashboard/DashboardAdmin/DataDonasi';
import Notifikasi from './pages/dashboard/DashboardAdmin/Notifikasi';
import LaporanKeuangan from './pages/dashboard/DashboardAdmin/LaporanKeuangan';
import ProyekPembangunan from './pages/dashboard/DashboardAdmin/ProyekPembangunan';
import DetailProyek from './pages/dashboard/DashboardAdmin/DetailProyek';
import KelolaAksesDonatur from './pages/dashboard/DashboardAdmin/KelolaAksesDonatur';

import { AppWrapper } from './components/common/PageMeta'; // Import AppWrapper for HelmetProvider
import AppLayout from './layout/AppLayout'; // Dashboard layout component
import AppSidebar from './layout/AppSidebar';
import PermissionRoute from './components/ui/PermissionRoute'; // Import our permission route component
import PermissionRevokedModal from './components/ui/PermissionRevokedModal'; // Import our permission revoked modal

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
  const [permissionRevoked, setPermissionRevoked] = useState(false);
  const [revokedPermissions, setRevokedPermissions] = useState(null);

  useEffect(() => {
    // Set up permission checker if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Force permission cache refresh on component mount
      invalidatePermissionsCache();
      
      // Create permission checker with custom handler - using larger interval
      const permissionChecker = setupPermissionChecker((changedPermissions) => {
        // This will be called when permissions are revoked and confirmed
        setRevokedPermissions(changedPermissions);
        setPermissionRevoked(true);
        
        // Force logout after a short delay to show modal
        setTimeout(() => {
          // Store the message in sessionStorage
          sessionStorage.setItem('logout_message', 'Hak akses Anda telah diubah oleh administrator.');
          
          // Clear user data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Redirect to login
          window.location.href = '/loginbaru';
        }, 3000);
      }, 30000); // Check every 30 seconds (reduced frequency)
      
      // Start the permission checker
      const controller = permissionChecker.start();
      
      // Clean up on unmount
      return () => {
        controller.stop();
      };
    }
  }, []);

  useEffect(() => {
    // No loader logic needed anymore
  }, [location]);

  return (
    <>
      <ScrollToTop />
      {/* Permission Revoked Modal */}
      <PermissionRevokedModal 
        isOpen={permissionRevoked}
        changedPermissions={revokedPermissions}
        message="Hak akses Anda telah diubah oleh administrator. Anda akan keluar dari sistem."
      />
      
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
            <Route path="/Donasi" element={<DonasiSekarang />} />
            <Route path="/donasi-sekarang" element={<DonasiSekarang />} />
            <Route path="/rekapanbulanan" element={<RekapanBulanan />} />
            <Route path="/rekapandonatur" element={<RekapanDonatur />} />
            <Route path="/distribusi-dana-proyek" element={<DistribusiDanaProyek />} />
            
            {/* User routes with permission checks */}
            <Route path="/profile" element={<DonaturUserProfile />} />
            <Route 
              path="/notifikasi" 
              element={
                <PrivateRoute>
                  <PermissionRoute 
                    permissionKey="canViewNotification" 
                    component={DonaturUserNotifikasi} 
                    redirectTo="/" 
                  />
                </PrivateRoute>
              }
            />
            <Route 
              path="/riwayat-transaksi" 
              element={
                <PrivateRoute>
                  <PermissionRoute 
                    permissionKey="canViewHistory" 
                    component={DonaturUserRiwayatTransaksi} 
                    redirectTo="/" 
                  />
                </PrivateRoute>
              }
            />
            <Route path="/pembangunan" element={<DonaturUserPembangunan />} />
            
            {/* Authentication routes */}
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
              {/* Admin Dashboard Routes */}
              <Route path="datadonasi" element={<DataDonasi />} />
              <Route path="pengeluaran" element={<Pengeluaran />} />
              <Route path="kategoripengaluaran" element={<KategoriPengeluaran />} />
              <Route path="notifikasi" element={<Notifikasi />} />
              <Route path="laporan-keuangan" element={<LaporanKeuangan />} />
              <Route path="proyek-pembangunan" element={<ProyekPembangunan />} />
              <Route path="kelola-akses-donatur" element={<KelolaAksesDonatur />} />
              <Route path="kelola-notifikasi" element={<Notifikasi />} />
            </Route>
            
            {/* Detail Proyek route */}
            <Route
              path="/dashboard/proyek-pembangunan/detail/:id"
              element={
                <PrivateRoute>
                  <DetailProyek />
                </PrivateRoute>
              }
            />
          </Routes>
           
        </CSSTransition>
      </TransitionGroup>
    </>
  );
};

// Main App component
const App = () => {
  return (
    <React.StrictMode>
      <AppWrapper>
        <ThemeProvider>
          <SidebarProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </SidebarProvider>
        </ThemeProvider>
      </AppWrapper>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
