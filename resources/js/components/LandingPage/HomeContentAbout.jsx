import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const SekilasSidontaq = () => {
    useEffect(() => {
        AOS.init({
            duration: 50000,
            once: true,
        });
    }, []);

    return (
<section id="tentang" className="bg-gray-50 p-10 px-15 rounded-2xl shadow-lg font-sans text-[#222831]">
<div className="max-w-7xl mx-auto px-1 lg:px-15">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    {/* deskripsi */}
                    <div className="md:w-1/2 max-w-lg space-y-6" data-aos="fade-left">
                        <h2 className="text-2xl md:text-3xl font-bold text-[#59B997] font-poppins">Sekilas Tentang SIDONTAQ</h2>
                        <p className="text-[#4E5D58] text-base md:text-lg font-open-sans">
                            Sistem ini memberikan layanan utama dalam pengelolaan donasi dan pembangunan masjid dengan berbagai fitur,
                            seperti pencatatan keuangan, transparansi donasi, laporan wakaf, serta kemudahan akses bagi donatur.
                            Anda dapat berdonasi dengan mudah, cepat, dan aman.
                        </p>
                        <ul className="space-y-3 text-[#4E5D58] text-base md:text-lg font-open-sans">
                            <li className="flex items-start">
                                <span className="text-[#59B997] mr-2">✓</span>
                                Sistem donasi digital untuk mendukung pembangunan Masjid Taqwa Muhammadiyah
                            </li>
                            <li className="flex items-start">
                                <span className="text-[#59B997] mr-2">✓</span>
                                Kelola donasi dengan transparan dan efisien, keuangan terdokumentasi
                            </li>
                            <li className="flex items-start">
                                <span className="text-[#59B997] mr-2">✓</span>
                                Memudahkan pencatatan keuangan, laporan wakaf, dan distribusi dana masjid
                            </li>
                        </ul>
                    </div>

                    {/* Image Section */}
                    <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center" data-aos="fade-right">
                        <img 
                            src="../img/laptopandmobile.png" 
                            alt="SIDONTAQ Preview" 
                            className="w-full max-w-sm md:max-w-md rounded-xl object-contain"
                            draggable={false}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SekilasSidontaq;
