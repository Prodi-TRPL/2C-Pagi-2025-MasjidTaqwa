import React, { useState } from "react";
import axios from "axios";
import 'aos/dist/aos.css';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

const DonationFirstPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
  });

  const [loading, setLoading] = useState(false);
  const [activeAmount, setActiveAmount] = useState(null);

  const quickAmounts = [
    { value: 10000, label: "Rp10.000" },
    { value: 50000, label: "Rp50.000" },
    { value: 100000, label: "Rp100.000" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For amount field, ensure value is not negative
    if (name === "amount") {
      // Convert to number, ensure it's not negative, then back to string
      const numValue = Math.max(0, Number(value));
      setFormData({...formData, [name]: numValue.toString()});
      setActiveAmount(null); // Reset active button when manually changing
    } else {
      setFormData({...formData, [name]: value});
    }
  };

  const handleQuickAmountSelect = (amount) => {
    setFormData({...formData, amount: amount.toString()});
    setActiveAmount(amount);
  };

  const handleIncrement = () => {
    // Get current amount, ensure it's a number (default to 0)
    const currentAmount = parseInt(formData.amount) || 0;
    // Add 10000 (increment by 10K)
    const newAmount = currentAmount + 10000;
    setFormData({...formData, amount: newAmount.toString()});
    setActiveAmount(null); // Reset active button when using increment
  };

  const handleDecrement = () => {
    // Get current amount, ensure it's a number (default to 0)
    const currentAmount = parseInt(formData.amount) || 0;
    // Subtract 10000 (decrement by 10K), but don't go below 0
    const newAmount = Math.max(0, currentAmount - 10000);
    setFormData({...formData, amount: newAmount.toString()});
    setActiveAmount(null); // Reset active button when using decrement
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#59B997] transition"
              placeholder="Masukkan nama lengkap Anda"
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
              placeholder="Masukkan email aktif Anda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Donasi (Rp)</label>
            
            {/* Quick Amount Selection Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount.value}
                  type="button"
                  className={`py-2 px-2 rounded-lg border transition-all ${
                    activeAmount === amount.value
                      ? "bg-[#59B997] text-white border-[#59B997]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-[#e6f5f0] hover:border-[#59B997]"
                  }`}
                  onClick={() => handleQuickAmountSelect(amount.value)}
                >
                  {amount.label}
                </button>
              ))}
            </div>
            
            {/* Amount Input with Increment/Decrement Buttons */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={handleDecrement}
                className="p-2 border border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <RemoveIcon fontSize="small" />
              </button>
              
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border-y border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#59B997] transition text-center"
                placeholder="Masukkan jumlah donasi"
              />
              
              <button
                type="button"
                onClick={handleIncrement}
                className="p-2 border border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <AddIcon fontSize="small" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-1">Minimal donasi Rp10.000</p>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading || !formData.amount || parseInt(formData.amount) < 10000}
              className="w-full bg-[#59B997] text-white font-semibold py-3 rounded-lg hover:bg-[#47a07f] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Donasi Sekarang"}
            </button>
            {parseInt(formData.amount) > 0 && parseInt(formData.amount) < 10000 && (
              <p className="text-xs text-red-500 mt-1 text-center">Minimal donasi Rp10.000</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationFirstPage;
