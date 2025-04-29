// app.jsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import '../css/app.css'; // Tailwind
import Beranda from './pages/beranda';
import Login from './pages/Login';
import Loader from './components/Loader';

// Komponen wrapper untuk routing + loader
const AppRoutes = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [location]);

  return (
    <>
      {loading && <Loader />}
      <Routes>
        <Route path="/" element={<Beranda />} />
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
