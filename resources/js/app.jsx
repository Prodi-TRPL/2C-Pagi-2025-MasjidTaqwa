// app.jsx
import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import '../css/app.css'; // Tailwind
import Beranda from './pages/beranda';
import Hubungi from './pages/Hubungi';
import RekapanBulanan from './pages/RekapanBulanan';
import Login from './pages/Login';
import ScrollToTop from './components/ScrollToTop';

// Komponen wrapper untuk routing
const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    // No loader logic needed anymore
  }, [location]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/hubungi" element={<Hubungi />} />
        <Route path="/rekapanbulanan" element={<RekapanBulanan />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
};

// Komponen utama yang di-render
const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
