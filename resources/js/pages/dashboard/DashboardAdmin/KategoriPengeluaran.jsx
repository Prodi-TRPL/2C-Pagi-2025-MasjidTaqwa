import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit2, FiTrash2, FiPlus, FiCheck, FiX } from "react-icons/fi";

export default function KategoriPengeluaran() {
  // State management
  const [kategoriList, setKategoriList] = useState([]);
  const [namaKategori, setNamaKategori] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Color scheme based on #59B997
  const colorScheme = {
    primary: "#59B997",
    primaryDark: "#3C9A7D",
    primaryLight: "#E8F5F0",
    primaryHover: "#4AAE88",
    danger: "#EF4444",
    dangerHover: "#DC2626"
  };

  // Fetch categories from API
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

  // Add new category
  const handleTambah = async (e) => {
    e.preventDefault();
    if (!namaKategori) return;
    
    setLoading(true);
    try {
      await axios.post("/api/KategoriPengeluaran", {
        nama_kategori: namaKategori,
      });
      setNamaKategori("");
      await fetchKategori();
      setIsAdding(false);
    } catch (error) {
      alert("Gagal menambah kategori: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Edit category functions
  const startEditing = (id, currentName) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleEdit = async (id) => {
    if (!editValue) return;
    
    try {
      await axios.put(`/api/KategoriPengeluaran/${id}`, {
        nama_kategori: editValue,
      });
      setEditingId(null);
      await fetchKategori();
    } catch (error) {
      alert("Gagal mengupdate kategori: " + (error.response?.data?.message || error.message));
    }
  };

  // Delete category
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
    <div className="max-w-full mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Kategori Pengeluaran</h2>
          <p className="text-gray-600">Kelola kategori pengeluaran Anda</p>
        </div>

        {/* Add Category Section */}
        <div className="p-6 border-b border-gray-200">
          {!isAdding ? (
            <div className="flex justify-end">
            <button
              onClick={() => setIsAdding(true)}
              style={{ backgroundColor: colorScheme.primary }}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-primaryHover transition-colors"
            >
              <FiPlus /> Tambah Kategori Baru
            </button>
            </div>
          ) : (
            <form onSubmit={handleTambah} className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="namaKategori" className="text-sm font-medium text-gray-700">
                  Nama Kategori
                </label>
                <input
                  id="namaKategori"
                  type="text"
                  placeholder="Masukkan nama kategori"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ borderColor: colorScheme.primary, focusRingColor: colorScheme.primary }}
                  value={namaKategori}
                  onChange={(e) => setNamaKategori(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: loading ? "#CBD5E0" : colorScheme.primary }}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-primaryHover transition-colors"
                >
                  {loading ? "Memproses..." : <><FiCheck /> Simpan</>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNamaKategori("");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <FiX /> Batal
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: colorScheme.primary }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Nama Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kategoriList.length > 0 ? (
                kategoriList.map((item) => (
                  <tr key={item.kategori_pengeluaran_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.kategori_pengeluaran_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingId === item.kategori_pengeluaran_id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-1"
                          style={{ borderColor: colorScheme.primary }}
                          autoFocus
                        />
                      ) : (
                        item.nama_kategori
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {editingId === item.kategori_pengeluaran_id ? (
                          <>
                            <button
                              onClick={() => handleEdit(item.kategori_pengeluaran_id)}
                              style={{ backgroundColor: colorScheme.primary }}
                              className="p-2 text-white rounded-lg hover:bg-primaryHover transition-colors"
                              title="Simpan"
                            >
                              <FiCheck />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors"
                              title="Batal"
                            >
                              <FiX />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(item.kategori_pengeluaran_id, item.nama_kategori)}
                              style={{ color: colorScheme.primary, backgroundColor: colorScheme.primaryLight }}
                              className="p-2 rounded-lg hover:bg-primaryLight transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleHapus(item.kategori_pengeluaran_id)}
                              style={{ color: colorScheme.danger, backgroundColor: "#FEE2E2" }}
                              className="p-2 rounded-lg hover:bg-red-100 transition-colors"
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