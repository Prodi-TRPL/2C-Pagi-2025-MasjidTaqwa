import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit2, FiTrash2, FiPlus, FiCheck, FiX, FiInfo, FiFilter, FiList, FiDollarSign, FiAlertCircle, FiLock } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function KategoriPengeluaran() {
  const [kategoriList, setKategoriList] = useState([]);
  const [namaKategori, setNamaKategori] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // success, error
  const [authError, setAuthError] = useState(false);
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalExpenses: 0
  });

  // Helper function to get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthError(true);
      showToastMessage('Token autentikasi tidak ditemukan. Silakan login kembali.', 'error');
      return null;
    }
    return {
      Authorization: `Bearer ${token}`
    };
  };

  const fetchKategori = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/KategoriPengeluaran");
      setKategoriList(res.data);
      
      // Calculate stats
      if (res.data && res.data.length > 0) {
        const totalExpenses = res.data.reduce((sum, item) => sum + (item.total_pengeluaran || 0), 0);
        setStats({
          totalCategories: res.data.length,
          totalExpenses: totalExpenses
        });
      }
      
      // If we successfully fetched data, ensure auth error is cleared
      setAuthError(false);
    } catch (err) {
      console.error("Gagal mengambil data kategori:", err);
      if (err.response && err.response.status === 401) {
        setAuthError(true);
        showToastMessage("Silakan login untuk mengakses data kategori", "error");
      } else {
        showToastMessage("Gagal mengambil data kategori", "error");
      }
      setKategoriList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  const showToastMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleTambah = async (e) => {
    e.preventDefault();
    if (!namaKategori) return;
    
    const headers = getAuthHeaders();
    if (!headers) return;
    
    setLoading(true);
    try {
      await axios.post("/api/KategoriPengeluaran", { nama_kategori: namaKategori }, { headers });
      setNamaKategori("");
      await fetchKategori();
      setIsAdding(false);
      showToastMessage("Kategori berhasil ditambahkan");
    } catch (error) {
      console.error("Error adding category:", error);
      if (error.response && error.response.status === 401) {
        setAuthError(true);
        showToastMessage("Sesi login telah berakhir. Silakan login kembali.", "error");
      } else {
        showToastMessage("Gagal menambah kategori: " + (error.response?.data?.message || error.message), "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editValue) return;
    
    const headers = getAuthHeaders();
    if (!headers) return;
    
    try {
      await axios.put(`/api/KategoriPengeluaran/${id}`, { nama_kategori: editValue }, { headers });
      setEditingId(null);
      await fetchKategori();
      showToastMessage("Kategori berhasil diperbarui");
    } catch (error) {
      console.error("Error updating category:", error);
      if (error.response && error.response.status === 401) {
        setAuthError(true);
        showToastMessage("Sesi login telah berakhir. Silakan login kembali.", "error");
      } else {
        showToastMessage("Gagal mengupdate kategori: " + (error.response?.data?.message || error.message), "error");
      }
    }
  };

  const handleHapus = async (id, namaKategori) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kategori "${namaKategori}"?`)) return;
    
    const headers = getAuthHeaders();
    if (!headers) return;
    
    try {
      await axios.delete(`/api/KategoriPengeluaran/${id}`, { headers });
      await fetchKategori();
      showToastMessage("Kategori berhasil dihapus");
    } catch (error) {
      console.error("Error deleting category:", error);
      if (error.response && error.response.status === 401) {
        setAuthError(true);
        showToastMessage("Sesi login telah berakhir. Silakan login kembali.", "error");
      } else {
        showToastMessage("Gagal menghapus kategori: " + (error.response?.data?.message || error.message), "error");
      }
    }
  };

  const filteredKategori = kategoriList.filter(item => 
    item.nama_kategori && item.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Form animation variants
  const formVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25 
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { 
        duration: 0.2 
      }
    }
  };

  // Input animation variants
  const inputVariants = {
    focus: { scale: 1.02, borderColor: '#59B997', boxShadow: '0 0 0 3px rgba(89, 185, 151, 0.2)' },
    blur: { scale: 1, borderColor: '#e5e7eb', boxShadow: 'none' }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center ${
              toastType === "success" ? "bg-[#59B997] text-white" : "bg-red-500 text-white"
            }`}
          >
            <div className="mr-3">
              {toastType === "success" ? (
                <FiCheck className="text-white text-xl" />
              ) : (
                <FiInfo className="text-white text-xl" />
              )}
            </div>
            <p>{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Error Alert */}
      {authError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between shadow-lg">
          <div className="flex items-center">
            <FiLock className="mr-2" />
            <span>Sesi login telah berakhir. Silakan login kembali.</span>
          </div>
          <button 
            onClick={handleLogin}
            className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Login
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kategori Pengeluaran</h1>
            <p className="text-gray-600">Kelola kategori pengeluaran untuk laporan keuangan</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Total Categories Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="h-1 bg-[#59B997]"></div>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <FiList className="h-6 w-6 text-[#59B997]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Kategori</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalCategories}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Total Expenses Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="h-1 bg-[#59B997]"></div>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <FiDollarSign className="h-6 w-6 text-[#59B997]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalExpenses)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
              Daftar Kategori
            </h2>
            <p className="text-gray-600">Kelola kategori pengeluaran untuk laporan keuangan masjid</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kategori..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#59B997] focus:outline-none w-60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-b">
          {!isAdding ? (
            <div className="flex justify-end mb-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 bg-[#59B997] hover:bg-[#4ca584] text-white px-4 py-2.5 rounded-lg transition shadow-sm"
              >
                <FiPlus /> Tambah Kategori Baru
              </motion.button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="form"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-green-50 p-6 rounded-lg border border-green-100 shadow-sm"
              >
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <FiPlus className="mr-2 text-[#59B997]" />
                  Tambah Kategori Baru
                </h3>
                <form onSubmit={handleTambah} className="space-y-4">
                  <div>
                    <label htmlFor="namaKategori" className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Kategori <span className="text-red-500">*</span>
                    </label>
                    <motion.div
                      initial="blur"
                      whileFocus="focus"
                      animate="blur"
                      variants={inputVariants}
                      transition={{ duration: 0.2 }}
                      className="relative rounded-lg overflow-hidden"
                    >
                      <input
                        id="namaKategori"
                        type="text"
                        value={namaKategori}
                        onChange={(e) => setNamaKategori(e.target.value)}
                        placeholder="Contoh: Material Bangunan, Perlengkapan Masjid, dll"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#59B997] focus:border-[#59B997] focus:outline-none transition-all duration-200 bg-white"
                        required
                        autoFocus
                      />
                      {namaKategori && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#59B997]"
                        >
                          <FiCheck />
                        </motion.span>
                      )}
                    </motion.div>
                    <p className="mt-1 text-sm text-gray-500">
                      Masukkan nama kategori pengeluaran yang akan digunakan dalam laporan keuangan
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-green-200">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => {
                        setIsAdding(false);
                        setNamaKategori("");
                      }}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg transition"
                    >
                      <FiX /> Batal
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={loading || !namaKategori}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white transition shadow-sm ${
                        loading ? "bg-gray-400 cursor-not-allowed" : 
                        !namaKategori ? "bg-[#59B997]/50 cursor-not-allowed" : 
                        "bg-[#59B997] hover:bg-[#4ca584]"
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Memproses...
                        </>
                      ) : (
                        <>
                          <FiCheck /> Simpan Kategori
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading && !kategoriList.length ? (
            <div className="p-10 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#59B997]"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#59B997] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Nama Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Total Pengeluaran</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKategori.length > 0 ? (
                  filteredKategori.map((item) => (
                    <motion.tr 
                      key={item.kategori_pengeluaran_id} 
                      className="hover:bg-gray-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.kategori_pengeluaran_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {editingId === item.kategori_pengeluaran_id ? (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="border border-gray-300 rounded px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-[#59B997] focus:border-[#59B997]"
                              autoFocus
                            />
                          </motion.div>
                        ) : (
                          item.nama_kategori
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatCurrency(item.total_pengeluaran || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex gap-2 justify-end">
                          {editingId === item.kategori_pengeluaran_id ? (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(item.kategori_pengeluaran_id)}
                                className="p-2 bg-[#59B997] hover:bg-[#4ca584] text-white rounded-lg transition"
                                title="Simpan"
                              >
                                <FiCheck />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setEditingId(null);
                                  setEditValue("");
                                }}
                                className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
                                title="Batal"
                              >
                                <FiX />
                              </motion.button>
                            </>
                          ) : (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setEditingId(item.kategori_pengeluaran_id);
                                  setEditValue(item.nama_kategori);
                                }}
                                className="p-2 bg-[#59B997]/10 hover:bg-[#59B997]/20 text-[#59B997] rounded-lg transition"
                                title="Edit"
                              >
                                <FiEdit2 />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleHapus(item.kategori_pengeluaran_id, item.nama_kategori)}
                                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                                title="Hapus"
                              >
                                <FiTrash2 />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                      {loading ? (
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#59B997] mr-2"></div>
                          Memuat data...
                        </div>
                      ) : searchTerm ? (
                        <div className="flex flex-col items-center">
                          <FiAlertCircle className="text-gray-400 text-3xl mb-2" />
                          <p>Tidak ada kategori yang sesuai dengan pencarian "{searchTerm}"</p>
                          <button 
                            onClick={() => setSearchTerm("")}
                            className="mt-2 text-[#59B997] hover:underline"
                          >
                            Hapus filter
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <FiInfo className="text-gray-400 text-3xl mb-2" />
                          <p>Belum ada kategori tersedia</p>
                          <button 
                            onClick={() => setIsAdding(true)}
                            className="mt-2 text-[#59B997] hover:underline"
                          >
                            Tambah kategori pertama Anda
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Stats and Info */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-sm text-gray-500 flex justify-between items-center">
          <div>Total kategori: {filteredKategori.length} dari {kategoriList.length}</div>
          <div className="text-right text-xs">
            {searchTerm && "Hasil pencarian untuk: '"+searchTerm+"' - "}
            Kategori digunakan untuk mengkategorikan pengeluaran dalam laporan keuangan
          </div>
        </div>
      </div>
    </div>
  );
}
