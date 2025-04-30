import React from 'react';

const HomeContentSignUp = () => {
    return (
        <section className="bg-[#5ABF9A] py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
            {/* Kiri - Teks */}
            <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-snug">
                Bersama Wujudkan <br /> Masjid yang Lebih Baik
            </h1>
            <p className="text-gray-800 text-base md:text-lg mb-6">
                Gabung sekarang dan dukung masjid dengan <br className="hidden md:block" />
                sistem manajemen yang modern.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow">
                Daftar Sekarang
            </button>
            </div>

            {/* Kanan - Gambar */}
            <div className="md:w-1/2 flex justify-center">
            <img
                src='#'
                alt="Ilustrasi Pria dengan Laptop"
                className="w-[300px] md:w-[400px] object-contain"
            />
            </div>
        </div>
        </section>
    );
};

export default HomeContentSignUp;
