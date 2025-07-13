import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  Search, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  RefreshCw,
  AlertCircle,
  Clock,
  Filter,
  FileText,
  Activity,
  X,
  Info,
  CheckCircle
} from "lucide-react";

// Custom color for consistency with other pages
const customGreen = "#59B997";

const LogAktivitas = () => {
  // State for logs data
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  
  // State for filters
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  
  // State for stats
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    lastActivity: null,
  });

  // State for toast notifications
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success", // success, error, info
  });
  
  // State for filter visibility on mobile
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Fetch logs data
  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      // Create params object
      const params = {
        page,
        per_page: pagination.per_page,
        search: search,
      };
      
      // Only add date filters if they are not empty
      if (dateRange.startDate) {
        params.start_date = formatDateForAPI(dateRange.startDate);
        console.log(`Including start date in filter: ${params.start_date}`);
      }
      
      if (dateRange.endDate) {
        params.end_date = formatDateForAPI(dateRange.endDate);
        console.log(`Including end date in filter: ${params.end_date}`);
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // First try authenticated endpoint
      let response;
      let usePublicEndpoint = false;
      
      try {
        if (!token) {
          // If no token, use public endpoint directly
          usePublicEndpoint = true;
        } else {
          // Try authenticated endpoint first
          response = await axios.get("/api/admin/log-aktivitas", { 
            params,
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        }
      } catch (authError) {
        console.warn("Auth endpoint failed, falling back to public endpoint:", authError);
        usePublicEndpoint = true;
      }
      
      // If authenticated endpoint failed or no token, use public endpoint
      if (usePublicEndpoint) {
        response = await axios.get("/api/public/log-aktivitas", { params });
      }
      
      setLogs(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      });
      
      // Update stats
      if (response.data.data && response.data.data.length > 0) {
        // Calculate today's logs
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = response.data.data.filter(log => 
          new Date(log.created_at).toISOString().split('T')[0] === today
        ).length;
        
        // Find last activity
        const sortedLogs = [...response.data.data].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        setStats({
          totalLogs: response.data.total || 0,
          todayLogs: todayLogs,
          lastActivity: sortedLogs[0]?.created_at || null,
        });
      }
      
      setError(null);
      
      // Show success toast
      showToast("Data log aktivitas berhasil dimuat", "success");
    } catch (err) {
      console.error("Error fetching logs:", err);
      
      // Handle specific error cases
      if (err.response && err.response.status === 401) {
        setError("Anda tidak memiliki akses. Silakan login kembali.");
        showToast("Anda tidak memiliki akses. Silakan login kembali.", "error");
      } else {
        setError("Gagal memuat data log aktivitas. Silakan coba lagi.");
        showToast("Gagal memuat data log aktivitas", "error");
      }
      
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Auto-apply filter when dates change
  useEffect(() => {
    if (dateRange.startDate || dateRange.endDate) {
      fetchLogs(1);
    }
  }, [dateRange.startDate, dateRange.endDate]);
  
  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, []);
  
  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs(1); // Reset to first page when searching
  };
  
  // Apply date filter
  const applyDateFilter = () => {
    // Validate date range if both dates are provided
    if (dateRange.startDate && dateRange.endDate) {
      // Check if end date is before start date
      if (dateRange.endDate < dateRange.startDate) {
        showToast("Tanggal akhir tidak boleh sebelum tanggal awal", "error");
        return;
      }
    }
    
    // Log the filter being applied
    console.log("Applying date filter:", dateRange);
    
    // Apply the filter
    fetchLogs(1); // Reset to first page when filtering
    showToast("Filter tanggal diterapkan", "success");
    setShowMobileFilters(false); // Close mobile filters after applying
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setDateRange({ startDate: null, endDate: null });
    fetchLogs(1);
    setShowMobileFilters(false); // Close mobile filters after resetting
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    // Check if dateString is null, undefined, or empty
    if (!dateString) {
      return '-';
    }
    
    try {
      // Handle ISO format (2025-07-13T13:26:22.000000Z) or MySQL format (2025-07-13 13:26:22)
      let parts;
      
      if (dateString.includes('T')) {
        // ISO format: 2025-07-13T13:26:22.000000Z
        parts = dateString.split(/[T:.]/);
        const dateParts = parts[0].split('-');
        
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
        const day = parseInt(dateParts[2]);
        const hour = parseInt(parts[1]);
        const minute = parseInt(parts[2]);
        
        // Get month name in Indonesian
        const monthNames = [
          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
          "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        
        // Format the date string manually with "pukul" for time
        return `${day} ${monthNames[month]} ${year} pukul ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      } else {
        // MySQL format: 2025-07-13 13:26:22
        parts = dateString.split(/[- :]/);
        if (parts.length >= 6) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // Month is 0-indexed in JS Date
          const day = parseInt(parts[2]);
          const hour = parseInt(parts[3]);
          const minute = parseInt(parts[4]);
          
          // Get month name in Indonesian
          const monthNames = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
          ];
          
          // Format the date string manually with "pukul" for time
          return `${day} ${monthNames[month]} ${year} pukul ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        }
      }
      
      // Fallback if parsing fails
      console.warn(`Could not parse date: ${dateString}`);
      return dateString;
    } catch (error) {
      console.error(`Error formatting date: ${dateString}`, error);
      return dateString;
    }
  };
  
  // Handle pagination
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.last_page) return;
    fetchLogs(page);
  };
  
  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const { current_page, last_page } = pagination;
    
    // Calculate range of pages to show
    let startPage = Math.max(1, current_page - 2);
    let endPage = Math.min(last_page, startPage + 4);
    
    if (endPage - startPage < 4 && last_page > 5) {
      startPage = Math.max(1, endPage - 4);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(1)}
          disabled={current_page === 1}
          className="p-2 rounded-md border bg-white disabled:opacity-50 hover:bg-gray-100 transition-colors"
          aria-label="First page"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => handlePageChange(current_page - 1)}
          disabled={current_page === 1}
          className="p-2 rounded-md border bg-white disabled:opacity-50 hover:bg-gray-100 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded-md transition-all ${
              page === current_page
                ? "text-white font-medium shadow-sm"
                : "bg-white border hover:bg-gray-50"
            }`}
            style={page === current_page ? { backgroundColor: customGreen } : {}}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => handlePageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="p-2 rounded-md border bg-white disabled:opacity-50 hover:bg-gray-100 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => handlePageChange(last_page)}
          disabled={current_page === last_page}
          className="p-2 rounded-md border bg-white disabled:opacity-50 hover:bg-gray-100 transition-colors"
          aria-label="Last page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    );
  };
  
  // Get activity type badge color
  const getActivityBadgeColor = (activityType) => {
    const activityTypeMap = {
      'login': 'bg-blue-100 text-blue-800',
      'logout': 'bg-purple-100 text-purple-800',
      'tambah': '',
      'ubah': 'bg-yellow-100 text-yellow-800',
      'hapus': 'bg-red-100 text-red-800',
      'validasi': 'bg-indigo-100 text-indigo-800',
    };
    
    // Special case for tambah using our custom green
    if (activityType.toLowerCase().includes('tambah')) {
      return {
        backgroundColor: `${customGreen}20`, // 20% opacity
        color: '#2c7a59' // Darker variant for text
      };
    }
    
    // Check if the activity type contains any of the keywords
    for (const [keyword, className] of Object.entries(activityTypeMap)) {
      if (activityType.toLowerCase().includes(keyword.toLowerCase()) && className) {
        return className;
      }
    }
    
    // Default color
    return 'bg-gray-100 text-gray-800';
  };

  // Format date for API requests
  const formatDateForAPI = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Toast notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center ${
              toast.type === "success" 
                ? "text-white" 
                : toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
            style={toast.type === "success" ? { backgroundColor: customGreen } : {}}
          >
            <div className="mr-3">
              {toast.type === "success" ? (
                <CheckCircle size={20} />
              ) : toast.type === "error" ? (
                <AlertCircle size={20} />
              ) : (
                <Info size={20} />
              )}
            </div>
            <p>{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Log Aktivitas</h1>
          <p className="text-gray-500 mt-1">
            Pantau aktivitas pengguna dan sistem dalam aplikasi
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Remove Test Logs Button */}
          
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center justify-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-lg shadow-md p-4 border-l-4"
          style={{ borderLeftColor: customGreen }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Log Aktivitas</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalLogs}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: `${customGreen}20` }}>
              <Activity size={24} style={{ color: customGreen }} />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Aktivitas Hari Ini</p>
              <p className="text-2xl font-bold text-gray-800">{stats.todayLogs}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock size={24} className="text-blue-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Aktivitas Terakhir</p>
              <p className="text-sm font-medium text-gray-800">
                {stats.lastActivity ? formatDate(stats.lastActivity) : 'Tidak ada data'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FileText size={24} className="text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Filters */}
      <motion.div 
        className={`bg-white rounded-lg shadow-md p-4 ${showMobileFilters ? 'block' : 'hidden md:block'}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Filter Log Aktivitas</h2>
          {/* Close button for mobile */}
          <button
            onClick={() => setShowMobileFilters(false)}
            className="md:hidden p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari aktivitas atau detail..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2  focus:ring-[#59B997]/60 focus:border-[#59B997] transition-all"
                />
              </div>
              <button
                type="submit"
                className="ml-2 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                style={{ 
                  backgroundColor: customGreen,
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4da583'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = customGreen}
              >
                Cari
              </button>
            </form>
          </div>
          
          {/* Date Filter */}
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dari Tanggal
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <DatePicker
                  selected={dateRange.startDate}
                  onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none transition-all"
                  style={{
                    '--tw-ring-color': customGreen,
                    '--tw-ring-opacity': '1',
                    '--tw-ring-offset-width': '2px',
                    '--tw-ring-offset-color': '#ffffff',
                    '--tw-ring-offset-shadow': '0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
                    '--tw-ring-shadow': '0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color)',
                  }}
                  placeholderText="Pilih tanggal awal"
                  dateFormat="dd/MM/yyyy"
                  isClearable
                  selectsStart
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sampai Tanggal
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <DatePicker
                  selected={dateRange.endDate}
                  onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none transition-all"
                  style={{
                    '--tw-ring-color': customGreen,
                    '--tw-ring-opacity': '1',
                    '--tw-ring-offset-width': '2px',
                    '--tw-ring-offset-color': '#ffffff',
                    '--tw-ring-offset-shadow': '0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
                    '--tw-ring-shadow': '0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color)',
                  }}
                  placeholderText="Pilih tanggal akhir"
                  dateFormat="dd/MM/yyyy"
                  isClearable
                  selectsEnd
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  minDate={dateRange.startDate}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={applyDateFilter}
                disabled={!dateRange.startDate && !dateRange.endDate}
                className={`${
                  !dateRange.startDate && !dateRange.endDate 
                    ? 'bg-opacity-70 cursor-not-allowed' 
                    : 'hover:brightness-95'
                } text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
                style={{ 
                  backgroundColor: !dateRange.startDate && !dateRange.endDate 
                    ? '#a8d4c5' // Lighter version of the custom green
                    : customGreen,
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                Terapkan
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={resetFilters}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Reset
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Log Table */}
      <motion.div 
        className="bg-white rounded-lg shadow-md overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <RefreshCw size={24} className="animate-spin mr-2" style={{ color: customGreen }} />
            <span>Memuat data...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center p-8 text-red-500">
            <AlertCircle size={24} className="mr-2" />
            <span>{error}</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="font-medium">Tidak ada data log aktivitas yang ditemukan.</p>
            <p className="text-sm mt-2">Coba ubah filter pencarian atau reset filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal & Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis Aktivitas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detail Aktivitas
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log, index) => (
                  <motion.tr 
                    key={log.id} 
                    className="hover:bg-gray-50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(pagination.current_page - 1) * pagination.per_page + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {typeof getActivityBadgeColor(log.aktivitas) === 'string' ? (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActivityBadgeColor(log.aktivitas)}`}>
                          {log.aktivitas}
                        </span>
                      ) : (
                        <span 
                          className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          style={getActivityBadgeColor(log.aktivitas)}
                        >
                          {log.aktivitas}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.detail}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && !error && logs.length > 0 && (
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              Menampilkan {logs.length} dari {pagination.total} data
            </div>
            {renderPaginationButtons()}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LogAktivitas;
