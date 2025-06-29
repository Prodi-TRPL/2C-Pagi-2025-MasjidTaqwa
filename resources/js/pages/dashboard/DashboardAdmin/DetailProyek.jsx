import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../../../layout/AppLayout';

const DetailProyek = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyek, setProyek] = useState(null);
  const [pengeluarans, setPengeluarans] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formPengeluaran, setFormPengeluaran] = useState({
    pengeluaran_id: null,
    nama_pengeluaran: '',
    jumlah: '',
    keterangan: '',
    kategori_pengeluaran_id: '',
    tanggal_pengeluaran: new Date(),
  });
  const [stats, setStats] = useState({
    totalPengeluaran: 0,
    sisaDana: 0,
    persentasePengeluaran: 0,
  });
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success', // 'success', 'error', 'warning'
  });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    isLoading: false
  });

  // Add a function to show toast notifications
  const showToast = (message, type = 'success') => {
    setToast({
      show: true,
      message,
      type
    });
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Helper function to get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthError('Sesi login tidak ditemukan. Silakan login kembali.');
      showToast('Sesi login tidak ditemukan. Silakan login kembali.', 'error');
      return null;
    }
    return {
      Authorization: `Bearer ${token}`
    };
  };

  const fetchProyek = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const headers = getAuthHeaders();
      if (!headers) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`/api/ProyekPembangunan/${id}`, { headers });
      setProyek(response.data);
      
      // Calculate stats
      const proyekData = response.data;
      const totalPengeluaran = proyekData.pengeluaran?.reduce((sum, p) => sum + parseFloat(p.jumlah || 0), 0) || 0;
      const sisaDana = parseFloat(proyekData.dana_terkumpul || 0) - totalPengeluaran;
      const persentasePengeluaran = proyekData.dana_terkumpul ? 
        Math.min(100, Math.round((totalPengeluaran / parseFloat(proyekData.dana_terkumpul)) * 100)) : 0;
      
      setStats({
        totalPengeluaran,
        sisaDana,
        persentasePengeluaran,
      });
      
      setAuthError(null);
    } catch (error) {
      console.error('Error fetching project:', error);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
        showToast('Sesi login telah berakhir. Silakan login kembali.', 'error');
      } else if (error.response && error.response.status === 404) {
        setError('Proyek tidak ditemukan');
        showToast('Proyek tidak ditemukan', 'error');
      } else {
        setError('Gagal memuat data proyek');
        showToast('Gagal memuat data proyek', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPengeluarans = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      const response = await axios.get('/api/Pengeluaran', { 
        params: { proyek_id: id },
        headers 
      });
      
      setPengeluarans(response.data.data || response.data);
      setAuthError(null);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
      }
      // Don't set error for expenses - just log it
    }
  };

  const fetchKategoris = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      const response = await axios.get('/api/KategoriPengeluaran', { headers });
      console.log('Fetched categories:', response.data);
      setKategoris(response.data.data || response.data);
      setAuthError(null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
      }
      // Don't set error for categories - just log it
    }
  };

  useEffect(() => {
    fetchProyek();
    fetchPengeluarans();
    fetchKategoris();
  }, [id]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormPengeluaran(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormPengeluaran(prev => ({ ...prev, tanggal_pengeluaran: date }));
  };

  const clearForm = () => {
    setFormPengeluaran({
      pengeluaran_id: null,
      nama_pengeluaran: '',
      jumlah: '',
      keterangan: '',
      kategori_pengeluaran_id: '',
      tanggal_pengeluaran: new Date(),
    });
  };

  const handleSubmit = async () => {
    const { nama_pengeluaran, jumlah, kategori_pengeluaran_id, tanggal_pengeluaran } = formPengeluaran;
    if (!nama_pengeluaran || !jumlah || !kategori_pengeluaran_id || !tanggal_pengeluaran) {
      showToast('Harap isi semua kolom yang wajib', 'error');
      return;
    }

    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      // Prepare form data
      const submitForm = {
        ...formPengeluaran,
        proyek_id: id,
        tanggal_pengeluaran: tanggal_pengeluaran.toISOString().split('T')[0]
      };
      
      if (formPengeluaran.pengeluaran_id) {
        await axios.put(`/api/Pengeluaran/${formPengeluaran.pengeluaran_id}`, submitForm, { headers });
        showToast('Pengeluaran berhasil diperbarui', 'success');
      } else {
        await axios.post('/api/Pengeluaran', submitForm, { headers });
        showToast('Pengeluaran berhasil ditambahkan', 'success');
      }
      
      clearForm();
      setShowForm(false);
      fetchProyek();
      fetchPengeluarans();
      setAuthError(null);
    } catch (error) {
      console.error('Error saving expense:', error);
      if (error.response && error.response.status === 401) {
        setAuthError('Sesi login telah berakhir. Silakan login kembali.');
        showToast('Sesi login telah berakhir. Silakan login kembali.', 'error');
      } else {
        showToast('Gagal menyimpan data pengeluaran', 'error');
      }
    }
  };

  const handleEdit = (p) => {
    setFormPengeluaran({
      pengeluaran_id: p.pengeluaran_id,
      nama_pengeluaran: p.nama_pengeluaran,
      jumlah: p.jumlah,
      keterangan: p.keterangan || '',
      kategori_pengeluaran_id: p.kategori_pengeluaran_id,
      tanggal_pengeluaran: p.tanggal_pengeluaran ? new Date(p.tanggal_pengeluaran) : new Date(),
    });
    setShowForm(true);
  };

  const showConfirmation = (title, message, onConfirm) => {
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm,
      isLoading: false
    });
  };

  const handleDelete = async (id) => {
    showConfirmation(
      'Hapus Pengeluaran',
      'Apakah Anda yakin ingin menghapus pengeluaran ini?',
      async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          const headers = getAuthHeaders();
          if (!headers) {
            setConfirmModal(prev => ({ ...prev, show: false, isLoading: false }));
            return;
          }
          
          await axios.delete(`/api/Pengeluaran/${id}`, { headers });
          fetchProyek();
          fetchPengeluarans();
          setAuthError(null);
          showToast('Pengeluaran berhasil dihapus', 'success');
          setConfirmModal(prev => ({ ...prev, show: false, isLoading: false }));
        } catch (error) {
          console.error('Error deleting expense:', error);
          if (error.response && error.response.status === 401) {
            setAuthError('Sesi login telah berakhir. Silakan login kembali.');
            showToast('Sesi login telah berakhir. Silakan login kembali.', 'error');
          } else {
            showToast('Gagal menghapus pengeluaran', 'error');
          }
          setConfirmModal(prev => ({ ...prev, show: false, isLoading: false }));
        }
      }
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleBack = () => {
    navigate('/dashboardhome/proyek-pembangunan');
  };

  // Helper function to get category name
  const getCategoryName = (categoryId) => {
    if (!categoryId) return '-';
    
    const category = kategoris.find(k => 
      (k.kategori_pengeluaran_id && k.kategori_pengeluaran_id.toString() === categoryId.toString()) || 
      (k.id && k.id.toString() === categoryId.toString())
    );
    
    return category ? category.nama_kategori : '-';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#59B997]"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center ${
              toast.type === 'success'
                ? 'bg-[#59B997] text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-yellow-500 text-white'
            }`}
          >
            <div className="mr-3">
              {toast.type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : toast.type === 'error' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="font-medium">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen px-4 text-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => !confirmModal.isLoading && setConfirmModal(prev => ({ ...prev, show: false }))}
              ></motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
              >
                <h3 className="text-lg font-medium leading-6 text-gray-900">{confirmModal.title}</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{confirmModal.message}</p>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
                    onClick={() => !confirmModal.isLoading && setConfirmModal(prev => ({ ...prev, show: false }))}
                    disabled={confirmModal.isLoading}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none ${confirmModal.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={confirmModal.onConfirm}
                    disabled={confirmModal.isLoading}
                  >
                    {confirmModal.isLoading ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : null}
                    Hapus
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Transition Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: 0.3 
        }}
      >
        {/* Auth Error Alert */}
        {authError && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
              <button 
                onClick={handleBack}
                className="mt-3 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Kembali ke Daftar Proyek
              </button>
            </div>
          </div>
        )}

        <div className="p-6 bg-gray-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            {proyek && (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-[#59B997] to-[#3a9b7d] text-white p-6 shadow-lg rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Detail Proyek</h1>
                    <button 
                      onClick={handleBack}
                      className="flex items-center bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Kembali
                    </button>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-b-xl overflow-hidden mb-6">
                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-2 text-gray-800">{proyek.nama_item}</h1>
                    <p className="text-gray-600 mb-6">{proyek.deskripsi}</p>
                    
                    {/* Project Image */}
                    {proyek.gambar && (
                      <div className="mb-6">
                        <img 
                          src={`/storage/${proyek.gambar}`} 
                          alt={proyek.nama_item} 
                          className="rounded-lg shadow-sm max-h-64 object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Progress Bar */}
                    <div className="mb-2 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Progress Dana ({stats.persentasePengeluaran}%)
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatCurrency(stats.totalPengeluaran)} / {formatCurrency(proyek.dana_terkumpul)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                      <div 
                        className="bg-[#59B997] h-4 rounded-full"
                        style={{ width: `${stats.persentasePengeluaran}%` }}
                      ></div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <p className="text-sm text-blue-600 font-medium">Target Dana</p>
                        <p className="text-xl font-bold text-blue-800">{formatCurrency(proyek.target_dana)}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <p className="text-sm text-green-600 font-medium">Dana Terkumpul</p>
                        <p className="text-xl font-bold text-green-800">{formatCurrency(proyek.dana_terkumpul)}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                        <p className="text-sm text-yellow-600 font-medium">Sisa Dana</p>
                        <p className="text-xl font-bold text-yellow-800">{formatCurrency(stats.sisaDana)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pengeluaran Section */}
                <div className="bg-white shadow rounded-xl p-8 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                      Pengeluaran Proyek
                    </h2>
                    <button
                      onClick={() => {
                        clearForm();
                        setShowForm(!showForm);
                      }}
                      className="px-4 py-2 bg-[#59B997] text-white rounded-lg hover:bg-[#4ca584] transition-colors shadow-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {showForm ? 'Tutup Form' : 'Tambah Pengeluaran'}
                    </button>
                  </div>

                  {/* Form Pengeluaran */}
                  <AnimatePresence>
                    {showForm && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
                          <h3 className="text-lg font-medium text-gray-800 mb-4">
                            {formPengeluaran.pengeluaran_id ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru'}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="block text-sm font-medium text-gray-700">Nama Pengeluaran *</label>
                              <input
                                name="nama_pengeluaran"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                                value={formPengeluaran.nama_pengeluaran}
                                onChange={handleFormChange}
                                placeholder="Contoh: Pembelian Bahan Bangunan"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <label className="block text-sm font-medium text-gray-700">Jumlah (Rp) *</label>
                              <input
                                name="jumlah"
                                type="number"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                                value={formPengeluaran.jumlah}
                                onChange={handleFormChange}
                                placeholder="Masukkan jumlah pengeluaran"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <label className="block text-sm font-medium text-gray-700">Kategori *</label>
                              <select
                                name="kategori_pengeluaran_id"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                                value={formPengeluaran.kategori_pengeluaran_id}
                                onChange={handleFormChange}
                              >
                                <option value="">Pilih Kategori</option>
                                {kategoris.map(k => (
                                  <option 
                                    key={k.kategori_pengeluaran_id || k.id} 
                                    value={k.kategori_pengeluaran_id || k.id}
                                  >
                                    {k.nama_kategori}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="space-y-1">
                              <label className="block text-sm font-medium text-gray-700">Tanggal *</label>
                              <DatePicker
                                selected={formPengeluaran.tanggal_pengeluaran}
                                onChange={handleDateChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                                dateFormat="yyyy-MM-dd"
                              />
                            </div>
                            
                            <div className="md:col-span-2 space-y-1">
                              <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                              <textarea
                                name="keterangan"
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                                value={formPengeluaran.keterangan}
                                onChange={handleFormChange}
                                placeholder="Tambahkan keterangan (opsional)"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-3 mt-6">
                            <button
                              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                              onClick={() => {
                                clearForm();
                                setShowForm(false);
                              }}
                            >
                              Batal
                            </button>
                            <button
                              className="px-6 py-2 bg-[#59B997] text-white rounded-lg hover:bg-[#4ca584] transition-colors shadow-sm"
                              onClick={handleSubmit}
                            >
                              {formPengeluaran.pengeluaran_id ? 'Simpan Perubahan' : 'Tambah Pengeluaran'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Daftar Pengeluaran */}
                  {pengeluarans.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-700">Belum ada pengeluaran</h3>
                      <p className="mt-1 text-gray-500">Tambahkan pengeluaran pertama untuk proyek ini</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {pengeluarans.map((p, index) => (
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
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {getCategoryName(p.kategori_pengeluaran_id)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{p.tanggal_pengeluaran}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500 max-w-xs truncate">{p.keterangan || '-'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleEdit(p)}
                                  className="text-[#59B997] hover:text-[#4ca584] mr-3"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(p.pengeluaran_id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                {/* Warning Card */}
                {stats.sisaDana < 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Peringatan: Dana Minus</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>
                            Total pengeluaran melebihi dana yang terkumpul. Mohon periksa kembali pengeluaran atau tambahkan dana.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default DetailProyek;
