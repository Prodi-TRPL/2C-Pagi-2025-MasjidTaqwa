import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios';

const HomeContentSignUp = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Helper function to safely get item from localStorage
    const safeGetItem = (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error("localStorage error:", e);
            return null;
        }
    };
    
    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = safeGetItem('token');
                
                // If no token, user is not logged in
                if (!token) {
                    console.log("User not authenticated - no token found");
                    setIsAuthenticated(false);
                    return;
                }
                
                // If token exists, try to get user profile to validate
                const response = await axios.get('/api/donatur/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if (response.data) {
                    console.log("User authenticated:", response.data);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.log("User authentication error:", error);
                setIsAuthenticated(false);
            }
        };
        
        checkAuth();
    }, []);
    
    useEffect(() => {
        AOS.init({
            duration: 500,
            once: true,
        });
    }, []);

    // Don't render anything if user is authenticated
    if (isAuthenticated) {
        return null;
    }
    
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
                className="py-0 md:py-4 lg:py-8 px-0 md:px-3 lg:px-6 z-10 relative bg-gradient-to-r from-[#59B997] to-[#3a9b7d]"
                data-aos="fade-right"
            >
                <div className="max-w-7xl mx-auto px-0 md:px-5 lg:px-15">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0 z-10 p-6 md:p-12">
                            <h1
                                className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug"
                                style={{
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                                }}
                            >
                                Bersama Wujudkan <br /> Masjid yang Lebih Baik
                            </h1>
                            <div className="w-50 h-0.5 bg-white mb-4 mx-auto md:mx-0"></div>
                            <p
                                className="text-base md:text-lg mb-6 text-white font-bold"
                                style={{
                                textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
                                }}
                            >
                                Gabung sekarang dan dukung masjid dengan <br className="hidden md:block" />
                                sistem manajemen yang modern.
                            </p>
                            <Link
                                to="/signup"
                                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg shadow inline-block"
                            >
                                Daftar Sekarang
                            </Link>
                            </div>

                        {/* Right spacer */}
                        <div className="md:w-1/2 mt-8 md:mt-0" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomeContentSignUp;
