import React from "react";

const HubungiContentReminder = () => {
    return (
        <div className="bg-green-100 pt-10 px-4 sm:px-8 lg:px-50">
            <div className="max-w-7xl mx-auto px-4 lg:px-15 flex flex-col md:flex-row items-center justify-between">
                {/* Image Section */}
                <div className="flex-shrink-0 min-w-[180px] max-w-[280px] order-last md:order-first">
                    <img
                        src="../img/muslim-woman-holding-phone.png"
                        alt="Ilustrasi Muslimah Memegang Ponsel"
                        className="w-full rounded-xl object-contain"
                        draggable={false}
                    />
                </div>

                {/* Text Section */}
                <div className="w-full md:w-1/2 text-center md:text-left order-first md:order-last">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                        Bergabunglah bersama <span className="font-bold text-green-700">Sidontaq</span> hari ini!
                    </p>
                    <h1 className="text-3xl sm:text-3xl font-bold text-green-800 leading-tight">
                        Dukung pembangunan Masjid Taqwa Muhammadiyah Kota Batam dengan cara yang lebih transparan dan efisien. 
                    </h1>
                    <button className="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-300">
                        Lihat Informasi Masjid
                    </button>
                    <p className="text-sm text-gray-600 mt-3 italic">
                        Solusi modern untuk donasi yang lebih terstruktur, terpercaya, dan berdampak nyata.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HubungiContentReminder;
