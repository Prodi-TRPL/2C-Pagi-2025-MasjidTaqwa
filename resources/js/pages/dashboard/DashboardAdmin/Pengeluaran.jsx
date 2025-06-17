import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Pengeluaran = () => {
  const [pengeluarans, setPengeluarans] = useState([]);
  const [proyeks, setProyeks] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [form, setForm] = useState({
    pengeluaran_id: null,
    nama_pengeluaran: '',
    jumlah: '',
    keterangan: '',
    proyek_id: '',
    kategori_pengeluaran_id: '',
    tanggal_pengeluaran: null, // ubah ke null untuk Date object
    laporan_keuangan_id: ''
  });
  const [filter, setFilter] = useState({
    proyek_id: '',
    kategori_pengeluaran_id: '',
    tanggal_pengeluaran: ''
  });

  const fetchData = async () => {
    try {
      const params = { ...filter };
      // Jika tanggal filter ada, ubah ke string yyyy-mm-dd
      if (filter.tanggal_pengeluaran instanceof Date) {
        params.tanggal_pengeluaran = filter.tanggal_pengeluaran.toISOString().split('T')[0];
      }
      const res = await axios.get('/api/Pengeluaran', { params });
      setPengeluarans(res.data.data || res.data);
    } catch {
      alert('Gagal mengambil data pengeluaran');
    }
  };

  const fetchOptions = async () => {
    try {
      const [resProyek, resKategori] = await Promise.all([
        axios.get('/api/ProyekPembangunan'),
        axios.get('/api/KategoriPengeluaran')
      ]);
      setProyeks(resProyek.data.data || resProyek.data);
      setKategoris(resKategori.data.data || resKategori.data);
    } catch {
      alert('Gagal mengambil data proyek/kategori');
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setForm(prev => ({ ...prev, tanggal_pengeluaran: date }));
  };

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterDateChange = (date) => {
    setFilter(prev => ({ ...prev, tanggal_pengeluaran: date }));
  };

  const clearForm = () => {
    setForm({
      pengeluaran_id: null,
      nama_pengeluaran: '',
      jumlah: '',
      keterangan: '',
      proyek_id: '',
      kategori_pengeluaran_id: '',
      tanggal_pengeluaran: null,
      laporan_keuangan_id: ''
    });
  };

  const handleSubmit = async () => {
    const { nama_pengeluaran, jumlah, proyek_id, kategori_pengeluaran_id, tanggal_pengeluaran } = form;
    if (!nama_pengeluaran || !jumlah || !proyek_id || !kategori_pengeluaran_id || !tanggal_pengeluaran) {
      alert('Harap isi semua kolom yang wajib');
      return;
    }
    try {
      // Ubah tanggal_pengeluaran ke string yyyy-mm-dd sebelum submit
      const submitForm = {
        ...form,
        tanggal_pengeluaran: form.tanggal_pengeluaran.toISOString().split('T')[0]
      };
      if (form.pengeluaran_id) {
        await axios.put(`/api/Pengeluaran/${form.pengeluaran_id}`, submitForm);
      } else {
        await axios.post('/api/Pengeluaran', submitForm);
      }
      clearForm();
      fetchData();
    } catch {
      alert('Gagal menyimpan data');
    }
  };

  const handleEdit = (p) => {
    setForm({
      ...p,
      tanggal_pengeluaran: p.tanggal_pengeluaran ? new Date(p.tanggal_pengeluaran) : null
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus pengeluaran ini?')) {
      try {
        await axios.delete(`/api/Pengeluaran/${id}`);
        fetchData();
      } catch {
        alert('Gagal menghapus');
      }
    }
  };

  return (
    <div className="p-6 bg-gray -50 min-h-screen">
      {/* Judul */}
      <div className="bg-white shadow rounded-xl p-8 mb-6">
        <h1 className="text-2xl font-bold mb-1">Pengeluaran</h1>
        <p className="text-gray-600">Kelola pengeluaran proyek Anda</p>
      </div>

      {/* Form Tambah/Edit */}
      <div className="bg-white shadow rounded-xl p-10 mb-6">
        <h2 className="text-xl font-semibold mb-4">{form.pengeluaran_id ? 'Edit' : 'Tambah'} Pengeluaran</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="nama_pengeluaran" placeholder="Nama Pengeluaran *" className="border p-2 rounded" value={form.nama_pengeluaran} onChange={handleChange} />
          <input name="jumlah" type="number" placeholder="Jumlah *" className="border p-2 rounded" value={form.jumlah} onChange={handleChange} />
          <input name="keterangan" placeholder="Keterangan" className="border p-2 rounded" value={form.keterangan} onChange={handleChange} />
          <select name="proyek_id" className="border p-2 rounded" value={form.proyek_id} onChange={handleChange}>
            <option value="">Pilih Proyek *</option>
            {proyeks.map(p => <option key={p.id} value={p.id}>{p.nama_proyek || p.nama}</option>)}
          </select>
          <select name="kategori_pengeluaran_id" className="border p-2 rounded" value={form.kategori_pengeluaran_id} onChange={handleChange}>
            <option value="">Pilih Kategori *</option>
            {kategoris.map(k => <option key={k.id} value={k.id}>{k.nama_kategori || k.nama}</option>)}
          </select>
          <DatePicker
            selected={form.tanggal_pengeluaran}
            onChange={handleDateChange}
            className="border p-2 rounded w-full"
            placeholderText="Pilih Tanggal *"
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div className="mt-4 flex gap-3">
          <button className="bg-[#59B997] hover:bg-[#4ca584] text-white px-4 py-2 rounded" onClick={handleSubmit}>
            {form.pengeluaran_id ? 'Update' : 'Tambah'}
          </button>
          <button className="bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded" onClick={clearForm}>Batal</button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white shadow rounded-xl p-8 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filter Pengeluaran</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select name="proyek_id" className="border p-2 rounded" value={filter.proyek_id} onChange={handleFilter}>
            <option value="">Semua Proyek</option>
            {proyeks.map(p => <option key={p.id} value={p.id}>{p.nama_proyek || p.nama}</option>)}
          </select>
          <select name="kategori_pengeluaran_id" className="border p-2 rounded" value={filter.kategori_pengeluaran_id} onChange={handleFilter}>
            <option value="">Semua Kategori</option>
            {kategoris.map(k => <option key={k.id} value={k.id}>{k.nama_kategori || k.nama}</option>)}
          </select>
          <DatePicker
            selected={filter.tanggal_pengeluaran}
            onChange={handleFilterDateChange}
            className="border p-2 rounded w-full"
            placeholderText="Pilih Tanggal"
            dateFormat="yyyy-MM-dd"
            isClearable
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white shadow rounded-xl p-8">
        <h2 className="text-xl font-semibold mb-4">Daftar Pengeluaran</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200">
            <thead style={{ backgroundColor: '#59B997' }} className="text-white">
              <tr>
                <th className="px-4 py-2 text-left">Nama</th>
                <th className="px-4 py-2 text-left">Jumlah</th>
                <th className="px-4 py-2 text-left">Keterangan</th>
                <th className="px-4 py-2 text-left">Proyek</th>
                <th className="px-4 py-2 text-left">Kategori</th>
                <th className="px-4 py-2 text-left">Tanggal</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pengeluarans.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-gray-600">Tidak ada pengeluaran</td></tr>
              ) : (
                pengeluarans.map(p => (
                  <tr key={p.pengeluaran_id} className="border-t">
                    <td className="px-4 py-2">{p.nama_pengeluaran}</td>
                    <td className="px-4 py-2">{p.jumlah}</td>
                    <td className="px-4 py-2">{p.keterangan}</td>
                    <td className="px-4 py-2">{p.proyek?.nama_proyek || p.proyek?.nama}</td>
                    <td className="px-4 py-2">{p.kategori?.nama_kategori || p.kategori?.nama}</td>
                    <td className="px-4 py-2">{p.tanggal_pengeluaran}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button onClick={() => handleEdit(p)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                      <button onClick={() => handleDelete(p.pengeluaran_id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pengeluaran;
