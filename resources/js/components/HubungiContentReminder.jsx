import React from "react";

const HubungiContentReminder = () => {
    return (
        <div className="bg-green-100 pt-10 px-4 sm:px-8 lg:px-50">
            <div className="max-w-7xl mx-auto px-4 lg:px-15 flex flex-col md:flex-row items-center justify-between">
                {/* Image */}
                <div className="flex-shrink-0 min-w-[180px] max-w-[280px] order-last md:order-first">
                    <img
                        src="../img/muslim-woman-holding-phone.png"
                        alt="Ilustrasi Pria dengan Laptop"
                        className="w-full rounded-xl object-contain"
                        draggable={false}
                    />
                </div>

                {/* Text Content */}
                <div className="w-full md:w-1/2 text-center md:text-left order-first md:order-last">
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
        </div>
    );
};

export default HubungiContentReminder;
