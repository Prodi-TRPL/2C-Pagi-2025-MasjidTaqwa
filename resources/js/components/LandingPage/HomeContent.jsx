import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const HomeContent = () => {
    useEffect(() => {
        AOS.init({
            duration: 50000,
        });
        AOS.refresh();
    }, []);

    return (
        <div className="w-full pb-12 pt-12 lg:pt-0 bg-gray-50">
            <div className="max-w-7xl mx-auto px-5 lg:px-15 flex flex-col md:flex-row items-center gap-8">
                {/* Kiri: Teks */}
                <div className="flex-1 text-center md:text-left" data-aos="fade-right">
                    <h3 className="text-green-600 font-semibold text-lg mb-2">
                        Bantu Pembangunan Masjid
                    </h3>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                        Jadikan amal jariyah Anda bagian dari pembangunan rumah Allah
                    </h1>
                    <p className="text-gray-600 mb-6">
                    Dengan sistem donasi yang transparan dan aman, setiap rupiah yang Anda berikan akan langsung mendukung pembangunan masjid dan pelayanan terbaik untuk jamaah.
                    </p>
                    <a href="Donasi" className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition duration-300">
                        Donasi Sekarang
                    </a>
                </div>

                {/* Kanan: Gambar */}
                <div className="flex-1" data-aos="fade-left">
                    <img
                        src="../img/mosque-hero.png"  // Ganti dengan path gambar kamu
                        alt="Masjid Taqwa"
                        className="w-[600px] h-auto object-contain mx-auto"
                        draggable={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default HomeContent;
