import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import '../css/app.css'; // Tailwind

import Beranda from './components/Beranda';
// Import halaman lainnya di sini, misalnya:
// import Tentang from './components/Tentang';

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Beranda />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
