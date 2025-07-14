import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, faEye, faCheckCircle, 
  faCalendarAlt, faCreditCard, faUser, faMoneyBillWave,
  faExclamationTriangle, faIdCard,
  faAngleLeft, faAngleRight
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

export default function DataDonasi() {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);
  
  // Data limit options
  const limitOptions = [10, 20, 50, 100];

  // Format currency to Indonesian Rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date to Indonesian format with Asia/Jakarta timezone
  const formatDate = (dateString) => {
    // Create date object from the UTC date string
    const utcDate = new Date(dateString);
    
    // Format options for Indonesia locale with explicit timezone
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta'
    };
    
    // Format the date with the Indonesia locale and Asia/Jakarta timezone
    return new Intl.DateTimeFormat('id-ID', options).format(utcDate);
  };

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the actual API endpoint
      const response = await axios.get('/api/donations');
      console.log("Donation data:", response.data);
      
      // Don't modify the status here - display exactly what comes from backend
      setDonations(response.data);
      setFilteredDonations(response.data);
    } catch (error) {
      console.error("Error fetching donations:", error);
      setError("Gagal memuat data donasi. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  // Apply search filter to donations
  const filterDonations = () => {
    let results = [...donations];
    
    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(donation => 
        (donation.pengguna?.nama || donation.anonymous_donor?.nama || "Anonymous").toLowerCase().includes(lowerSearchTerm) || 
        (donation.pengguna?.email || donation.anonymous_donor?.email || "").toLowerCase().includes(lowerSearchTerm) ||
        (donation.metode_pembayaran?.nama_metode || donation.payment_method_name || "").toLowerCase().includes(lowerSearchTerm) ||
        donation.jumlah?.toString().includes(lowerSearchTerm) ||
        (donation.payment_type || "").toLowerCase().includes(lowerSearchTerm) ||
        (donation.order_id || "").toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    setFilteredDonations(results);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to page 1 when changing items per page
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
  
  // Effect to apply filters when search term changes
  useEffect(() => {
    filterDonations();
  }, [searchTerm, donations]);

  // Reset to page 1 when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Get status badge style
  const getStatusBadge = (status) => {
    if (status === 'Kadaluarsa') {
        return {
          icon: faExclamationTriangle,
          className: "bg-red-100 text-red-600",
          text: "Kadaluarsa"
        };
    } else {
      return {
        icon: faCheckCircle,
        className: "bg-green-100 text-green-600",
        text: "Diterima"
      };
    }
  };

  // Get donor name and email
  const getDonorInfo = (donation) => {
    if (donation.pengguna_id) {
      return {
        name: donation.pengguna?.nama || (donation.name || "Anonymous"),
        email: donation.pengguna?.email || donation.email || "",
        isRegistered: true
      };
    } else if (donation.pengguna && donation.pengguna.nama) {
      return {
        name: donation.pengguna.nama,
        email: donation.pengguna.email || "",
        isRegistered: true
      };
    } else if (donation.anonymous_donor && donation.anonymous_donor.nama) {
      return {
        name: donation.anonymous_donor.nama,
        email: donation.anonymous_donor.email || "",
        isRegistered: false
      };
    } else {
        return {
        name: donation.name || "Anonymous",
        email: donation.email || "",
        isRegistered: false
        };
    }
  };

  // Get payment method name
  const getPaymentMethod = (donation) => {
    if (donation.payment_method_name) {
      return donation.payment_method_name;
    } else if (donation.payment_type) {
      return donation.payment_type.replace('_', ' ').toUpperCase();
    } else if (donation.snap_token) {
      return "Transfer";
    } else {
      return "Pembayaran Online";
    }
  };

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

  // Render pagination controls
  const renderPagination = () => {
    if (filteredDonations.length <= itemsPerPage) return null;

    return (
      <div className="px-6 py-3 flex flex-wrap items-center justify-between border-t border-gray-200">
        {/* Mobile pagination */}
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
            className={`relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            Berikutnya
          </button>
        </div>
        
        {/* Desktop pagination */}
        <div className="hidden sm:flex-1 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> sampai <span className="font-medium">{Math.min(indexOfLastItem, filteredDonations.length)}</span> dari <span className="font-medium">{filteredDonations.length}</span> data
            </p>
          </div>
          
          <div className="flex items-center mt-2 sm:mt-0">
            {/* Items per page selector */}
            <div className="mr-4">
              <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-600">Tampilkan:</label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {limitOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Pagination controls */}
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                <span className="sr-only">Previous</span>
                <FontAwesomeIcon icon={faAngleLeft} className="h-5 w-5" aria-hidden="true" />
              </button>
              
              {/* Page numbers */}
              {(() => {
                let pages = [];
                const maxVisiblePages = 5;
                
                if (totalPages <= maxVisiblePages) {
                  // Show all pages if total pages are less than or equal to maxVisiblePages
                  pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                } else {
                  // Show a window of pages centered around the current page when possible
                  const leftBound = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  const rightBound = Math.min(totalPages, leftBound + maxVisiblePages - 1);
                  
                  // Adjust leftBound if we're near the end to always show maxVisiblePages
                  const adjustedLeftBound = Math.max(1, rightBound - maxVisiblePages + 1);
                  
                  pages = Array.from(
                    { length: rightBound - adjustedLeftBound + 1 },
                    (_, i) => adjustedLeftBound + i
                  );
                  
                  // Add first page and ellipsis if needed
                  if (adjustedLeftBound > 1) {
                    pages.unshift('ellipsis-start');
                    pages.unshift(1);
                  }
                  
                  // Add last page and ellipsis if needed
                  if (rightBound < totalPages) {
                    pages.push('ellipsis-end');
                    pages.push(totalPages);
                  }
                }
                
                return pages.map((page, index) => {
                  if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                <span className="sr-only">Next</span>
                <FontAwesomeIcon icon={faAngleRight} className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Data Donasi</h1>
        <p className="text-sm text-gray-500">Kelola data donasi dari donatur</p>
      </div>
      
      {/* Search Control */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Cari donatur, email, metode pembayaran, atau ID transaksi..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          {error}
        </div>
      )}
      
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
                Data Donasi
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
                      const donorInfo = getDonorInfo(donation);
                      
                      return (
                        <tr key={donation.donasi_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <FontAwesomeIcon 
                                  icon={donorInfo.isRegistered ? faUser : faIdCard} 
                                  className={donorInfo.isRegistered ? "text-blue-500" : "text-gray-500"} 
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{donorInfo.name}</div>
                                <div className="text-sm text-gray-500">{donorInfo.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatRupiah(donation.jumlah)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{getPaymentMethod(donation)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(donation.created_at)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {(() => {
                                const statusBadge = getStatusBadge(donation.status);
                                return (
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.className}`}>
                              <FontAwesomeIcon icon={statusBadge.icon} className="mr-1" />
                              {statusBadge.text}
                            </span>
                                );
                              })()}
                            </div>
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
            {renderPagination()}
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
              <h3 className="text-lg font-medium text-gray-900">Detail Donasi #{selectedDonation.donasi_id?.substring(0, 8)}</h3>
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
                      {(() => {
                        const statusBadge = getStatusBadge(selectedDonation.status);
                        return (
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.className}`}>
                            <FontAwesomeIcon icon={statusBadge.icon} className="mr-1" />
                            {statusBadge.text}
                      </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Metode Pembayaran</div>
                    <div className="flex items-center mt-1">
                      <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-gray-500" />
                      <span className="text-sm text-gray-900">{getPaymentMethod(selectedDonation)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Tanggal</div>
                    <div className="flex items-center mt-1">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-500" />
                      <span className="text-sm text-gray-900">{formatDate(selectedDonation.created_at)}</span>
                    </div>
                  </div>
                  
                  {selectedDonation.order_id && (
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500">Order ID</div>
                      <div className="text-sm text-gray-900">{selectedDonation.order_id}</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Donor Info */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Informasi Donatur</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <FontAwesomeIcon 
                        icon={selectedDonation.pengguna_id ? faUser : faIdCard} 
                        className={selectedDonation.pengguna_id ? "text-blue-500" : "text-gray-500"}
                        size="lg" 
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {selectedDonation.pengguna?.nama || 
                         selectedDonation.anonymous_donor?.nama ||
                         selectedDonation.name || 
                         "Anonymous"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedDonation.pengguna?.email || 
                         selectedDonation.anonymous_donor?.email ||
                         selectedDonation.email || 
                         "No email"}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {/* Phone number display removed as it's only applicable for admin users */}
                    {selectedDonation.pengguna_id && (
                    <div>
                      <div className="text-xs text-gray-500">ID Pengguna</div>
                        <div className="text-sm text-gray-900">{selectedDonation.pengguna_id}</div>
                      </div>
                    )}
                    {!selectedDonation.pengguna_id && (
                      <div className="col-span-2">
                        <div className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Donatur belum memiliki akun atau belum mengakses akun
                        </div>
                    </div>
                    )}
                  </div>
                </div>
              </div>
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

