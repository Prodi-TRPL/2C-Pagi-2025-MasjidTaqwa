import React from "react";

const HubungiContentReminder = () => {
    return (
        <div className="bg-green-100 py-10 px-4 sm:px-8 lg:px-20 flex flex-col md:flex-row items-center justify-between">
        {/* Image */}
        <div className="w-full md:w-1/2 flex justify-center mb-6 md:mb-0">
            <img
            src="/path/to/image.jpg" // Ganti dengan path gambar kamu
            alt="Customer Service"
            className="w-[280px] sm:w-[320px] lg:w-[400px] rounded-xl object-cover"
            />
        </div>

        {/* Text Content */}
        <div className="w-full md:w-1/2 text-center md:text-left">
            <p className="text-sm font-semibold text-gray-700 mb-2">
            Bergabunglah dengan eMasjid Sekarang!
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-green-800 leading-tight">
            Optimalkan <br />
            Pengelolaan Keuangan <br />
            dan Kegiatan Masjid
            </h1>
            <button className="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow">
            Informasi eMasjid
            </button>
            <p className="text-sm text-gray-600 mt-3">
            *Jangan lewatkan kesempatan untuk menghadirkan solusi inovatif untuk
            pengelolaan masjid
            </p>
        </div>
        </div>
    );
};

export default HubungiContentReminder;
