import React from 'react';

const SekilasSidontaq = () => {
    return (
        <section className="bg-green-100 p-10 px-15 rounded-2xl shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto">
                {/* deskripsi */}
                <div className="md:w-1/2 max-w-lg space-y-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-green-800">Sekilas Tentang SIDONTAQ</h2>
                    <p className="text-gray-700 text-base md:text-lg">
                        Sistem ini memberikan layanan utama dalam pengelolaan donasi dan pembangunan masjid dengan berbagai fitur,
                        seperti pencatatan keuangan, transparansi donasi, laporan wakaf, serta kemudahan akses bagi donatur.
                        Anda dapat berdonasi dengan mudah, cepat, dan aman.
                    </p>
                    <ul className="space-y-3 text-gray-700 text-base md:text-lg">
                        <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            Sistem donasi digital untuk mendukung pembangunan Masjid Taqwa Muhammadiyah
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            Kelola donasi dengan transparan dan efisien, keuangan terdokumentasi
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            Memudahkan pencatatan keuangan, laporan wakaf, dan distribusi dana masjid
                        </li>
                    </ul>
                </div>

                {/* Image Section */}
                <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
                    <img 
                        src="../img/laptopandmobile.png" 
                        alt="SIDONTAQ Preview" 
                        className="w-full max-w-sm md:max-w-md rounded-xl object-contain"
                    />
                </div>
            </div>
        </section>
    );
};

export default SekilasSidontaq;
