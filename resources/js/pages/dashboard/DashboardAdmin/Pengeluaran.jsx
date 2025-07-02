import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Pengeluaran = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    pengeluaran_id: '',
    proyek_id: '',
    penginput_id: '',
    kategori_pengeluaran_id: '',
    laporan_keuangan_id: '',
    jumlah: '',
    tanggal_pengeluaran: '',
    nama_pengeluaran: '',
    keterangan: '',
  });

  useEffect(() => {
    fetchPengeluaran();
  }, []);

  const fetchPengeluaran = () => {
    axios.get('/api/pengeluaran')
      .then((res) => {
        const list = Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];
        setData(list);
      })
      .catch((err) => {
        console.error('Gagal mengambil data pengeluaran:', err);
        setData([]);
      });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/pengeluaran', form)
      .then(() => {
        fetchPengeluaran();
        closeModal();
        setForm({
          pengeluaran_id: '',
          proyek_id: '',
          penginput_id: '',
          kategori_pengeluaran_id: '',
          laporan_keuangan_id: '',
          jumlah: '',
          tanggal_pengeluaran: '',
          nama_pengeluaran: '',
          keterangan: '',
        });
      })
      .catch((err) => {
        console.error('Gagal menambahkan data:', err);
      });
  };

  const openModal = () => {
    setIsModalOpen(true);
    setTimeout(() => setShowModal(true), 10);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setIsModalOpen(false), 300);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Data Pengeluaran</h1>
            <button
              onClick={openModal}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Tambah Data
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2">Jumlah</th>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">{item.nama_pengeluaran}</td>
                      <td className="px-4 py-2">{item.jumlah}</td>
                      <td className="px-4 py-2">{item.tanggal_pengeluaran}</td>
                      <td className="px-4 py-2">{item.keterangan}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center p-4 text-gray-500 dark:text-gray-400">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              showModal ? 'opacity-50' : 'opacity-0'
            }`}
            onClick={closeModal}
          ></div>

          {/* Modal Content */}
          <div
            className={`relative bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full z-10 transform transition-all duration-300
              ${showModal ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
              max-h-[90vh] overflow-y-auto p-6`}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tambah Pengeluaran</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'proyek_id',
                'penginput_id',
                'kategori_pengeluaran_id',
                'laporan_keuangan_id',
                'jumlah',
                'tanggal_pengeluaran',
                'nama_pengeluaran',
                'keterangan',
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 capitalize">
                    {field.replace(/_/g, ' ')}
                  </label>
                  <input
                    type={
                      field === 'jumlah'
                        ? 'number'
                        : field === 'tanggal_pengeluaran'
                        ? 'date'
                        : 'text'
                    }
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 p-2 border rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              ))}

              <div className="md:col-span-2 flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pengeluaran;
