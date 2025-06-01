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
      // Kirim data form ke Laravel API
      const response = await axios.post("/api/donasi", formData);
      const { snap_token } = response.data;

      // Jalankan Midtrans Snap di React
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-10 px-4">
      <div className="max-w-md w-full p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Form Donasi</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600">Nama:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600">Jumlah Donasi (Rp):</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#59B997] text-white px-4 py-2 rounded hover:bg-[#47a07f] disabled:opacity-50"
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
