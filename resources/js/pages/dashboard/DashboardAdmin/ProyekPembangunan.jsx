import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ProyekPembangunan = () => {
  const [proyeks, setProyeks] = useState([]);
  const [selectedProyek, setSelectedProyek] = useState(null);
  const [pengeluarans, setPengeluarans] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [formProyek, setFormProyek] = useState({
    proyek_id: null,
    nama_item: '',
    deskripsi: '',
    target_dana: '',
  });
  const [formPengeluaran, setFormPengeluaran] = useState({
    pengeluaran_id: null,
    nama_pengeluaran: '',
    jumlah: '',
    keterangan: '',
    kategori_pengeluaran_id: '',
    tanggal_pengeluaran: null,
  });
  const [filterPengeluaran, setFilterPengeluaran] = useState({
    kategori_pengeluaran_id: '',
    tanggal_pengeluaran: null,
  });
  const [activeTab, setActiveTab] = useState('proyek');

  // Data fetching functions
  const fetchProyeks = async () => {
    try {
      const res = await axios.get('/api/ProyekPembangunan');
      setProyeks(res.data.data || res.data);
    } catch (error) {
      alert('Gagal mengambil data proyek pembangunan');
    }
  };

  const fetchKategoris = async () => {
    try {
      const res = await axios.get('/api/KategoriPengeluaran');
      setKategoris(res.data.data || res.data);
    } catch {
      alert('Gagal mengambil data kategori pengeluaran');
    }
  };

  const fetchPengeluarans = async (proyekId) => {
    if (!proyekId) {
      setPengeluarans([]);
      return;
    }
    try {
      const params = { proyek_id: proyekId };
      if (filterPengeluaran.kategori_pengeluaran_id) {
        params.kategori_pengeluaran_id = filterPengeluaran.kategori_pengeluaran_id;
      }
      if (filterPengeluaran.tanggal_pengeluaran instanceof Date) {
        params.tanggal_pengeluaran = filterPengeluaran.tanggal_pengeluaran.toISOString().split('T')[0];
      }
      const res = await axios.get('/api/Pengeluaran', { params });
      setPengeluarans(res.data.data || res.data);
    } catch {
      alert('Gagal mengambil data pengeluaran');
    }
  };

  useEffect(() => {
    fetchProyeks();
    fetchKategoris();
  }, []);

  useEffect(() => {
    if (selectedProyek) {
      fetchPengeluarans(selectedProyek.proyek_id);
    } else {
      setPengeluarans([]);
    }
  }, [selectedProyek, filterPengeluaran]);

  // Form handlers
  const handleFormProyekChange = (e) => {
    const { name, value } = e.target;
    setFormProyek(prev => ({ ...prev, [name]: value }));
  };

  const handleFormPengeluaranChange = (e) => {
    const { name, value } = e.target;
    setFormPengeluaran(prev => ({ ...prev, [name]: value }));
  };

  const handleFormPengeluaranDateChange = (date) => {
    setFormPengeluaran(prev => ({ ...prev, tanggal_pengeluaran: date }));
  };

  const handleFilterPengeluaranChange = (e) => {
    const { name, value } = e.target;
    setFilterPengeluaran(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterPengeluaranDateChange = (date) => {
    setFilterPengeluaran(prev => ({ ...prev, tanggal_pengeluaran: date }));
  };

  // Clear forms
  const clearFormProyek = () => {
    setFormProyek({
      proyek_id: null,
      nama_item: '',
      deskripsi: '',
      target_dana: '',
    });
  };

  const clearFormPengeluaran = () => {
    setFormPengeluaran({
      pengeluaran_id: null,
      nama_pengeluaran: '',
      jumlah: '',
      keterangan: '',
      kategori_pengeluaran_id: '',
      tanggal_pengeluaran: null,
    });
  };

  // CRUD operations
  const handleSubmitProyek = async () => {
    const { nama_item, deskripsi, target_dana, proyek_id } = formProyek;
    if (!nama_item || !deskripsi || !target_dana) {
      alert('Harap isi semua kolom proyek yang wajib');
      return;
    }
    try {
      if (proyek_id) {
        await axios.put(`/api/ProyekPembangunan/${proyek_id}`, formProyek);
      } else {
        await axios.post('/api/ProyekPembangunan', formProyek);
      }
      clearFormProyek();
      fetchProyeks();
    } catch {
      alert('Gagal menyimpan data proyek');
    }
  };

  const handleEditProyek = (p) => {
    setFormProyek({
      proyek_id: p.proyek_id,
      nama_item: p.nama_item,
      deskripsi: p.deskripsi,
      target_dana: p.target_dana,
    });
    setActiveTab('proyek');
  };

  const handleDeleteProyek = async (id) => {
    if (window.confirm('Hapus proyek ini?')) {
      try {
        await axios.delete(`/api/ProyekPembangunan/${id}`);
        if (selectedProyek && selectedProyek.proyek_id === id) {
          setSelectedProyek(null);
        }
        fetchProyeks();
      } catch {
        alert('Gagal menghapus proyek');
      }
    }
  };

  const handleSubmitPengeluaran = async () => {
    const { nama_pengeluaran, jumlah, kategori_pengeluaran_id, tanggal_pengeluaran, pengeluaran_id } = formPengeluaran;
    if (!nama_pengeluaran || !jumlah || !kategori_pengeluaran_id || !tanggal_pengeluaran) {
      alert('Harap isi semua kolom pengeluaran yang wajib');
      return;
    }
    try {
      const submitForm = {
        ...formPengeluaran,
        proyek_id: selectedProyek.proyek_id,
        tanggal_pengeluaran: formPengeluaran.tanggal_pengeluaran.toISOString().split('T')[0],
      };
      if (pengeluaran_id) {
        await axios.put(`/api/Pengeluaran/${pengeluaran_id}`, submitForm);
      } else {
        await axios.post('/api/Pengeluaran', submitForm);
      }
      clearFormPengeluaran();
      fetchPengeluarans(selectedProyek.proyek_id);
    } catch {
      alert('Gagal menyimpan data pengeluaran');
    }
  };

  const handleEditPengeluaran = (p) => {
    setFormPengeluaran({
      pengeluaran_id: p.pengeluaran_id,
      nama_pengeluaran: p.nama_pengeluaran,
      jumlah: p.jumlah,
      keterangan: p.keterangan,
      kategori_pengeluaran_id: p.kategori_pengeluaran_id,
      tanggal_pengeluaran: p.tanggal_pengeluaran ? new Date(p.tanggal_pengeluaran) : null,
    });
    setActiveTab('pengeluaran');
  };

  const handleDeletePengeluaran = async (id) => {
    if (window.confirm('Hapus pengeluaran ini?')) {
      try {
        await axios.delete(`/api/Pengeluaran/${id}`);
        fetchPengeluarans(selectedProyek.proyek_id);
      } catch {
        alert('Gagal menghapus pengeluaran');
      }
    }
  };

  // Helper functions
  const hitungProgress = (dana_terkumpul, target_dana) => {
    if (!target_dana || target_dana === 0) return 0;
    return Math.min(100, Math.round((dana_terkumpul / target_dana) * 100));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#59B997] to-[#3a9b7d] text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Proyek Pembangunan</h1>
              <p className="text-green-100 opacity-90 mt-1">Kelola proyek pembangunan dan pengeluaran terkait</p>
            </div>
            <div className="flex space-x-2">
                            {selectedProyek && (
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'pengeluaran' ? 'bg-white text-[#59B997]' : 'bg-white/10 hover:bg-white/20'}`}
                  onClick={() => setActiveTab('pengeluaran')}
                >
                  Pengeluaran
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Proyek Tab */}
        {activeTab === 'proyek' && (
          <div className="space-y-8">
            {/* Form Proyek Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                  {formProyek.proyek_id ? 'Edit Proyek' : 'Tambah Proyek Baru'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Nama Proyek *</label>
                    <input
                      name="nama_item"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                      value={formProyek.nama_item}
                      onChange={handleFormProyekChange}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Target Dana *</label>
                    <input
                      name="target_dana"
                      type="number"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                      value={formProyek.target_dana}
                      onChange={handleFormProyekChange}
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Deskripsi *</label>
                    <textarea
                      name="deskripsi"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                      value={formProyek.deskripsi}
                      onChange={handleFormProyekChange}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={clearFormProyek}
                  >
                    Batal
                  </button>
                  <button
                    className="px-6 py-2 bg-[#59B997] text-white rounded-lg hover:bg-[#4ca584] transition-colors shadow-sm"
                    onClick={handleSubmitProyek}
                  >
                    {formProyek.proyek_id ? 'Simpan Perubahan' : 'Tambah Proyek'}
                  </button>
                </div>
              </div>
            </div>

            {/* Daftar Proyek */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                    Daftar Proyek
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {proyeks.length} proyek
                  </span>
                </div>
              </div>
              
              {proyeks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">Belum ada proyek</h3>
                  <p className="mt-1 text-gray-500">Tambahkan proyek pertama Anda</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {proyeks.map((p) => {
                    const progress = hitungProgress(p.dana_terkumpul, p.target_dana);
                    return (
                      <div
                        key={p.proyek_id}
                        className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${selectedProyek?.proyek_id === p.proyek_id ? 'bg-green-50' : ''}`}
                        onClick={() => setSelectedProyek(p)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                              {p.nama_item}
                              {selectedProyek?.proyek_id === p.proyek_id && (
                                <span className="ml-2 bg-[#59B997] text-white text-xs px-2 py-0.5 rounded-full">Dipilih</span>
                              )}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">{p.deskripsi}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProyek(p);
                              }}
                              className="text-gray-500 hover:text-[#59B997] p-1.5 rounded-full hover:bg-gray-100"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProyek(p.proyek_id);
                              }}
                              className="text-gray-500 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100"
                              title="Hapus"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Terkumpul: {formatCurrency(p.dana_terkumpul || 0)}</span>
                            <span>Target: {formatCurrency(p.target_dana || 0)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-[#59B997] h-2.5 rounded-full flex items-center justify-end"
                              style={{ width: `${progress}%` }}
                            >
                              <div className="w-2 h-2 rounded-full bg-white mr-0.5"></div>
                            </div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500">{progress}% tercapai</span>
                            {progress >= 100 && (
                              <span className="text-xs text-green-600 font-medium">Target tercapai!</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pengeluaran Tab */}
        {activeTab === 'pengeluaran' && selectedProyek && (
          <div className="space-y-8">
            {/* Filter Pengeluaran Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                  Filter Pengeluaran
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Kategori</label>
                    <select
                      name="kategori_pengeluaran_id"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                      value={filterPengeluaran.kategori_pengeluaran_id}
                      onChange={handleFilterPengeluaranChange}
                    >
                      <option value="">Semua Kategori</option>
                      {kategoris.map((k) => (
                        <option key={k.id} value={k.id}>{k.nama_kategori || k.nama}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                    <DatePicker
                      selected={filterPengeluaran.tanggal_pengeluaran}
                      onChange={handleFilterPengeluaranDateChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                      placeholderText="Pilih Tanggal"
                      dateFormat="dd/MM/yyyy"
                      isClearable
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => setFilterPengeluaran({ kategori_pengeluaran_id: '', tanggal_pengeluaran: null })}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full"
                    >
                      Reset Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Pengeluaran Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                  {formPengeluaran.pengeluaran_id ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Nama Pengeluaran *</label>
                    <input
                      name="nama_pengeluaran"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                      value={formPengeluaran.nama_pengeluaran}
                      onChange={handleFormPengeluaranChange}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Jumlah *</label>
                    <input
                      name="jumlah"
                      type="number"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                      value={formPengeluaran.jumlah}
                      onChange={handleFormPengeluaranChange}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Kategori *</label>
                    <select
                      name="kategori_pengeluaran_id"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                      value={formPengeluaran.kategori_pengeluaran_id}
                      onChange={handleFormPengeluaranChange}
                    >
                      <option value="">Pilih Kategori</option>
                      {kategoris.map((k) => (
                        <option key={k.id} value={k.id}>{k.nama_kategori || k.nama}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Tanggal *</label>
                    <DatePicker
                      selected={formPengeluaran.tanggal_pengeluaran}
                      onChange={handleFormPengeluaranDateChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                      placeholderText="Pilih Tanggal"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                    <textarea
                      name="keterangan"
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59B997]/50 focus:border-[#59B997] transition-all"
                      value={formPengeluaran.keterangan}
                      onChange={handleFormPengeluaranChange}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={clearFormPengeluaran}
                  >
                    Batal
                  </button>
                  <button
                    className="px-6 py-2 bg-[#59B997] text-white rounded-lg hover:bg-[#4ca584] transition-colors shadow-sm"
                    onClick={handleSubmitPengeluaran}
                  >
                    {formPengeluaran.pengeluaran_id ? 'Simpan Perubahan' : 'Tambah Pengeluaran'}
                  </button>
                </div>
              </div>
            </div>

            {/* Daftar Pengeluaran Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="w-1 h-6 bg-[#59B997] rounded-full mr-3"></span>
                    Daftar Pengeluaran - {selectedProyek.nama_item}
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {pengeluarans.length} pengeluaran
                  </span>
                </div>
              </div>
              
              {pengeluarans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">Belum ada pengeluaran</h3>
                  <p className="mt-1 text-gray-500">Tambahkan pengeluaran pertama Anda</p>
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
                      {pengeluarans.map((p) => (
                        <tr key={p.pengeluaran_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.nama_pengeluaran}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(p.jumlah)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.kategori?.nama_kategori || p.kategori?.nama}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.tanggal_pengeluaran).toLocaleDateString('id-ID')}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{p.keterangan || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEditPengeluaran(p)}
                              className="text-[#59B997] hover:text-[#4ca584]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePengeluaran(p.pengeluaran_id)}
                              className="text-red-600 hover:text-red-800"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ProyekPembangunan;