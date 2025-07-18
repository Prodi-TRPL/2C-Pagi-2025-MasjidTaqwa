import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserPermissions, hasPermission, getPermissionDeniedMessage, checkGlobalDonationStatus } from "../../utils/permissions";
import AccessDeniedModal from "../ui/AccessDeniedModal";
import SpaceWave from './SpaceWave';
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
// Import the new components
import StatisticsSection from './StatisticsSection';
import ProjectsSection from './ProjectsSection';

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
                            src="../img/masjidtaqwamuhammadiyah.png"  // Ganti dengan path gambar kamu
                            alt="Masjid Taqwa"
                            className="w-[400px] h-auto object-contain mx-auto"
                            draggable={false}
                        />
                    </div>
                </div>
            </div>

            {/* Statistics Section - Now using the component */}
            <StatisticsSection 
                stats={stats} 
                loading={loading} 
                formatCurrency={formatCurrency} 
            />

            {/* Space Wave Background */}
            <div className="relative z-0 bg-white"> 
                <SpaceWave variant="wave3" />
            </div>

            {/* Projects Section - Now using the component */}
            <ProjectsSection 
                proyeks={proyeks} 
                loading={loading} 
                formatCurrency={formatCurrency} 
                scrollRef={scrollRef}
            />

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
