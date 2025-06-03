import React, { useState } from "react";
import axios from "axios";
import 'aos/dist/aos.css';

const DonationFirstPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/donasi", formData);
      const { snap_token } = response.data;

      window.snap.pay(snap_token, {
        onSuccess: function(result) {
          alert("Pembayaran berhasil!");
          window.location.href = "/donasi";
        },
        onPending: function(result) {
          alert("Menunggu pembayaran");
        },
        onError: function(result) {
          alert("Pembayaran gagal");
        },
        onClose: function() {
          alert("Kamu menutup halaman pembayaran.");
        },
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengirim data donasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4 py-12">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 transition-all">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Donasi Sekarang
        </h2>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#59B997] transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Aktif</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#59B997] transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Donasi (Rp)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#59B997] transition"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#59B997] text-white font-semibold py-2 rounded-lg hover:bg-[#47a07f] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Donasi Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationFirstPage;
