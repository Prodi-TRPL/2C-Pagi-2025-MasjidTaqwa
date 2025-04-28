// app.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import '../css/app.css'; // Tailwind

import Beranda from './pages/Beranda'; // Mengimpor halaman Beranda

const root = ReactDOM.createRoot(document.getElementById('app'));

root.render(
    <React.StrictMode>
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Beranda />} /> {/* Menambahkan route untuk halaman Beranda */}
        </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
