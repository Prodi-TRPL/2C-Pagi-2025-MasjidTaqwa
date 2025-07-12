import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { SidebarProvider } from './context/SidebarContext';
import { ThemeProvider } from './context/ThemeContext';
import { setupPermissionChecker } from './utils/permissionChecker';
import { invalidatePermissionsCache } from './utils/permissions';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';

import '../css/app.css'; // Tailwind
import Beranda from './pages/Beranda';
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

// Import new auth components
import VerifyEmail from './pages/auth/VerifyEmail';
import ResetPassword from './pages/auth/ResetPassword';
import ResendVerification from './pages/auth/ResendVerification';
import VerificationFailed from './pages/auth/VerificationFailed';
import VerificationError from './pages/auth/VerificationError';

// Diagnostic component
const DiagnosticPage = () => {
  const [testStatus, setTestStatus] = useState('Ready');
  const [results, setResults] = useState([]);
  
  const runTest = async (name, testFn) => {
    try {
      setResults(prev => [...prev, { name, status: 'Running...' }]);
      await testFn();
      setResults(prev => prev.map(r => r.name === name ? { ...r, status: 'Passed' } : r));
    } catch (error) {
      setResults(prev => prev.map(r => r.name === name ? { ...r, status: 'Failed', error: error.message } : r));
    }
  };
  
  const testRegistration = async () => {
    const testData = {
      nama: 'Test User ' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      password_confirmation: 'password123'
    };
    
    setTestStatus('Testing registration...');
    
    try {
      const debugResponse = await axios.post('/api/debug-register', testData);
      console.log('Debug response:', debugResponse.data);
      
      if (Object.keys(debugResponse.data.validation).length > 0) {
        throw new Error('Validation failed: ' + JSON.stringify(debugResponse.data.validation));
      }
      
      setTestStatus('Registration validation OK');
    } catch (error) {
      setTestStatus('Registration test failed');
      throw error;
    }
  };
  
  const testSimpleRegistration = async () => {
    const testData = {
      nama: 'Simple Test User ' + Date.now(),
      email: 'simple' + Date.now() + '@example.com',
      password: 'password123',
      password_confirmation: 'password123'
    };
    
    setTestStatus('Testing simple registration...');
    
    try {
      const response = await axios.post('/api/simple-register', testData);
      console.log('Simple registration response:', response.data);
      
      if (!response.data.success) {
        throw new Error('Validation failed: ' + JSON.stringify(response.data.errors));
      }
      
      setTestStatus('Simple registration validation OK');
    } catch (error) {
      console.error('Simple registration error:', error);
      setTestStatus('Simple registration test failed');
      throw error;
    }
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Diagnostic Tests</h1>
      
      <div className="mb-4">
        <p>Status: {testStatus}</p>
      </div>
      
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => runTest('Registration', testRegistration)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Registration
        </button>
        
        <button 
          onClick={() => runTest('Simple Registration', testSimpleRegistration)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Simple Registration
        </button>
      </div>
      
      <div className="border rounded p-4">
        <h2 className="text-xl font-semibold mb-3">Results:</h2>
        
        {results.length === 0 ? (
          <p className="text-gray-500">No tests run yet</p>
        ) : (
          <ul>
            {results.map((result, index) => (
              <li key={index} className="mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{result.name}:</span>
                  <span className={`px-2 py-1 rounded text-white text-sm ${
                    result.status === 'Passed' ? 'bg-green-500' : 
                    result.status === 'Failed' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}>
                    {result.status}
                  </span>
                </div>
                {result.error && (
                  <p className="text-red-500 text-sm mt-1">{result.error}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

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

  // Check if current route is login or register
  const isAuthPage = location.pathname === '/loginbaru' || location.pathname === '/signup';

  return (
    <>
      <ScrollToTop />
      {/* Permission Revoked Modal */}
      <PermissionRevokedModal 
        isOpen={permissionRevoked}
        changedPermissions={revokedPermissions}
        message="Hak akses Anda telah diubah oleh administrator. Anda akan keluar dari sistem."
      />
      
      {/* Use AnimatePresence for login/register pages and TransitionGroup for other pages */}
      {isAuthPage ? (
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/loginbaru"
              element={
                <PublicRoute>
                  <LoginBaru />
                </PublicRoute>
              }
            />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </AnimatePresence>
      ) : (
      <TransitionGroup>
        <CSSTransition
          key={location.key}
          classNames="slide"
          timeout={300}
        >
          <Routes location={location}>
            {/* Public routes */}
            <Route path="/" element={<Beranda />} />
            {/* Redirect /hubungi to homepage with anchor */}
            <Route path="/hubungi" element={<Navigate to="/#hubungi" replace />} />
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
            <Route path="/lupapassword" element={<LupaPassword />} />
            
            {/* New auth routes */}
            <Route path="/verify-email/:id/:token" element={<VerifyEmail />} />
            <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
            <Route path="/resend-verification" element={<ResendVerification />} />
            <Route path="/verification-failed" element={<VerificationFailed />} />
            <Route path="/verification-error" element={<VerificationError />} />

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

            {/* Diagnostic route */}
            <Route path="/diagnostic" element={<DiagnosticPage />} />
          </Routes>
        </CSSTransition>
      </TransitionGroup>
      )}
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
