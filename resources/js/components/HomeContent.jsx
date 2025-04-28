import React from "react";

const HomeContent = () => {
    return (
        <div className="w-full py-12 bg-green-50">
        <div className="max-w-7xl mx-auto px-15 flex flex-col md:flex-row items-center gap-8">
            {/* Kiri: Teks */}
            <div className="flex-1 text-center md:text-left">
            <h3 className="text-green-600 font-semibold text-lg mb-2">
                Bantu Pembangunan Masjid
            </h3>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Solusi Software Andal untuk Manajemen Donasi Masjid Taqwa Muhammadiyah
            </h1>
            <p className="text-gray-600 mb-6">
                Hadirkan Donasi Transparan dan Aman. 
                Setiap kontribusi Anda tercatat dengan jelas dan mendukung pembangunan serta pelayanan bagi jamaah.
            </p>
            <a href="#" className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition duration-300">
                Donasi Sekarang
            </a>
            </div>

            {/* Kanan: Gambar */}
            <div className="flex-1">
            <img
                src="/images/masjid.jpg"  // Ganti dengan path gambar kamu
                alt="Masjid Taqwa"
                className="w-full rounded-2xl shadow-lg object-cover"
            />
            </div>
        </div>
        </div>
    );
};

export default HomeContent;
