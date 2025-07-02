import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getUserPermissions, hasPermission, getPermissionDeniedMessage, checkGlobalDonationStatus } from "../../utils/permissions";
import AccessDeniedModal from "../ui/AccessDeniedModal";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";

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
    // Add states for statistics and projects
    const [stats, setStats] = useState({
        totalDonation: 0,
        totalExpense: 0,
        balance: 0,
        totalProjects: 0
    });
    const [proyeks, setProyeks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const scrollRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({
            duration: 50000,
        });
        AOS.refresh();

        // Check global donation status regardless of login
        fetchGlobalDonationStatus();
        
        // Fetch statistics and projects
        fetchData();
        
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
    
    // New function to fetch statistics and projects data
    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch projects
            const proyeksResponse = await axios.get('/api/ProyekPembangunan');
            const proyeksData = proyeksResponse.data.data || proyeksResponse.data;
            
            // Fetch expenses
            let pengeluaransData = [];
            try {
                const pengeluaransResponse = await axios.get('/api/Pengeluaran');
                pengeluaransData = pengeluaransResponse.data.data || pengeluaransResponse.data;
            } catch (err) {
                console.warn("Could not fetch expenses, using empty array");
            }
            
            // Fetch donation stats
            const donationResponse = await axios.get('/api/donations');
            const donations = donationResponse.data || [];
            
            // Calculate total donation
            const totalDonation = donations
                .filter(d => d.status === 'Diterima')
                .reduce((sum, donation) => sum + parseInt(donation.jumlah || 0), 0);
            
            // Calculate total expense
            const totalExpense = pengeluaransData.reduce((sum, expense) => 
                sum + parseInt(expense.jumlah || 0), 0);
            
            // Calculate balance
            const balance = totalDonation - totalExpense;
            
            // Group expenses by project
            const expensesByProject = {};
            pengeluaransData.forEach(expense => {
                const projectId = expense.proyek_id;
                if (!expensesByProject[projectId]) {
                    expensesByProject[projectId] = [];
                }
                expensesByProject[projectId].push(expense);
            });
            
            // Enhance projects with expense data
            const enhancedProyeks = proyeksData.map(proyek => {
                const projectExpenses = expensesByProject[proyek.proyek_id] || [];
                const totalProjectExpense = projectExpenses.reduce(
                    (sum, expense) => sum + parseInt(expense.jumlah || 0), 0
                );
                
                return {
                    ...proyek,
                    expenses: projectExpenses,
                    totalExpense: totalProjectExpense,
                    progress: Math.min(100, Math.round((totalProjectExpense / parseInt(proyek.target_dana || 1)) * 100))
                };
            });
            
            setProyeks(enhancedProyeks);
            setStats({
                totalDonation,
                totalExpense,
                balance,
                totalProjects: proyeksData.length
            });
            
            setLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setLoading(false);
        }
    };

    // Helper function to format currency
    const formatCurrency = (value) => {
        if (!value && value !== 0) return "Rp 0";
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
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

    // Function to scroll the projects horizontally
    const scrollProjects = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative">
            {/* Hero Section */}
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
                            className="px-6 py-3 bg-[#59B997] hover:bg-[#4ca584] text-white rounded-lg transition duration-300"
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
            
            {/* Statistics Section */}
            <div className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-5 lg:px-15">
                <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Statistik Donasi</h2>
                <p className="text-gray-600">
                    Transparansi penggunaan dana donasi untuk pembangunan masjid
                </p>
                </div>

                {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#59B997]"></div>
                </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-10">
                    {[
                    {
                        title: "Total Donasi",
                        color: "green",
                        bg: "bg-green-100",
                        text: "text-green-600",
                        value: stats.totalDonation,
                        isCurrency: true,
                        desc: "Jumlah keseluruhan dana yang telah diterima",
                        iconPath: (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                        ),
                    },
                    {
                        title: "Dana Dialokasikan",
                        color: "red",
                        bg: "bg-red-100",
                        text: "text-red-600",
                        value: stats.totalExpense,
                        isCurrency: true,
                        desc: "Dana yang telah digunakan untuk pembangunan",
                        iconPath: (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                        />
                        ),
                    },
                    {
                        title: "Dana Belum Dialokasikan",
                        color: "blue",
                        bg: "bg-blue-100",
                        text: "text-blue-600",
                        value: stats.balance,
                        isCurrency: true,
                        desc: "Dana yang masih tersedia untuk dialokasikan",
                        iconPath: (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                        ),
                    },
                    {
                        title: "Total Proyek",
                        color: "purple",
                        bg: "bg-purple-100",
                        text: "text-purple-600",
                        value: stats.totalProjects,
                        isCurrency: false,
                        desc: "Jumlah proyek pembangunan yang sedang berjalan",
                        iconPath: (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                        ),
                    },
                    ].map((item, idx) => (
                    <div
                        key={idx}
                        className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 flex flex-col justify-between min-h-[140px]"
                    >
                        <div className="flex items-center mb-4">
                        <div
                            className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center mr-3`}
                        >
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-6 w-6 ${item.text}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            >
                            {item.iconPath}
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-700">{item.title}</h3>
                        </div>
                        <div>
                        <p className="text-2xl font-bold text-gray-800 truncate whitespace-nowrap">
                            {item.isCurrency ? formatCurrency(item.value) : item.value}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">{item.desc}</p>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
            </div>
            
            {/* Projects Section */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-5 lg:px-15">
                    <div className="mb-10 flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Proyek Pembangunan</h2>
                            <p className="text-gray-600">Proyek pembangunan masjid yang sedang berjalan</p>
                        </div>
                        <Link 
                            to="/DistribusiDanaProyek" 
                            className="text-[#59B997] hover:text-[#4ca584] font-medium flex items-center group"
                        >
                            Lihat Semua
                            <FontAwesomeIcon 
                                icon={faArrowRight} 
                                className="ml-2 transform group-hover:translate-x-1 transition-transform" 
                            />
                        </Link>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#59B997]"></div>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Scroll Buttons */}
                            <button 
                                onClick={() => scrollProjects('left')} 
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 bg-white rounded-full p-3 shadow-md hover:bg-gray-100"
                                aria-label="Scroll left"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            
                            <div 
                                ref={scrollRef}
                                className="flex overflow-x-auto pb-6 hide-scrollbar snap-x snap-mandatory"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {proyeks
                                    // Include all projects and sort by progress from highest to lowest
                                    .sort((a, b) => b.progress - a.progress)
                                    .slice(0, Math.min(5, proyeks.length))
                                    .map((proyek) => (
                                    <div 
                                        key={proyek.proyek_id} 
                                        className="min-w-[300px] max-w-[300px] mr-6 flex-shrink-0 snap-start"
                                    >
                                        <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
                                            {/* Project Image */}
                                            <div className="h-40 w-full overflow-hidden">
                                                <img 
                                                    src={proyek.gambar ? `/storage/${proyek.gambar}` : '/img/logo-app.jpg'} 
                                                    alt={proyek.nama_item} 
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = '/img/logo-app.jpg';
                                                    }}
                                                />
                                            </div>
                                            
                                            {/* Project Details */}
                                            <div className="p-5 flex-grow flex flex-col">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">{proyek.nama_item}</h3>
                                                <p className="text-gray-600 mb-4 text-sm line-clamp-2 flex-grow">{proyek.deskripsi}</p>
                                                
                                                {/* Progress Bar */}
                                                <div className="mt-auto">
                                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                        <span>Progress Pendanaan</span>
                                                        <span>{proyek.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${
                                                                proyek.progress >= 100 ? 'bg-green-500' : 'bg-[#59B997]'
                                                            }`}
                                                            style={{ width: `${proyek.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                                                        <span>Target: {formatCurrency(proyek.target_dana)}</span>
                                                        <span>Terkumpul: {formatCurrency(proyek.totalExpense)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* "See More" card at the end */}
                                <div className="min-w-[300px] max-w-[300px] mr-6 flex-shrink-0 snap-start bg-gradient-to-br from-[#59B997] to-[#3a9b7d] rounded-xl shadow-sm overflow-hidden flex items-center justify-center">
                                    <Link 
                                        to="/distribusi-dana-proyek"
                                        className="p-8 text-center w-full h-full flex flex-col items-center justify-center"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                                            <FontAwesomeIcon 
                                                icon={faArrowRight} 
                                                className="text-white text-2xl" 
                                            />
                                        </div>
                                        <h3 className="text-white font-bold text-xl mb-2">Lihat Selengkapnya</h3>
                                        <p className="text-white/80 text-sm">Temukan lebih banyak proyek pembangunan masjid</p>
                                    </Link>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => scrollProjects('right')} 
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 bg-white rounded-full p-3 shadow-md hover:bg-gray-100"
                                aria-label="Scroll right"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                    
                    {/* Mobile "See More" button */}
                    <div className="mt-8 text-center md:hidden">
                        <Link 
                            to="/DistribusiDanaProyek" 
                            className="inline-block px-6 py-3 bg-[#59B997] hover:bg-[#4ca584] text-white font-medium rounded-lg transition-colors"
                        >
                            Lihat Semua Proyek
                        </Link>
                    </div>
                </div>
            </div>

            {/* Add custom styles for hiding scrollbar */}
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

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
