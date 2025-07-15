import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';

const Pengeluaran = () => {
  const [pengeluarans, setPengeluarans] = useState([]);
  const [proyeks, setProyeks] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [filter, setFilter] = useState({
    proyek_id: '',
    kategori_pengeluaran_id: '',
    tanggal_start: null,
    tanggal_end: null
  });
  const [stats, setStats] = useState({
    totalPengeluaran: 0,
    totalProyek: 0,
    totalTargetDana: 0,
    totalDana: 0,
    sisaDana: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(null);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const itemsPerPageOptions = [10, 25, 50, 100];

  // Helper function to get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthError('Sesi login tidak ditemukan. Silakan login kembali.');
      return null;
    }
    return {
      Authorization: `Bearer ${token}`
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { ...filter };
      // Format dates for API
      if (filter.tanggal_start instanceof Date) {
        params.tanggal_start = filter.tanggal_start.toISOString().split('T')[0];
      }
      if (filter.tanggal_end instanceof Date) {
        params.tanggal_end = filter.tanggal_end.toISOString().split('T')[0];
      }
      
      // Use public endpoint without authentication
      const res = await axios.get('/api/Pengeluaran', { params });
      
      setPengeluarans(res.data.data || res.data);
      setCurrentPage(1); // Reset to first page when fetching new data
      setAuthError(null);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setPengeluarans([]);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
      } else {
        setError('Gagal mengambil data pengeluaran');
      }
    } finally {
      setLoading(false);
    }
  };

  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pengeluarans.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pengeluarans.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const fetchOptions = async () => {
    try {
      try {
        // Use public endpoint without authentication
        const resProyek = await axios.get('/api/ProyekPembangunan');
        setProyeks(resProyek.data.data || resProyek.data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProyeks([]);
      }
      
      try {
        // Use public endpoint without authentication
        const resKategori = await axios.get('/api/KategoriPengeluaran');
        setKategoris(resKategori.data.data || resKategori.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setKategoris([]);
      }
      
      setAuthError(null);
    } catch (error) {
      console.error('Error in fetchOptions:', error);
      setProyeks([]);
      setKategoris([]);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
      }
    }
  };

  const fetchStats = async () => {
    try {
      // Use the public endpoint that doesn't require authentication
      const res = await axios.get('/api/public-api/pengeluaran-stats');
      console.log('Stats data:', res.data);
      setStats(res.data || {
        totalPengeluaran: 0,
        totalProyek: 0,
        totalTargetDana: 0,
        totalDana: 0,
        sisaDana: 0
      });
      setAuthError(null);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't set error for stats - just log it
    }
  };

  useEffect(() => {
    fetchOptions();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleStartDateChange = (date) => {
    setFilter(prev => ({ ...prev, tanggal_start: date }));
  };

  const handleEndDateChange = (date) => {
    setFilter(prev => ({ ...prev, tanggal_end: date }));
  };

  const clearFilters = () => {
    setFilter({
      proyek_id: '',
      kategori_pengeluaran_id: '',
      tanggal_start: null,
      tanggal_end: null
    });
  };

  const handleRefresh = () => {
    fetchData();
    fetchStats();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date to Indonesian format with Asia/Jakarta timezone
  const formatDate = (dateString) => {
    // Check if dateString is null, undefined, or empty
    if (!dateString) {
      return '-';
    }
    
    try {
      // Create date object from the UTC date string
      const utcDate = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(utcDate.getTime())) {
        console.warn(`Invalid date value: ${dateString}`);
        return '-';
      }
      
      // Format options for Indonesia locale with explicit timezone
      const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta'
      };
      
      // Format the date with the Indonesia locale and Asia/Jakarta timezone
      return new Intl.DateTimeFormat('id-ID', options).format(utcDate);
    } catch (error) {
      console.error(`Error formatting date: ${dateString}`, error);
      return '-';
    }
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Auth Error Alert */}
      {authError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
            </svg>
            <span>{authError}</span>
          </div>
          <button 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow rounded-xl p-8 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-gray-800">Monitoring Pengeluaran</h1>
            <p className="text-gray-600">Pusat rekapitulasi dan monitoring pengeluaran proyek</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="bg-[#59B997] hover:bg-[#4ca584] text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center mb-3">
            <div className="p-3 bg-red-100 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Pengeluaran</p>
              <h3 className="text-xl font-bold text-gray-800">{formatCurrency(stats.totalPengeluaran || 0)}</h3>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Dari {pengeluarans.length} pengeluaran
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center mb-3">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Dana Dibutuhkan</p>
              <h3 className="text-xl font-bold text-gray-800">{formatCurrency(stats.totalTargetDana || 0)}</h3>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Total kebutuhan dana dari {stats.totalProyek || 0} proyek
          </div>
        </motion.div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white shadow rounded-xl p-6 mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
            Filter Pengeluaran
          </h2>
          <button 
            onClick={clearFilters}
            className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reset Filter
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proyek</label>
            <select 
              name="proyek_id" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997]" 
              value={filter.proyek_id} 
              onChange={handleFilter}
            >
              <option value="">Semua Proyek</option>
              {proyeks.map(p => (
                <option key={p.proyek_id} value={p.proyek_id}>
                  {p.nama_item}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select 
              name="kategori_pengeluaran_id" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997]" 
              value={filter.kategori_pengeluaran_id} 
              onChange={handleFilter}
            >
              <option value="">Semua Kategori</option>
              {kategoris.map(k => (
                <option key={k.kategori_pengeluaran_id} value={k.kategori_pengeluaran_id}>
                  {k.nama_kategori}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
            <DatePicker
              selected={filter.tanggal_start}
              onChange={handleStartDateChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997]"
              placeholderText="Pilih tanggal mulai"
              dateFormat="yyyy-MM-dd"
              isClearable
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
            <DatePicker
              selected={filter.tanggal_end}
              onChange={handleEndDateChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997]"
              placeholderText="Pilih tanggal akhir"
              dateFormat="yyyy-MM-dd"
              isClearable
              minDate={filter.tanggal_start}
            />
          </div>
        </div>
      </motion.div>

      {/* Tabel Pengeluaran */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white shadow rounded-xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
              Daftar Pengeluaran
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {pengeluarans.length} transaksi
              </div>
              <div className="flex items-center">
                <label htmlFor="itemsPerPage" className="text-sm text-gray-600 mr-2">Tampilkan:</label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="border border-gray-300 rounded-lg text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997]"
                >
                  {itemsPerPageOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#59B997]"></div>
          </div>
        ) : pengeluarans.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700">Tidak ada data pengeluaran</h3>
            <p className="mt-1 text-gray-500">Tidak ada pengeluaran yang sesuai dengan filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyek</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((p, index) => (
                  <tr 
                    key={p.pengeluaran_id} 
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{p.nama_pengeluaran}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(p.jumlah)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {p.proyek?.nama_item || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {p.kategori?.nama_kategori || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(p.created_at)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">{p.keterangan || '-'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {pengeluarans.length > 0 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, pengeluarans.length)} dari {pengeluarans.length} transaksi
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-lg border transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    Sebelumnya
                  </button>
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(num => {
                        // Show first page, last page, and pages around current page
                        return (
                          num === 1 ||
                          num === totalPages ||
                          (num >= currentPage - 1 && num <= currentPage + 1)
                        );
                      })
                      .map((number, i, arr) => (
                        <React.Fragment key={number}>
                          {i > 0 && arr[i - 1] !== number - 1 && (
                            <span className="w-8 h-8 flex items-center justify-center text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => paginate(number)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                              currentPage === number
                                ? 'bg-[#59B997] text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                          >
                            {number}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-lg border transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
      
      {/* Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Informasi</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Halaman ini hanya menampilkan data pengeluaran untuk monitoring. Untuk menambah pengeluaran baru, silakan buka halaman Detail Proyek dan tambahkan pengeluaran dari sana.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Pengeluaran;
