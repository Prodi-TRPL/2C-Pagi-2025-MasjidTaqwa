import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

const HomeContentSignUp = () => {
    useEffect(() => {
        AOS.init({
            duration: 500,
            once: true,
        });
    }, []);

    return (
        <div className="relative">
            {/* Gambar absolute menimpa dua section */}
            <img
                src="../img/muslim-man-holding-laptop.png"
                alt="Ilustrasi Pria dengan Laptop"
                className="hidden md:block absolute right-0 z-20 object-contain"
                style={{
                    height: '550px',         
                    bottom: 0,               
                    transform: 'translateY(0%)' 
                }}
                draggable={false}
                data-aos="fade-in"
            />

            {/* Top white layout, hidden on mobile - no animation */}
            <section className="hidden sm:block bg-white h-40 w-full z-0"></section>

            {/* Bottom green layout with fade-left animation */}
            <section
                className="bg-[#5ABF9A] py-8 px-6 z-10 relative"
                data-aos="fade-left"
            >
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
                    {/* Left text */}
                    <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0 z-10 p-6 md:p-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-snug">
                            Bersama Wujudkan <br /> Masjid yang Lebih Baik
                        </h1>
                        <p className="text-gray-800 text-base md:text-lg mb-6">
                            Gabung sekarang dan dukung masjid dengan <br className="hidden md:block" />
                            sistem manajemen yang modern.
                        </p>
                        <Link
                            to="/signup"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow inline-block"
                        >
                            Daftar Sekarang
                        </Link>
                    </div>

                    {/* Right spacer */}
                    <div className="md:w-1/2 mt-8 md:mt-0" />
                </div>
            </section>
        </div>
    );
};

export default HomeContentSignUp;
