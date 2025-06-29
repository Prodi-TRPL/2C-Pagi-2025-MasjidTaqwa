import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEdit,
  faCheckCircle,
  faTimesCircle,
  faSync,
  faUserCog,
  faToggleOn,
  faToggleOff,
  faUsers,
  faUserShield,
  faUserEdit,
  faIdCard,
  faSave,
  faCalendarAlt,
  faCoins,
  faExclamationTriangle,
  faInfoCircle,
  faBan,
  faGlobe,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function KelolaAksesDonatur() {
  // State for global donation settings
  const [donationSettings, setDonationSettings] = useState({
    is_donation_active: true,
    donation_end_date: null,
    donation_target: 0,
    message_type: "warning",
    denial_message: "Donasi saat ini tidak tersedia. Silakan coba lagi nanti.",
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [donationStats, setDonationStats] = useState({
    total_donations: 0,
    progress_percentage: 0,
    is_active: true,
  });
  const [displayTarget, setDisplayTarget] = useState("");
  
  // State for donors data
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // State for selected donor and modal
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // State for toast notifications
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" // success, error, warning
  });

  // State for donor stats
  const [stats, setStats] = useState({
    totalDonors: 0,
    activeDonors: 0,
    inactiveDonors: 0,
    permissionChanges: 0
  });

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleLogin();
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch donors data
  const fetchDonors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const headers = getAuthHeaders();
      if (!headers) return;
      
      // Fetch donors data from API
      const response = await axios.get('/api/donor-permissions', { headers });
      
      if (response.data && response.data.donors) {
        // Format the donor data to match our expected structure
        const formattedDonors = response.data.donors.map(donor => ({
          ...donor,
          permissions: {
            can_donate: donor.can_donate === 1 || donor.can_donate === true,
            can_view_history: donor.can_view_history === 1 || donor.can_view_history === true,
            can_view_notification: donor.can_view_notification === 1 || donor.can_view_notification === true
          }
        }));
        
        setDonors(formattedDonors);
        setFilteredDonors(formattedDonors);
        
        // Set stats from API response
        if (response.data.stats) {
          setStats({
            ...stats,
            totalDonors: response.data.stats.totalDonors,
            activeDonors: response.data.stats.activeDonors,
            inactiveDonors: response.data.stats.inactiveDonors,
            permissionChanges: response.data.stats.permissionChanges || 0
          });
        } else {
          // Calculate stats if not provided by API
          const activeDonors = formattedDonors.filter(d => d.can_donate).length;
          setStats({
            ...stats,
            totalDonors: formattedDonors.length,
            activeDonors: activeDonors,
            inactiveDonors: formattedDonors.length - activeDonors
          });
        }
      }
    } catch (error) {
      console.error("Error fetching donors:", error);
      setError("Gagal memuat data donatur. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };
  
  // Apply search filter to donors
  const filterDonors = () => {
    if (!searchTerm.trim()) {
      setFilteredDonors(donors);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const results = donors.filter(donor => 
      donor.nama.toLowerCase().includes(lowerSearchTerm) || 
      donor.email.toLowerCase().includes(lowerSearchTerm)
    );
    
    setFilteredDonors(results);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Open edit modal for a donor
  const handleEditDonor = (donor) => {
    setSelectedDonor({...donor});
    setShowEditModal(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedDonor(null);
  };

  // Handle permission toggle
  const handlePermissionChange = (permission) => {
    if (!selectedDonor) return;
    
    // Check if this is revoking a permission
    const isRevoking = selectedDonor.permissions[permission] === true;
    
    // If revoking, show confirmation dialog
    if (isRevoking) {
      const confirmMessage = `Anda akan mencabut hak akses "${
        permission === 'can_donate' ? 'Donasi' : 
        permission === 'can_view_history' ? 'Riwayat Transaksi' : 'Notifikasi'
      }" dari donatur ini.
      
Jika donatur sedang online, mereka akan otomatis keluar dari sistem.

Apakah Anda yakin ingin melanjutkan?`;
      
      // Show confirmation dialog
      if (!window.confirm(confirmMessage)) {
        return; // Cancel if user clicks "Cancel"
      }
    }
    
    // Update permission if confirmed or if granting permission
    setSelectedDonor({
      ...selectedDonor,
      permissions: {
        ...selectedDonor.permissions,
        [permission]: !selectedDonor.permissions[permission]
      }
    });
  };

  // Show toast message
  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type
    });
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Save donor permissions
  const handleSavePermissions = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      // Check if any permissions are being revoked
      const isRevokingPermissions = 
        (selectedDonor.can_donate && !selectedDonor.permissions.can_donate) ||
        (selectedDonor.can_view_history && !selectedDonor.permissions.can_view_history) ||
        (selectedDonor.can_view_notification && !selectedDonor.permissions.can_view_notification);
      
      // Send updated permissions to API
      await axios.put(`/api/donor-permissions/${selectedDonor.pengguna_id}`, {
        can_donate: selectedDonor.permissions.can_donate,
        can_view_history: selectedDonor.permissions.can_view_history,
        can_view_notification: selectedDonor.permissions.can_view_notification
      }, { headers });
      
      // Update local state with new permissions
      const updatedDonors = donors.map(donor => 
        donor.pengguna_id === selectedDonor.pengguna_id 
          ? {
              ...donor,
              can_donate: selectedDonor.permissions.can_donate,
              can_view_history: selectedDonor.permissions.can_view_history,
              can_view_notification: selectedDonor.permissions.can_view_notification,
              permissions: selectedDonor.permissions
            } 
          : donor
      );
      
      setDonors(updatedDonors);
      setFilteredDonors(updatedDonors.filter(donor => {
        if (!searchTerm) return true;
        const lowerSearchTerm = searchTerm.toLowerCase();
        return donor.nama.toLowerCase().includes(lowerSearchTerm) || 
               donor.email.toLowerCase().includes(lowerSearchTerm);
      }));
      
      // Update stats
      const activeDonors = updatedDonors.filter(d => d.permissions.can_donate).length;
      setStats(prev => ({
        ...prev,
        activeDonors: activeDonors,
        inactiveDonors: updatedDonors.length - activeDonors,
        permissionChanges: prev.permissionChanges + 1
      }));
      
      // Show appropriate success toast
      if (isRevokingPermissions) {
        showToast(
          `Hak akses donatur berhasil diperbarui. Jika donatur sedang online, mereka akan otomatis keluar dari sistem.`, 
          "warning"
        );
      } else {
        showToast("Hak akses donatur berhasil diperbarui", "success");
      }
      
      // Close modal
      closeEditModal();
    } catch (error) {
      console.error("Error updating donor permissions:", error);
      
      // Show error toast
      showToast("Gagal memperbarui hak akses donatur", "error");
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchDonors();
    showToast("Data donatur berhasil diperbarui", "success");
  };

  // Handle login redirect
  const handleLogin = () => {
    window.location.href = "/login";
  };

  // Pagination logic
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDonors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDonors.length / itemsPerPage);

  // Function to fetch donation settings
  const fetchDonationSettings = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.get("/api/donation-settings", { headers });
      const { settings, donation_status } = response.data;

      setDonationSettings(settings);
      setDonationStats(donation_status);
      
      // Format the display value for donation target
      if (settings.donation_target) {
        // Use the same formatting approach as handleTargetAmountChange
        const numericValue = String(settings.donation_target);
        setDisplayTarget(numericValue ? numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "");
      }
      
      setLoadingSettings(false);
    } catch (error) {
      console.error("Error fetching donation settings:", error);
      if (error.response?.status === 401) {
        setToast({
          show: true,
          message: "Sesi login telah berakhir. Silakan login kembali.",
          type: "error",
        });
      } else {
        setToast({
          show: true,
          message: "Gagal mengambil pengaturan donasi. Silakan coba lagi.",
          type: "error",
        });
      }
    }
  };

  // Function to save donation settings
  const saveDonationSettings = async () => {
    try {
      setSavingSettings(true);
      const headers = getAuthHeaders();
      if (!headers) return;

      // Parse target amount from display value
      let targetAmount = null;
      if (displayTarget) {
        targetAmount = parseFloat(displayTarget.replace(/\./g, ""));
      }

      const updatedSettings = {
        ...donationSettings,
        donation_target: targetAmount,
      };

      const response = await axios.put(
        "/api/donation-settings",
        updatedSettings,
        { headers }
      );

      const { settings, donation_status } = response.data;
      setDonationSettings(settings);
      setDonationStats(donation_status);

      setToast({
        show: true,
        message: "Pengaturan donasi berhasil disimpan.",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving donation settings:", error);
      if (error.response?.status === 401) {
        setToast({
          show: true,
          message: "Sesi login telah berakhir. Silakan login kembali.",
          type: "error",
        });
      } else {
        setToast({
          show: true,
          message:
            "Gagal menyimpan pengaturan donasi: " +
            (error.response?.data?.message || error.message),
          type: "error",
        });
      }
    } finally {
      setSavingSettings(false);
    }
  };

  // Function to handle toggle donation active state
  const handleToggleDonationActive = () => {
    setDonationSettings({
      ...donationSettings,
      is_donation_active: !donationSettings.is_donation_active,
    });
  };

  // Function to handle date change
  const handleEndDateChange = (date) => {
    setDonationSettings({
      ...donationSettings,
      donation_end_date: date,
    });
  };

  // Function to handle target amount change
  const handleTargetAmountChange = (e) => {
    const value = e.target.value;
    
    // Remove any non-digit characters from the input
    const numericValue = value.replace(/\D/g, "");
    
    // Just set the raw numeric value without formatting during input
    setDisplayTarget(numericValue ? numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "");
  };

  // Function to handle message type change
  const handleMessageTypeChange = (e) => {
    setDonationSettings({
      ...donationSettings,
      message_type: e.target.value,
    });
  };

  // Function to handle denial message change
  const handleDenialMessageChange = (e) => {
    setDonationSettings({
      ...donationSettings,
      denial_message: e.target.value,
    });
  };

  // Format currency with Indonesian format
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "Rp 0";
    
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Effect to fetch donors on component mount
  useEffect(() => {
    fetchDonors();
  }, []);
  
  // Effect to apply filters when search term changes
  useEffect(() => {
    filterDonors();
  }, [searchTerm, donors]);

  // Update useEffect to fetch donation settings
  useEffect(() => {
    fetchDonationSettings();
  }, []);

  // Loading skeleton for the table
  const TableSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );

  // Get status badge for permissions
  const getStatusBadge = (isEnabled) => {
    return isEnabled
      ? { icon: faCheckCircle, className: "bg-green-100 text-green-600", text: "Aktif" }
      : { icon: faTimesCircle, className: "bg-red-100 text-red-600", text: "Nonaktif" };
  };

  // Stat card component
  const StatCard = ({ icon, title, value, color }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className={`h-1 ${color}`}></div>
      <div className="p-4">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${color.replace('bg-', 'bg-').replace('-500', '-100')} mr-4`}>
            <FontAwesomeIcon icon={icon} className={color.replace('bg-', 'text-')} size="lg" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm">{title}</h3>
            <p className="font-bold text-gray-800 text-xl">{value}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <div className="p-2 bg-[#59B997]/10 rounded-full mr-3">
                <FontAwesomeIcon icon={faUserShield} className="text-[#59B997]" />
              </div>
              Kelola Akses Donatur
            </h1>
            <p className="text-sm text-gray-500 mt-1 ml-1">Atur pengaturan global donasi dan kelola izin akses donatur</p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={fetchDonationSettings}
              className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
              title="Muat ulang pengaturan"
              disabled={loadingSettings}
            >
              <FontAwesomeIcon
                icon={faSync}
                className={loadingSettings ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={saveDonationSettings}
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
                savingSettings 
                  ? "bg-[#59B997]/70 cursor-not-allowed"
                  : "bg-[#59B997] hover:bg-[#59B997]/80"
              }`}
              disabled={savingSettings || loadingSettings}
            >
              {savingSettings ? (
                <FontAwesomeIcon icon={faSync} className="animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faSave} />
              )}
              <span>Simpan Pengaturan</span>
            </button>
          </motion.div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast.show && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg shadow-md ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border-l-4 border-green-500"
              : "bg-red-50 text-red-700 border-l-4 border-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <div className="flex items-center">
              <div className="p-1 bg-green-100 rounded-full mr-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
              </div>
              <span>{toast.message}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="p-1 bg-red-100 rounded-full mr-3">
                <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />
              </div>
              <span>{toast.message}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Global Donation Settings Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FontAwesomeIcon icon={faGlobe} className="mr-2 text-[#59B997]" />
            Pengaturan Global Donasi
          </h2>
        </div>

        {loadingSettings ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Donation Status Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 ${
                  donationStats.is_active 
                    ? "border-green-500" 
                    : "border-red-500"
                }`}
              >
                <p className="text-sm text-gray-500 mb-2">Status Donasi Sistem</p>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mr-2 ${
                    donationStats.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${
                      donationStats.is_active ? "bg-green-500 animate-pulse" : "bg-red-500"
                    } mr-2`}></span>
                    {donationStats.is_active ? "Aktif" : "Tidak Aktif"}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {donationStats.is_active
                      ? "Donasi dapat dilakukan"
                      : "Donasi tidak tersedia"}
                  </span>
                </div>
              </motion.div>

              {/* Total Donations Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500"
              >
                <p className="text-sm text-gray-500 mb-2">Total Donasi Terkumpul</p>
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100 mr-3">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-blue-500" />
                  </div>
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(donationStats.total_donations)}</div>
                </div>
              </motion.div>

              {/* Target Progress Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-[#59B997]"
              >
                <p className="text-sm text-gray-500 mb-2">
                  Target Dana{" "}
                  {donationSettings.donation_target
                    ? `(${formatCurrency(donationSettings.donation_target)})`
                    : "(Belum diatur)"}
                </p>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="font-medium">Progress</span>
                    <span className="font-bold">{donationStats.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${donationStats.progress_percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-[#59B997] h-2.5 rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Settings Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Manual Control Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-[#59B997]"
              >
                <h3 className="font-medium text-gray-900 mb-5 flex items-center">
                  <div className="p-2 bg-[#59B997]/10 rounded-full mr-2">
                    <FontAwesomeIcon icon={faUserCog} className="text-[#59B997]" />
                  </div>
                  <span>Pengaturan Manual</span>
                </h3>
                
                <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-medium text-gray-700">Status Donasi</p>
                    <p className="text-sm text-gray-500">
                      {donationSettings.is_donation_active
                        ? "Donasi saat ini diaktifkan secara manual"
                        : "Donasi saat ini dinonaktifkan secara manual"}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleDonationActive}
                    className={`text-3xl focus:outline-none transform transition-transform hover:scale-105 ${
                      donationSettings.is_donation_active 
                        ? "text-green-500 hover:text-green-600" 
                        : "text-gray-400 hover:text-gray-500"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={donationSettings.is_donation_active ? faToggleOn : faToggleOff}
                    />
                  </button>
                </div>
                
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-[#59B997]" />
                    <span>Tanggal Berakhir Donasi</span>
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={donationSettings.donation_end_date ? new Date(donationSettings.donation_end_date) : null}
                      onChange={handleEndDateChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#59B997] focus:border-[#59B997] transition-all"
                      placeholderText="Pilih tanggal berakhir (opsional)"
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                      isClearable
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 flex items-center">
                    {donationSettings.donation_end_date ? (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                        Donasi akan otomatis dinonaktifkan setelah {new Date(donationSettings.donation_end_date).toLocaleDateString("id-ID")}
                      </>
                    ) : (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-300 mr-1"></span>
                        Tidak ada batasan tanggal
                      </>
                    )}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FontAwesomeIcon icon={faCoins} className="mr-2 text-[#59B997]" />
                    <span>Target Dana</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={displayTarget}
                      onChange={handleTargetAmountChange}
                      className="pl-9 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#59B997] focus:border-[#59B997] transition-all"
                      placeholder="Masukkan target dana (opsional)"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 flex items-center">
                    {displayTarget ? (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                        Donasi akan otomatis dinonaktifkan setelah mencapai {formatCurrency(displayTarget.replace(/\./g, ""))}
                      </>
                    ) : (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-300 mr-1"></span>
                        Tidak ada batasan target dana
                      </>
                    )}
                  </p>
                </div>
              </motion.div>

              {/* Message Configuration Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                  <div className="p-2 bg-[#59B997]/10 rounded-full mr-2">
                    <FontAwesomeIcon icon={faUserCog} className="text-[#59B997]" />
                  </div>
                  <span>Konfigurasi Pesan Penolakan</span>
                </h3>
                
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Kategori Pesan
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="inline-flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 relative overflow-hidden group
                      ${donationSettings.message_type === 'warning' ? 'border-amber-300 bg-amber-50' : 'border-gray-200'}">
                      <input
                        type="radio"
                        name="messageType"
                        value="warning"
                        checked={donationSettings.message_type === "warning"}
                        onChange={handleMessageTypeChange}
                        className="text-amber-500 focus:ring-amber-500 absolute opacity-0"
                      />
                      <span className={`flex items-center ${donationSettings.message_type === 'warning' ? 'text-amber-700' : 'text-gray-700'}`}>
                        <span className={`w-5 h-5 mr-2 rounded-full flex items-center justify-center ${donationSettings.message_type === 'warning' ? 'bg-amber-100' : 'bg-gray-100'}`}>
                          <FontAwesomeIcon icon={faExclamationTriangle} className={`${donationSettings.message_type === 'warning' ? 'text-amber-500' : 'text-gray-400'}`} size="xs" />
                        </span>
                        <span className="font-medium">Peringatan</span>
                      </span>
                      <span className={`absolute inset-0 border-2 rounded-lg scale-105 opacity-0 transition-opacity ${donationSettings.message_type === 'warning' ? 'border-amber-300 group-hover:opacity-100' : 'border-gray-300 group-hover:opacity-50'}`}></span>
                    </label>
                    
                    <label className="inline-flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 relative overflow-hidden group
                      ${donationSettings.message_type === 'info' ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}">
                      <input
                        type="radio"
                        name="messageType"
                        value="info"
                        checked={donationSettings.message_type === "info"}
                        onChange={handleMessageTypeChange}
                        className="text-blue-500 focus:ring-blue-500 absolute opacity-0"
                      />
                      <span className={`flex items-center ${donationSettings.message_type === 'info' ? 'text-blue-700' : 'text-gray-700'}`}>
                        <span className={`w-5 h-5 mr-2 rounded-full flex items-center justify-center ${donationSettings.message_type === 'info' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <FontAwesomeIcon icon={faInfoCircle} className={`${donationSettings.message_type === 'info' ? 'text-blue-500' : 'text-gray-400'}`} size="xs" />
                        </span>
                        <span className="font-medium">Informasi</span>
                      </span>
                      <span className={`absolute inset-0 border-2 rounded-lg scale-105 opacity-0 transition-opacity ${donationSettings.message_type === 'info' ? 'border-blue-300 group-hover:opacity-100' : 'border-gray-300 group-hover:opacity-50'}`}></span>
                    </label>
                    
                    <label className="inline-flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 relative overflow-hidden group
                      ${donationSettings.message_type === 'error' ? 'border-red-300 bg-red-50' : 'border-gray-200'}">
                      <input
                        type="radio"
                        name="messageType"
                        value="error"
                        checked={donationSettings.message_type === "error"}
                        onChange={handleMessageTypeChange}
                        className="text-red-500 focus:ring-red-500 absolute opacity-0"
                      />
                      <span className={`flex items-center ${donationSettings.message_type === 'error' ? 'text-red-700' : 'text-gray-700'}`}>
                        <span className={`w-5 h-5 mr-2 rounded-full flex items-center justify-center ${donationSettings.message_type === 'error' ? 'bg-red-100' : 'bg-gray-100'}`}>
                          <FontAwesomeIcon icon={faBan} className={`${donationSettings.message_type === 'error' ? 'text-red-500' : 'text-gray-400'}`} size="xs" />
                        </span>
                        <span className="font-medium">Penolakan</span>
                      </span>
                      <span className={`absolute inset-0 border-2 rounded-lg scale-105 opacity-0 transition-opacity ${donationSettings.message_type === 'error' ? 'border-red-300 group-hover:opacity-100' : 'border-gray-300 group-hover:opacity-50'}`}></span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className={`mr-2 ${
                      donationSettings.message_type === "warning" ? "text-amber-500" :
                      donationSettings.message_type === "info" ? "text-blue-500" : 
                      "text-red-500"
                    }`} />
                    Pesan Saat Donasi Tidak Aktif
                  </label>
                  <div className="relative">
                    <textarea
                      value={donationSettings.denial_message}
                      onChange={handleDenialMessageChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#59B997] focus:border-[#59B997] transition-all"
                      rows={4}
                      placeholder="Masukkan pesan yang akan ditampilkan saat donasi tidak aktif"
                    ></textarea>
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {donationSettings.denial_message.length} karakter
                    </div>
                  </div>
                  
                  <div className="mt-5 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all hover:shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm text-gray-700">Preview Pesan:</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                        {donationSettings.message_type === "warning" ? "Peringatan" :
                         donationSettings.message_type === "info" ? "Informasi" : "Penolakan"}
                      </span>
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-4 rounded-md ${
                        donationSettings.message_type === "warning" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        donationSettings.message_type === "info" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      <div className="flex items-start">
                        <span className="mr-3 p-1 rounded-full bg-white">
                          {donationSettings.message_type === "warning" && <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500" />}
                          {donationSettings.message_type === "info" && <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />}
                          {donationSettings.message_type === "error" && <FontAwesomeIcon icon={faBan} className="text-red-500" />}
                        </span>
                        <span className="text-sm">{donationSettings.denial_message || "Pesan akan ditampilkan di sini"}</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Donor Management Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4 md:mb-0">
            <div className="p-2 bg-[#59B997]/10 rounded-full mr-3">
              <FontAwesomeIcon icon={faUsers} className="text-[#59B997]" />
            </div>
            <span>Manajemen Izin Donatur</span>
          </h2>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none flex items-center justify-center transition-colors shadow-sm"
            >
              <FontAwesomeIcon icon={faSync} className="mr-2" />
              <span>Refresh Data</span>
            </button>
          </motion.div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            icon={faUsers} 
            title="Total Donatur" 
            value={stats.totalDonors}
            color="bg-blue-500"
          />
          <StatCard 
            icon={faCheckCircle} 
            title="Donatur Aktif" 
            value={stats.activeDonors}
            color="bg-green-500"
          />
          <StatCard 
            icon={faTimesCircle} 
            title="Donatur Nonaktif" 
            value={stats.inactiveDonors}
            color="bg-red-500"
          />
          <StatCard 
            icon={faUserEdit} 
            title="Perubahan Hak Akses" 
            value={stats.permissionChanges}
            color="bg-amber-500"
          />
        </div>
        
        {/* Search Controls */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#59B997] focus:border-[#59B997] block w-full pl-10 p-3 transition-all shadow-sm"
                placeholder="Cari donatur berdasarkan nama atau email..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            
            <button
              onClick={handleRefresh}
              className="px-4 py-3 bg-[#59B997]/10 text-[#59B997] rounded-lg hover:bg-[#59B997]/20 focus:outline-none flex items-center justify-center transition-colors"
            >
              <FontAwesomeIcon icon={faSync} className="mr-2" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center shadow-sm"
          >
            <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
            {error}
          </motion.div>
        )}
        
        {/* Donors Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md overflow-hidden mb-6"
        >
          {loading ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800 flex items-center">
                  <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                  Daftar Donatur
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredDonors.length} donatur ditemukan
                </p>
              </div>
              
              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donatur</th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Donasi</th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Riwayat</th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Notifikasi</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.length > 0 ? (
                      currentItems.map((donor, index) => (
                        <tr 
                          key={donor.pengguna_id} 
                          className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faUserCog} className="text-blue-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{donor.nama}</div>
                                <div className="text-sm text-gray-500">{donor.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {(() => {
                              const statusBadge = getStatusBadge(donor.permissions.can_donate);
                              return (
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.className}`}>
                                  <FontAwesomeIcon icon={statusBadge.icon} className="mr-1" />
                                  {statusBadge.text}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {(() => {
                              const statusBadge = getStatusBadge(donor.permissions.can_view_history);
                              return (
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.className}`}>
                                  <FontAwesomeIcon icon={statusBadge.icon} className="mr-1" />
                                  {statusBadge.text}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {(() => {
                              const statusBadge = getStatusBadge(donor.permissions.can_view_notification);
                              return (
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.className}`}>
                                  <FontAwesomeIcon icon={statusBadge.icon} className="mr-1" />
                                  {statusBadge.text}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleEditDonor(donor)}
                              className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                            >
                              <FontAwesomeIcon icon={faEdit} className="mr-1" />
                              Kelola
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          Tidak ada data donatur ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                      Sebelumnya
                    </button>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                      Berikutnya
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> sampai <span className="font-medium">{Math.min(indexOfLastItem, filteredDonors.length)}</span> dari <span className="font-medium">{filteredDonors.length}</span> data
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">Previous</span>
                          &larr;
                        </button>
                        
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => paginate(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNumber
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">Next</span>
                          &rarr;
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
        
        {/* Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
              <FontAwesomeIcon icon={faIdCard} className="text-blue-600" size="lg" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-800">Tentang Kelola Akses Donatur</h3>
              <p className="mt-1 text-sm text-blue-700">
                Halaman ini memungkinkan administrator untuk mengatur hak akses donatur dalam aplikasi.
                Anda dapat mengaktifkan atau menonaktifkan kemampuan donatur untuk melakukan donasi,
                melihat riwayat transaksi, dan menerima notifikasi.
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Edit Permissions Modal */}
        {showEditModal && selectedDonor && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Kelola Hak Akses Donatur</h3>
                <button 
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  &times;
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="px-6 py-4">
                {/* Donor Info */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 uppercase mb-2 flex items-center">
                    <span className="w-1 h-4 bg-[#59B997] rounded-full mr-2"></span>
                    Informasi Donatur
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUserCog} className="text-blue-500" size="lg" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{selectedDonor.nama}</div>
                        <div className="text-sm text-gray-500">{selectedDonor.email}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">ID Pengguna</div>
                    <div className="text-sm text-gray-900">{selectedDonor.pengguna_id}</div>
                  </div>
                </div>
                
                {/* Permissions */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 uppercase mb-2 flex items-center">
                    <span className="w-1 h-4 bg-[#59B997] rounded-full mr-2"></span>
                    Hak Akses
                  </h4>
                  <div className="space-y-4">
                    {/* Donate Permission */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Donasi</div>
                        <div className="text-sm text-gray-500">Kemampuan untuk melakukan donasi</div>
                      </div>
                      <button 
                        onClick={() => handlePermissionChange('can_donate')}
                        className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 focus:outline-none shadow ${
                          selectedDonor.permissions.can_donate ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'
                        }`}
                      >
                        <span className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                          selectedDonor.permissions.can_donate ? 'translate-x-0' : '-translate-x-1'
                        }`}></span>
                      </button>
                    </div>
                    
                    {/* View History Permission */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Riwayat Transaksi</div>
                        <div className="text-sm text-gray-500">Akses untuk melihat riwayat transaksi</div>
                      </div>
                      <button 
                        onClick={() => handlePermissionChange('can_view_history')}
                        className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 focus:outline-none shadow ${
                          selectedDonor.permissions.can_view_history ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'
                        }`}
                      >
                        <span className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                          selectedDonor.permissions.can_view_history ? 'translate-x-0' : '-translate-x-1'
                        }`}></span>
                      </button>
                    </div>
                    
                    {/* View Notification Permission */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Notifikasi</div>
                        <div className="text-sm text-gray-500">Akses untuk melihat notifikasi</div>
                      </div>
                      <button 
                        onClick={() => handlePermissionChange('can_view_notification')}
                        className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 focus:outline-none shadow ${
                          selectedDonor.permissions.can_view_notification ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'
                        }`}
                      >
                        <span className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                          selectedDonor.permissions.can_view_notification ? 'translate-x-0' : '-translate-x-1'
                        }`}></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none"
                >
                  Batal
                </button>
                <button
                  onClick={handleSavePermissions}
                  className="px-4 py-2 bg-[#59B997] text-white rounded-md hover:bg-[#4ca584] focus:outline-none"
                >
                  Simpan Perubahan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

