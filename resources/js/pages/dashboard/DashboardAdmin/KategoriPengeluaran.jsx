import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit2, FiTrash2, FiPlus, FiCheck, FiX } from "react-icons/fi";

export default function KategoriPengeluaran() {
  const [kategoriList, setKategoriList] = useState([]);
  const [namaKategori, setNamaKategori] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const fetchKategori = async () => {
    try {
      const res = await axios.get("/api/KategoriPengeluaran");
      setKategoriList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data kategori:", err);
      setKategoriList([]);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  const handleTambah = async (e) => {
    e.preventDefault();
    if (!namaKategori) return;
    setLoading(true);
    try {
      await axios.post("/api/KategoriPengeluaran", { nama_kategori: namaKategori });
      setNamaKategori("");
      await fetchKategori();
      setIsAdding(false);
    } catch (error) {
      alert("Gagal menambah kategori: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editValue) return;
    try {
      await axios.put(`/api/KategoriPengeluaran/${id}`, { nama_kategori: editValue });
      setEditingId(null);
      await fetchKategori();
    } catch (error) {
      alert("Gagal mengupdate kategori: " + (error.response?.data?.message || error.message));
    }
  };

  const handleHapus = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
    try {
      await axios.delete(`/api/KategoriPengeluaran/${id}`);
      await fetchKategori();
    } catch (error) {
      alert("Gagal menghapus kategori: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-md rounded-xl border border-gray-100">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Kategori Pengeluaran</h2>
          <p className="text-gray-600">Kelola kategori pengeluaran Anda</p>
        </div>

        <div className="p-6 border-b">
          {!isAdding ? (
            <div className="text-right">
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition"
              >
                <FiPlus /> Tambah Kategori Baru
              </button>
            </div>
          ) : (
            <form onSubmit={handleTambah} className="space-y-4">
              <div>
                <label htmlFor="namaKategori" className="block text-sm font-medium text-gray-700">
                  Nama Kategori
                </label>
                <input
                  id="namaKategori"
                  type="text"
                  value={namaKategori}
                  onChange={(e) => setNamaKategori(e.target.value)}
                  placeholder="Masukkan nama kategori"
                  className="mt-1 block w-full border border-emerald-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition ${
                    loading ? "bg-gray-300" : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  {loading ? "Memproses..." : <><FiCheck /> Simpan</>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNamaKategori("");
                  }}
                  className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
                >
                  <FiX /> Batal
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-emerald-500 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Nama Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kategoriList.length > 0 ? (
                kategoriList.map((item) => (
                  <tr key={item.kategori_pengeluaran_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.kategori_pengeluaran_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {editingId === item.kategori_pengeluaran_id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="border border-emerald-300 rounded px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          autoFocus
                        />
                      ) : (
                        item.nama_kategori
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {editingId === item.kategori_pengeluaran_id ? (
                          <>
                            <button
                              onClick={() => handleEdit(item.kategori_pengeluaran_id)}
                              className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                              title="Simpan"
                            >
                              <FiCheck />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditValue("");
                              }}
                              className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
                              title="Batal"
                            >
                              <FiX />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(item.kategori_pengeluaran_id);
                                setEditValue(item.nama_kategori);
                              }}
                              className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition"
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleHapus(item.kategori_pengeluaran_id)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                              title="Hapus"
                            >
                              <FiTrash2 />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada kategori tersedia
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
