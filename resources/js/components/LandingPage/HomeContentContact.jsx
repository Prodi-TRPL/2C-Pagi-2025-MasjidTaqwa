import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios';

function HomeContentContact() {
    const [adminPhone, setAdminPhone] = useState('');

    // Format phone number to Indonesian format with hyphens
    const formatPhoneNumber = (phone) => {
        if (!phone) return '895-3712-88838'; // Default formatted number
        
        // Remove leading zero if present
        const cleanNumber = phone.replace(/^0/, '');
        
        // Format with hyphens: XXX-XXXX-XXXX
        if (cleanNumber.length >= 10) {
            const part1 = cleanNumber.substring(0, 3);
            const part2 = cleanNumber.substring(3, 7);
            const part3 = cleanNumber.substring(7);
            return `${part1}-${part2}-${part3}`;
        } else if (cleanNumber.length >= 7) {
            // Handle shorter numbers
            const part1 = cleanNumber.substring(0, 3);
            const part2 = cleanNumber.substring(3, 7);
            const part3 = cleanNumber.substring(7);
            return `${part1}-${part2}-${part3}`;
        }
        
        return cleanNumber; // If too short, return as is
    };

    useEffect(() => {
        AOS.init({
            duration: 500,
            once: true,
        });
        
        // Fetch admin phone number
        const fetchAdminPhone = async () => {
            try {
                // Try to get from localStorage first (if recently loaded)
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    if (userData && userData.role === 'admin' && userData.phone) {
                        // Store the phone number to be formatted later
                        setAdminPhone(userData.phone);
                        return;
                    }
                }
                
                // If not in localStorage, fetch from API
                const response = await axios.get('/api/public/admin-contact');
                if (response.data && response.data.phone) {
                    // Store the phone number to be formatted later
                    setAdminPhone(response.data.phone);
                }
            } catch (error) {
                console.error('Error fetching admin phone number:', error);
                // Fallback to default number
                setAdminPhone('0895371288838');
            }
        };
        
        fetchAdminPhone();
    }, []);

    return (
        <section id="hubungi" className="flex flex-col md:flex-row items-center justify-center gap-10 p-6 md:p-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 lg:px-15 w-full flex flex-col md:flex-row items-center justify-center gap-10">
                {/* Image section with overlapping elements */}
                <div
                    className="relative w-full md:w-1/2 flex justify-center items-center"
                    data-aos="fade-right"
                >
                    {/* Base image */}
                    <img
                        src="../img/man-holding-phone.png" 
                        alt="Elderly Man"
                        className="flex-shrink-0 flex-grow-0"
                        style={{ width: '500px', height: '350px', objectFit: 'contain' }}
                    />
                </div>

                {/* Text and contact info section */}
                <div
                    className="w-full md:w-1/2 space-y-6"
                    data-aos="fade-left"
                >
                    <h2 className="text-green-600 font-bold text-sm">SIDONTAQ</h2>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Dukung Pembangunan Masjid
                        <br />
                        Dengan Donasi Mudah Dan Transparan
                    </h1>
                    <ul className="space-y-2 text-gray-700">
                        <li>✅ Salurkan donasi dengan aman dan real-time.</li>
                        <li>✅ Pantau perkembangan pembangunan secara langsung.</li>
                        <li>✅ Donasi mudah melalui aplikasi, di mana pun dan kapan pun.</li>
                        <li>✅ Investasi kebaikan yang terus mengalir bagi umat.</li>
                    </ul>
                    <div className="flex items-center text-green-600 text-xl font-semibold mt-4">
                        {/* Font Awesome Phone Icon */}
                        <FontAwesomeIcon icon={faPhone} className="mr-2" />
                        <span>+62 {formatPhoneNumber(adminPhone)}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HomeContentContact;
