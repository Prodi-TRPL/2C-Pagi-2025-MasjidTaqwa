import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getUserPermissions, hasPermission, getPermissionDeniedMessage, checkGlobalDonationStatus } from "../../utils/permissions";
import AccessDeniedModal from "../ui/AccessDeniedModal";
import AOS from "aos";
import "aos/dist/aos.css";

const HomeContent = () => {
    const [userPermissions, setUserPermissions] = useState(null);
    const [isPermissionChecked, setIsPermissionChecked] = useState(false);
    const [globalDonationStatus, setGlobalDonationStatus] = useState({ is_active: true, message: null });
    const [accessDeniedModal, setAccessDeniedModal] = useState({
        show: false,
        title: "",
        message: "",
        icon: "warning" // warning, info, error
    });
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({
            duration: 50000,
        });
        AOS.refresh();

        // Check global donation status regardless of login
        fetchGlobalDonationStatus();
        
        // Check if user is logged in by looking for a token
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserPermissions();
        } else {
            setIsPermissionChecked(true);
        }
    }, []);

    // Function to fetch global donation status
    const fetchGlobalDonationStatus = async () => {
        try {
            const status = await checkGlobalDonationStatus();
            setGlobalDonationStatus(status);
        } catch (error) {
            console.error('Error checking global donation status:', error);
        }
    };

    // Function to fetch user permissions
    const fetchUserPermissions = async () => {
        try {
            const permissions = await getUserPermissions();
            setUserPermissions(permissions);
        } catch (error) {
            console.error('Error fetching user permissions:', error);
        } finally {
            setIsPermissionChecked(true);
        }
    };

    // Handle donation button click
    const handleDonateClick = (e) => {
        e.preventDefault();
        
        // First check global donation status
        if (!globalDonationStatus.is_active) {
            // Get the message from server
            let title = globalDonationStatus.message?.type === 'error' ? 'Donasi Ditolak' :
                       globalDonationStatus.message?.type === 'info' ? 'Informasi Donasi' : 'Donasi Tidak Tersedia';
            
            // Get default message
            let message = globalDonationStatus.message?.message || 'Sistem donasi sedang tidak aktif. Silakan coba lagi nanti.';
            
            // Check for specific reasons if no custom message is provided
            if (globalDonationStatus.details) {
                const details = globalDonationStatus.details;
                if (details.end_date_reached && !globalDonationStatus.message?.message) {
                    message = 'Periode donasi telah berakhir. Terima kasih atas partisipasi Anda.';
                } else if (details.target_met && !globalDonationStatus.message?.message) {
                    message = 'Target donasi telah tercapai! Terima kasih atas dukungan Anda.';
                }
            }
            
            // Show access denied modal with the appropriate message
            setAccessDeniedModal({
                show: true,
                title,
                message,
                icon: globalDonationStatus.message?.type || 'warning'
            });
            return;
        }
        
        // Then check user-specific permissions if logged in
        if (localStorage.getItem('token')) {
            // If permissions are still loading, wait
            if (!isPermissionChecked) {
                return;
            }
            
            // Check if user has permission to donate
            if (!hasPermission(userPermissions, 'canDonate')) {
                // Show access denied modal
                const { title, message } = getPermissionDeniedMessage('canDonate');
                setAccessDeniedModal({
                    show: true,
                    title,
                    message,
                    icon: 'error'
                });
                return;
            }
        }
        
        // If all checks pass, navigate to donation page
        navigate('/Donasi');
    };

    // Function to close the access denial modal
    const closeAccessDeniedModal = () => {
        setAccessDeniedModal({
            ...accessDeniedModal,
            show: false
        });
    };

    return (
        <div className="relative">
            {/* sections of the home page - unchanged */}
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
                        <button 
                            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition duration-300"
                            onClick={handleDonateClick}
                        >
                            Donasi Sekarang
                        </button>
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

            {/* Access Denied Modal */}
            <AccessDeniedModal
                isOpen={accessDeniedModal.show}
                onClose={closeAccessDeniedModal}
                title={accessDeniedModal.title}
                message={accessDeniedModal.message}
                icon={accessDeniedModal.icon}
            />
        </div>
    );
};

export default HomeContent;
