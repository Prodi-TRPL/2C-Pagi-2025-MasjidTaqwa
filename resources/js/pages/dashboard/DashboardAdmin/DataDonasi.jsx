import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, faFilter, faEye, faCheckCircle, 
  faTimesCircle, faExclamationTriangle, faCalendarAlt, 
  faCreditCard, faUser, faMoneyBillWave 
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

export default function DataDonasi() {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [validating, setValidating] = useState(false);
  const itemsPerPage = 10;

  // Format currency to Indonesian Rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date to Indonesian format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const fetchDonations = async () => {
    try {
      setLoading(true);
      
      // This API call is mocked for now, replace with actual endpoint when available
      /* Uncomment when API is ready
      const response = await axios.get('/api/donations');
      setDonations(response.data);
      setFilteredDonations(response.data);
      */
      
      // Dummy data for demonstration
      const dummyDonations = [
        { 
          id: 1, 
          pengguna_id: "6fe76142-716f-492f-a592-4391b770aedc", 
          pengguna: { nama: "Ahmad Fadli", email: "ahmad@example.com", nomor_hp: "081234567890" }, 
          jumlah: 5000000, 
          metode_pembayaran_id: "1", 
          metode_pembayaran: { nama_metode: "Transfer Bank" },
          status: "Diterima", 
          tanggal_donasi: "2025-06-15T14:30:00" 
        },
        { 
          id: 2, 
          pengguna_id: "7fe76142-716f-492f-a592-4391b770aedd", 
          pengguna: { nama: "Siti Nurhaliza", email: "siti@example.com", nomor_hp: "081234567891" }, 
          jumlah: 2500000, 
          metode_pembayaran_id: "3", 
          metode_pembayaran: { nama_metode: "QRIS" },
          status: "Menunggu", 
          tanggal_donasi: "2025-06-14T10:45:00" 
        },
        { 
          id: 3, 
          pengguna_id: "8fe76142-716f-492f-a592-4391b770aedf", 
          pengguna: { nama: "Budi Santoso", email: "budi@example.com", nomor_hp: "081234567892" }, 
          jumlah: 1000000, 
          metode_pembayaran_id: "2", 
          metode_pembayaran: { nama_metode: "E-Wallet" },
          status: "Diterima", 
          tanggal_donasi: "2025-06-12T16:20:00" 
        },
        { 
          id: 4, 
          pengguna_id: "9fe76142-716f-492f-a592-4391b770aedg", 
          pengguna: { nama: "Dewi Fortuna", email: "dewi@example.com", nomor_hp: "081234567893" }, 
          jumlah: 3000000, 
          metode_pembayaran_id: "1", 
          metode_pembayaran: { nama_metode: "Transfer Bank" },
          status: "Menunggu", 
          tanggal_donasi: "2025-06-10T09:15:00" 
        },
        { 
          id: 5, 
          pengguna_id: "10fe76142-716f-492f-a592-4391b770aedh", 
          pengguna: { nama: "Haji Mukhtar", email: "mukhtar@example.com", nomor_hp: "081234567894" }, 
          jumlah: 10000000, 
          metode_pembayaran_id: "1", 
          metode_pembayaran: { nama_metode: "Transfer Bank" },
          status: "Diterima", 
          tanggal_donasi: "2025-06-08T11:30:00" 
        },
        { 
          id: 6, 
          pengguna_id: "11fe76142-716f-492f-a592-4391b770aedi", 
          pengguna: { nama: "Joko Widodo", email: "joko@example.com", nomor_hp: "081234567895" }, 
          jumlah: 500000, 
          metode_pembayaran_id: "2", 
          metode_pembayaran: { nama_metode: "E-Wallet" },
          status: "Kadaluarsa", 
          tanggal_donasi: "2025-06-01T08:20:00" 
        },
        { 
          id: 7, 
          pengguna_id: "12fe76142-716f-492f-a592-4391b770aedj", 
          pengguna: { nama: "Intan Purnama", email: "intan@example.com", nomor_hp: "081234567896" }, 
          jumlah: 1500000, 
          metode_pembayaran_id: "3", 
          metode_pembayaran: { nama_metode: "QRIS" },
          status: "Diterima", 
          tanggal_donasi: "2025-06-05T13:40:00" 
        },
        { 
          id: 8, 
          pengguna_id: "13fe76142-716f-492f-a592-4391b770aedk", 
          pengguna: { nama: "Rudi Hartono", email: "rudi@example.com", nomor_hp: "081234567897" }, 
          jumlah: 2000000, 
          metode_pembayaran_id: "1", 
          metode_pembayaran: { nama_metode: "Transfer Bank" },
          status: "Menunggu", 
          tanggal_donasi: "2025-06-03T17:10:00" 
        }
      ];
      
      setDonations(dummyDonations);
      setFilteredDonations(dummyDonations);
      
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search to donations
  const filterDonations = () => {
    let results = [...donations];
    
    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter(donation => donation.status === statusFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(donation => 
        donation.pengguna?.nama.toLowerCase().includes(lowerSearchTerm) || 
        donation.pengguna?.email.toLowerCase().includes(lowerSearchTerm) ||
        donation.metode_pembayaran?.nama_metode.toLowerCase().includes(lowerSearchTerm) ||
        donation.jumlah.toString().includes(lowerSearchTerm)
      );
    }
    
    setFilteredDonations(results);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // View donation details
  const viewDonationDetails = (donation) => {
    setSelectedDonation(donation);
    setShowDetailModal(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDonation(null);
  };

  // Validate a donation
  const validateDonation = async (id, status) => {
    try {
      setValidating(true);
      
      // In a real application, this would call an API endpoint
      /* Uncomment when API is ready
      await axios.post(`/api/donations/${id}/validate`, { status });
      */
      
      // For now, we'll update the local state to simulate the API call
      setTimeout(() => {
        const updatedDonations = donations.map(donation => {
          if (donation.id === id) {
            return { ...donation, status };
          }
          return donation;
        });
        
        setDonations(updatedDonations);
        setFilteredDonations(updatedDonations.filter(donation => 
          statusFilter === "all" || donation.status === statusFilter
        ));
        
        // Close modal after validation
        if (selectedDonation && selectedDonation.id === id) {
          closeDetailModal();
        }
        
        setValidating(false);
      }, 1000); // Simulate API delay
      
    } catch (error) {
      console.error("Error validating donation:", error);
      setValidating(false);
    }
  };

  // Pagination logic
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDonations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  
  // Effect to fetch donations on component mount
  useEffect(() => {
    fetchDonations();
  }, []);
  
  // Effect to apply filters when status or search term changes
  useEffect(() => {
    filterDonations();
  }, [statusFilter, searchTerm]);

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case "Diterima":
        return {
          icon: faCheckCircle,
          className: "bg-green-100 text-green-600",
          text: "Diterima"
        };
      case "Menunggu":
        return {
          icon: faExclamationTriangle,
          className: "bg-yellow-100 text-yellow-600",
          text: "Menunggu"
        };
      case "Kadaluarsa":
        return {
          icon: faTimesCircle,
          className: "bg-red-100 text-red-600",
          text: "Kadaluarsa"
        };
      default:
        return {
          icon: faExclamationTriangle,
          className: "bg-gray-100 text-gray-600",
          text: status
        };
    }
  };

  // Status filter items
  const statusFilters = [
    { value: "all", label: "Semua Status" },
    { value: "Diterima", label: "Diterima" },
    { value: "Menunggu", label: "Menunggu" },
    { value: "Kadaluarsa", label: "Kadaluarsa" }
  ];

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Data Donasi</h1>
        <p className="text-sm text-gray-500">Kelola dan validasi donasi dari donatur</p>
      </div>
      
      {/* Filter and Search Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Cari donatur atau email..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.value 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handleStatusFilterChange(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Donations Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        {loading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">
                Donasi {statusFilter !== "all" ? `- ${statusFilter}` : ""}
              </h2>
              <p className="text-sm text-gray-500">
                {filteredDonations.length} donasi ditemukan
              </p>
            </div>
            
            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donatur</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((donation) => {
                      const statusBadge = getStatusBadge(donation.status);
                      
                      return (
                        <tr key={donation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <FontAwesomeIcon icon={faUser} className="text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{donation.pengguna?.nama || "Unknown"}</div>
                                <div className="text-sm text-gray-500">{donation.pengguna?.email || "No email"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatRupiah(donation.jumlah)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{donation.metode_pembayaran?.nama_metode || "Unknown"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(donation.tanggal_donasi)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.className}`}>
                              <FontAwesomeIcon icon={statusBadge.icon} className="mr-1" />
                              {statusBadge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => viewDonationDetails(donation)}
                              className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                            >
                              <FontAwesomeIcon icon={faEye} className="mr-1" />
                              Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        Tidak ada data donasi ditemukan
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
                      Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> sampai <span className="font-medium">{Math.min(indexOfLastItem, filteredDonations.length)}</span> dari <span className="font-medium">{filteredDonations.length}</span> data
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
      </div>
      
      {/* Donation Details Modal */}
      {showDetailModal && selectedDonation && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Detail Donasi #{selectedDonation.id}</h3>
              <button 
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-500"
              >
                &times;
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 py-4">
              {/* Donation Info */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Informasi Donasi</h4>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Jumlah</div>
                    <div className="text-lg font-semibold text-gray-900">{formatRupiah(selectedDonation.jumlah)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Status</div>
                    <div className="mt-1">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(selectedDonation.status).className}`}>
                        <FontAwesomeIcon icon={getStatusBadge(selectedDonation.status).icon} className="mr-1" />
                        {getStatusBadge(selectedDonation.status).text}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Metode Pembayaran</div>
                    <div className="flex items-center mt-1">
                      <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-gray-500" />
                      <span className="text-sm text-gray-900">{selectedDonation.metode_pembayaran?.nama_metode || "Unknown"}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Tanggal</div>
                    <div className="flex items-center mt-1">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-500" />
                      <span className="text-sm text-gray-900">{formatDate(selectedDonation.tanggal_donasi)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Donor Info */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Informasi Donatur</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="text-gray-500" size="lg" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{selectedDonation.pengguna?.nama || "Unknown"}</div>
                      <div className="text-sm text-gray-500">{selectedDonation.pengguna?.email || "No email"}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-xs text-gray-500">Nomor Telepon</div>
                      <div className="text-sm text-gray-900">{selectedDonation.pengguna?.nomor_hp || "Tidak tersedia"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">ID Pengguna</div>
                      <div className="text-sm text-gray-900">{selectedDonation.pengguna_id || "Unknown"}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Validation Actions */}
              {selectedDonation.status === "Menunggu" && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Validasi Donasi</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-700 mb-4">
                      Donasi ini sedang menunggu validasi. Silakan verifikasi pembayaran dan perbarui statusnya.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => validateDonation(selectedDonation.id, "Diterima")}
                        disabled={validating}
                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {validating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Memproses...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                            Terima Donasi
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => validateDonation(selectedDonation.id, "Kadaluarsa")}
                        disabled={validating}
                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {validating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Memproses...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                            Tolak Donasi
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeDetailModal}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
