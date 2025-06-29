import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavbarBaru from '../components/LandingPage/NavbarBaru'; 
import DonationFirstPage from "../components/LandingPage/DonationFirstPage";
import { SimpleFooter } from '../components/LandingPage/SimpleFooter';
import { getUserPermissions, hasPermission, getPermissionDeniedMessage, checkGlobalDonationStatus } from "../utils/permissions";
import AccessDeniedModal from "../components/ui/AccessDeniedModal";

const DonasiSekarang = () => {
    const [permissions, setPermissions] = useState(null);
    const [permissionChecked, setPermissionChecked] = useState(false);
    const [globalDonationStatus, setGlobalDonationStatus] = useState({ is_active: true, message: null });
    const [accessDeniedModal, setAccessDeniedModal] = useState({
        show: false,
        title: "",
        message: "",
        icon: "warning"
    });
    const navigate = useNavigate();
    const location = useLocation();

    // Effect to check permissions and global donation status
    useEffect(() => {
        // Check global donation status regardless of login
        fetchDonationStatus();
        
        // Only check permissions if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
            checkPermission();
        } else {
            setPermissionChecked(true);
        }
    }, []);

    // Function to check global donation status
    const fetchDonationStatus = async () => {
        try {
            const status = await checkGlobalDonationStatus();
            setGlobalDonationStatus(status);
            
            // If donation is not active globally, show denial message
            if (!status.is_active) {
                setAccessDeniedModal({
                    show: true,
                    title: status.message?.type === 'error' ? 'Donasi Ditolak' :
                           status.message?.type === 'info' ? 'Informasi Donasi' : 'Donasi Tidak Tersedia',
                    message: status.message?.message || 'Sistem donasi sedang tidak aktif. Silakan coba lagi nanti.',
                    icon: status.message?.type || 'warning'
                });
            }
        } catch (error) {
            console.error('Error checking global donation status:', error);
        }
    };

    const checkPermission = async () => {
        try {
            const userPermissions = await getUserPermissions();
            setPermissions(userPermissions);
            
            // Check if user has the required permission
            if (!hasPermission(userPermissions, 'canDonate')) {
                // Show access denied modal
                const { title, message } = getPermissionDeniedMessage('canDonate');
                setAccessDeniedModal({
                    show: true,
                    title,
                    message,
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('Error checking permissions:', error);
        } finally {
            setPermissionChecked(true);
        }
    };

    // Function to close the access denial modal
    const closeAccessDeniedModal = () => {
        setAccessDeniedModal({ ...accessDeniedModal, show: false });
        navigate('/');
    };

    // If user is logged in and doesn't have permission, don't render donation content
    const renderContent = () => {
        // If global donation is disabled, don't render donation content
        if (!globalDonationStatus.is_active) {
            return null;
        }
        
        // If we're still checking permissions or user is not logged in, show the donation page
        if (!permissionChecked || !localStorage.getItem('token')) {
            return <DonationFirstPage title="Donasi Sekarang" />;
        }
        
        // Check if logged in user has permission
        if (permissions && !permissions.canDonate) {
            return null; // Don't render donation content
        }
        
        // User has permission, show donation page
        return <DonationFirstPage title="Donasi Sekarang" />;
    };

    return (
        <div className="pt-16 relative">
            {/* Navbar */}
            <div className="relative z-20">
                <NavbarBaru />
            </div>
            
            {/* Hero Section */}
            <div className="relative z-5">
                {renderContent()}
            </div>
            
            {/* Footer */}
            <div className="relative z-10">
                <SimpleFooter />
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

export default DonasiSekarang;
