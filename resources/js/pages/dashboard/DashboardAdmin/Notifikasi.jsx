import React, { useState, useEffect } from "react";
import { FiTrash2, FiRefreshCw, FiSend, FiUsers } from "react-icons/fi";
import axios from "axios";

const Notifikasi = () => {
  const [notifikasiList, setNotifikasiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({
    total_sent: 0,
    total_read: 0,
    total_unread: 0,
    read_percentage: 0
  });

  const [formData, setFormData] = useState({
    jenis: "Progress Pembangunan",
    judul: "",
  });

  // Fetch notifications from database
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/admin/notifikasi", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifikasiList(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      alert("Gagal memuat notifikasi");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/admin/notifikasi/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const handleTambah = async (e) => {
    e.preventDefault();
    if (!formData.judul.trim()) {
      alert("Judul tidak boleh kosong");
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("/api/admin/notifikasi", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert(`Notifikasi berhasil dikirim ke ${response.data.count} donatur`);
      setFormData({ jenis: "Progress Pembangunan", judul: "" });
      fetchNotifications(); // Refresh list
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Failed to send notification:", error);
      alert("Gagal mengirim notifikasi");
    } finally {
      setSending(false);
    }
  };

  const handleHapus = async (id) => {
    if (!confirm("Yakin ingin menghapus notifikasi ini untuk semua donatur?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/notifikasi/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      alert("Notifikasi berhasil dihapus");
      fetchNotifications(); // Refresh list
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Failed to delete notification:", error);
      alert("Gagal menghapus notifikasi");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Notifikasi Donatur
        </h1>
        <button
          onClick={() => {
            fetchNotifications();
            fetchStats();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <FiSend className="text-blue-500 text-xl mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total Terkirim</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total_sent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <FiUsers className="text-green-500 text-xl mr-2" />
            <div>
              <p className="text-sm text-gray-600">Sudah Dibaca</p>
              <p className="text-2xl font-bold text-green-600">{stats.total_read}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-yellow-500 rounded-full mr-2"></div>
            <div>
              <p className="text-sm text-gray-600">Belum Dibaca</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.total_unread}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-purple-500 rounded-full mr-2"></div>
            <div>
              <p className="text-sm text-gray-600">Tingkat Baca</p>
              <p className="text-2xl font-bold text-purple-600">{stats.read_percentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Tambah */}
      <form
        onSubmit={handleTambah}
        className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-200"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Buat Notifikasi Manual
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Jenis
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
              style={{ outlineColor: "#59B997" }}
              value={formData.jenis}
              onChange={(e) =>
                setFormData({ ...formData, jenis: e.target.value })
              }
              disabled={sending}
            >
              <option>Progress Pembangunan</option>
              <option>Target Proyek Tercapai</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Isi Pesan
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Proyek Masjid telah selesai 100%"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
              style={{ outlineColor: "#59B997" }}
              value={formData.judul}
              onChange={(e) =>
                setFormData({ ...formData, judul: e.target.value })
              }
              disabled={sending}
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 px-6 py-2 text-white rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#59B997" }}
          disabled={sending}
        >
          {sending ? (
            <>
              <FiRefreshCw className="animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <FiSend />
              Kirim ke Semua Donatur
            </>
          )}
        </button>
      </form>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead style={{ backgroundColor: "#59B997" }} className="text-white">
            <tr>
              <th className="px-4 py-2 text-left">Jenis</th>
              <th className="px-4 py-2 text-left">Pesan</th>
              <th className="px-4 py-2 text-left">Tanggal Kirim</th>
              <th className="px-4 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-400">
                  <FiRefreshCw className="animate-spin inline mr-2" />
                  Memuat data...
                </td>
              </tr>
            ) : notifikasiList.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-400">
                  Tidak ada notifikasi.
                </td>
              </tr>
            ) : (
              notifikasiList.map((item) => (
                <tr
                  key={item.notifikasi_id}
                  className="hover:bg-gray-50 border-t border-gray-200 transition"
                >
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.tipe === "progres_pembangunan"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {item.tipe === "progres_pembangunan" ? "Progress Pembangunan" : "Target Proyek Tercapai"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.judul}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleHapus(item.notifikasi_id)}
                      className="text-red-500 hover:text-red-700 text-sm p-1 rounded hover:bg-red-50 transition-colors"
                      title="Hapus notifikasi untuk semua donatur"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Notifikasi;