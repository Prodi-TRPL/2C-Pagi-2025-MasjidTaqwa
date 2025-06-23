import React, { useState, useEffect } from "react";
import { FiTrash2, FiRefreshCw, FiSend, FiUsers, FiCheck, FiX, FiAlertCircle } from "react-icons/fi";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

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
  
  // State for notification popup
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    type: "success", // success, error, warning
    duration: 3000,
  });

  const [formData, setFormData] = useState({
    jenis: "Progress Pembangunan",
    judul: "",
    pesan: "",
  });

  // Show notification popup
  const showNotification = (message, type = "success", duration = 3000) => {
    setNotification({
      visible: true,
      message,
      type,
      duration,
    });
    
    // Auto hide after duration
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, duration);
  };
  
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
      showNotification("Gagal memuat notifikasi", "error");
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
      showNotification("Judul tidak boleh kosong", "warning");
      return;
    }
    
    if (!formData.pesan.trim()) {
      showNotification("Isi pesan tidak boleh kosong", "warning");
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

      showNotification(`Notifikasi berhasil dikirim ke ${response.data.count} donatur`, "success");
      setFormData({ jenis: "Progress Pembangunan", judul: "", pesan: "" });
      fetchNotifications(); // Refresh list
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Failed to send notification:", error);
      showNotification("Gagal mengirim notifikasi", "error");
    } finally {
      setSending(false);
    }
  };

  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: null,
  });
  
  const openDeleteConfirm = (id) => {
    setConfirmDelete({
      show: true,
      id,
    });
  };
  
  const closeDeleteConfirm = () => {
    setConfirmDelete({
      show: false,
      id: null,
    });
  };
  
  const handleHapus = async () => {
    if (!confirmDelete.id) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/notifikasi/${confirmDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      showNotification("Notifikasi berhasil dihapus", "success");
      fetchNotifications(); // Refresh list
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Failed to delete notification:", error);
      showNotification("Gagal menghapus notifikasi", "error");
    } finally {
      closeDeleteConfirm();
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              Judul Notifikasi
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Update Pembangunan Masjid"
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
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Isi Pesan
          </label>
          <textarea
            required
            placeholder="Masukkan isi pesan notifikasi yang akan dikirim ke donatur..."
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
            style={{ outlineColor: "#59B997", minHeight: "100px" }}
            value={formData.pesan}
            onChange={(e) =>
              setFormData({ ...formData, pesan: e.target.value })
            }
            disabled={sending}
          />
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
              <th className="px-4 py-2 text-left">Judul</th>
              <th className="px-4 py-2 text-left">Isi Pesan</th>
              <th className="px-4 py-2 text-left">Tanggal Kirim</th>
              <th className="px-4 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-400">
                  <FiRefreshCw className="animate-spin inline mr-2" />
                  Memuat data...
                </td>
              </tr>
            ) : notifikasiList.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-400">
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
                  <td className="px-4 py-3">
                    <div className="max-w-xs truncate">{item.pesan || item.judul}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-4 py-3 text-center">
                                          <button
                      onClick={() => openDeleteConfirm(item.notifikasi_id)}
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
      
      {/* Confirmation Dialog for Delete */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            {/* Overlay/backdrop */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={closeDeleteConfirm}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            {/* Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full mx-auto relative z-[10000]"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiAlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Hapus Notifikasi
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Yakin ingin menghapus notifikasi ini untuk semua donatur? Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 flex justify-end gap-2">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                  onClick={closeDeleteConfirm}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none"
                  onClick={handleHapus}
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      
      {/* Notification Popup */}
      <AnimatePresence>
        {notification.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-[9998]"
          >
            <div 
              className={`rounded-lg shadow-xl px-6 py-4 flex items-center ${
                notification.type === "success" ? "bg-green-50 border-l-4 border-green-500" :
                notification.type === "error" ? "bg-red-50 border-l-4 border-red-500" :
                "bg-yellow-50 border-l-4 border-yellow-500"
              }`}
              style={{ minWidth: '300px', maxWidth: '450px' }}
            >
              <div className="mr-3">
                {notification.type === "success" ? (
                  <FiCheck className="h-6 w-6 text-green-500" />
                ) : notification.type === "error" ? (
                  <FiX className="h-6 w-6 text-red-500" />
                ) : (
                  <FiAlertCircle className="h-6 w-6 text-yellow-500" />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  notification.type === "success" ? "text-green-800" :
                  notification.type === "error" ? "text-red-800" :
                  "text-yellow-800"
                }`}>
                  {notification.message}
                </p>
              </div>
              <button 
                onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
                className="ml-6 text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifikasi;