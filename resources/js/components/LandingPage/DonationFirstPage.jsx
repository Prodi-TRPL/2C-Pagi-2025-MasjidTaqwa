import React, { useState, useEffect } from "react";
import axios from "axios";
import 'aos/dist/aos.css';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

const DonationFirstPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    is_anonymous: false
  });

  // Display value for the amount (formatted)
  const [displayAmount, setDisplayAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [activeAmount, setActiveAmount] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [notificationSent, setNotificationSent] = useState(false);

  // Helper function to safely get item from localStorage
  const safeGetItem = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error("localStorage error:", e);
      return null;
    }
  };

  // Fetch user data if authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = safeGetItem('token');
        
        // If no token, user is not logged in
        if (!token) {
          console.log("User not authenticated - no token found");
          setIsAuthenticated(false);
          return;
        }
        
        // If token exists, try to get user profile
        const response = await axios.get('/api/donatur/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data) {
          console.log("User authenticated:", response.data);
          setUser(response.data);
          setIsAuthenticated(true);
          
          // Pre-fill form with user data
          setFormData(prevData => ({
            ...prevData,
            name: response.data.nama || "",
            email: response.data.email || "",
            is_anonymous: false
          }));
        }
      } catch (error) {
        console.log("User authentication error:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  const quickAmounts = [
    { value: 10000, label: "Rp10.000" },
    { value: 50000, label: "Rp50.000" },
    { value: 100000, label: "Rp100.000" },
  ];

  // Helper function for formatting currency with Indonesian format
  const formatCurrency = (value) => {
    // Remove non-numeric characters
    const numericValue = value.toString().replace(/[^0-9]/g, '');
    // Format with thousand separators (dots)
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Helper function to unformat the currency to get the numeric value
  const unformatCurrency = (value) => {
    // Remove all non-numeric characters
    return value.toString().replace(/[^0-9]/g, '');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "amount") {
      // For amount field, we need to format it
      const unformattedValue = unformatCurrency(value);
      
      // Ensure it's not negative
      const numValue = Math.max(0, Number(unformattedValue));
      
      // Update the actual form data with numeric value
      setFormData({...formData, [name]: numValue.toString()});
      
      // Update the display value with formatted currency
      setDisplayAmount(formatCurrency(numValue.toString()));
      
      // Reset active button when manually changing
      setActiveAmount(null);
    } else if (type === "checkbox") {
      // For checkbox inputs, use the checked property
      setFormData({...formData, [name]: checked});
    } else {
      // For other fields, just update normally
      setFormData({...formData, [name]: value});
    }
  };

  // Handle anonymous checkbox toggle for authenticated users
  const handleAnonymousToggle = (e) => {
    setFormData({...formData, is_anonymous: e.target.checked});
  };

  const handleQuickAmountSelect = (amount) => {
    setFormData({...formData, amount: amount.toString()});
    setDisplayAmount(formatCurrency(amount.toString()));
    setActiveAmount(amount);
  };

  const handleIncrement = () => {
    // Get current amount, ensure it's a number (default to 0)
    const currentAmount = parseInt(formData.amount) || 0;
    // Add 10000 (increment by 10K)
    const newAmount = currentAmount + 10000;
    setFormData({...formData, amount: newAmount.toString()});
    setDisplayAmount(formatCurrency(newAmount.toString()));
    setActiveAmount(null); // Reset active button when using increment
  };

  const handleDecrement = () => {
    // Get current amount, ensure it's a number (default to 0)
    const currentAmount = parseInt(formData.amount) || 0;
    // Subtract 10000 (decrement by 10K), but don't go below 0
    const newAmount = Math.max(0, currentAmount - 10000);
    setFormData({...formData, amount: newAmount.toString()});
    setDisplayAmount(formatCurrency(newAmount.toString()));
    setActiveAmount(null); // Reset active button when using decrement
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.name.trim()) {
      setError("Nama harus diisi");
      return false;
    }
    
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Email tidak valid");
      return false;
    }
    
    const numericAmount = parseInt(formData.amount) || 0;
    if (!formData.amount || numericAmount < 10000) {
      setError("Jumlah donasi minimal Rp10.000");
      return false;
    }
    
    setError(null);
    return true;
  };

  // Check for new notifications after successful payment
  const checkForNotifications = async () => {
    try {
      // Only check for notifications if user is authenticated
      if (!isAuthenticated || !user) return;
      
      const token = safeGetItem('token');
      if (!token) return;
      
      // Wait a moment for the backend to create the notification
      setTimeout(async () => {
        try {
          // Check if there are new notifications
          await axios.get('/api/notifikasi/check-new', {
            params: { since: Date.now() - 60000 }, // Check for notifications in the last minute
            headers: { Authorization: `Bearer ${token}` },
          });
          
          setNotificationSent(true);
        } catch (error) {
          console.error("Error checking for notifications:", error);
        }
      }, 2000); // Wait 2 seconds for backend processing
    } catch (error) {
      console.error("Error in checkForNotifications:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);

    // Prepare donation data
    const donationData = {
      name: formData.is_anonymous ? "Donatur Anonim" : formData.name,
      email: formData.email,
      amount: formData.amount,
      is_anonymous: formData.is_anonymous
    };
    
    // If user is authenticated, include user_id
    if (isAuthenticated && user) {
      console.log("Adding authenticated user ID to donation:", user);
      donationData.user_id = user.pengguna_id;
    }

    console.log("Submitting donation form:", donationData);

    try {
      // Use the production Midtrans endpoint
      console.log("Sending request to donation API...");
      const response = await axios.post("/api/donasi", donationData);
      console.log("Backend response:", response.data);

      if (!response.data.snap_token) {
        console.error("No snap token in response:", response.data);
        setError("Invalid response from server. Missing payment token.");
        setLoading(false);
        return;
      }
      
      // Check if snap is available
      if (typeof window.snap === 'undefined') {
        console.error("Midtrans Snap not loaded!");
        alert("Pembayaran gateway tidak tersedia. Silakan coba lagi nanti.");
        setLoading(false);
        return;
      }
      
      // Open Midtrans popup
      const { snap_token } = response.data;
      console.log("Opening Midtrans popup with token:", snap_token);

      window.snap.pay(snap_token, {
        onSuccess: function(result) {
          console.log("Payment success:", result);
          
          // Notify backend about successful payment
          axios.post(`/api/donasi/callback`, { 
            order_id: response.data.order_id,
            payment_status: 'success',
            transaction_status: 'success',
            payment_type: result.payment_type || 'midtrans'
          })
          .then(callbackResponse => {
            console.log("Success callback sent to backend:", callbackResponse.data);
            
            // Store payment info for display
            setPaymentInfo({
              amount: formData.amount,
              method: result.payment_type || 'midtrans',
              orderId: response.data.order_id
            });
            
            // Set payment success state
            setPaymentSuccess(true);
            
            // Check for notifications if user is authenticated
            if (isAuthenticated) {
              checkForNotifications();
            }
            
            // Reset form after successful payment
            setFormData({
              name: isAuthenticated ? user?.nama || "" : "",
              email: isAuthenticated ? user?.email || "" : "",
              amount: "",
              is_anonymous: false
            });
            
            // Also reset the display amount
            setDisplayAmount("");
            
            setActiveAmount(null);
          })
          .catch(error => {
            console.error("Error sending success callback:", error);
            // Try again with simpler payload in case of error
            axios.post(`/api/donasi/callback`, { 
              order_id: response.data.order_id,
              payment_status: 'success'
            }).catch(e => console.error("Retry callback also failed:", e));
            
            // Still show success even if callback had issues
            setPaymentSuccess(true);
            setPaymentInfo({
              amount: formData.amount,
              method: result.payment_type || 'midtrans',
              orderId: response.data.order_id
            });
            
            // Check for notifications even if callback had issues
            if (isAuthenticated) {
              checkForNotifications();
            }
          });
        },
        onPending: function(result) {
          console.log("Payment pending:", result);
          alert("Menunggu pembayaran. Silakan selesaikan pembayaran Anda.");
        },
        onError: function(result) {
          console.error("Payment error:", result);
          setError("Pembayaran gagal: " + (result.message || "Terjadi kesalahan"));
          alert("Pembayaran gagal: " + (result.message || "Terjadi kesalahan"));
        },
        onClose: function() {
          console.log("Payment widget closed");
          // Mark donation as expired when user closes the payment popup
          try {
            axios.post(`/api/donasi/cancel`, { order_id: response.data.order_id })
              .then(response => {
                console.log("Donation cancelled:", response.data);
              })
              .catch(error => {
                console.error("Error cancelling donation:", error);
              });
          } catch (error) {
            console.error("Error handling payment close:", error);
          }
        }
      });
    } catch (error) {
      console.error("Error during donation submission:", error);
      
      let errorMessage = "Gagal mengirim data donasi.";
      
      if (error.response) {
        console.error("Error response:", error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format currency to Indonesian Rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format initial display value when component loads or when amount changes from outside
  useEffect(() => {
    if (formData.amount) {
      setDisplayAmount(formatCurrency(formData.amount));
    }
  }, []);

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4 py-12">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 transition-all">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Donasi Sekarang
        </h2>

        {paymentSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg animate__animated animate__fadeIn">
            <div className="flex items-center mb-2">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="font-bold text-lg">Donasi Berhasil!</p>
            </div>
            
            <p className="mb-2">Terima kasih atas donasi Anda sebesar {paymentInfo ? formatRupiah(paymentInfo.amount) : ''}. Semoga kebaikan Anda dibalas berlipat ganda.</p>
            
            {isAuthenticated ? (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                <p className="font-medium">Notifikasi telah dikirim!</p>
                <p className="text-sm mt-1">Anda dapat melihat detail donasi di halaman notifikasi.</p>
                <a 
                  href="/notifikasi" 
                  className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lihat Notifikasi
                </a>
              </div>
            ) : (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                <p className="font-medium">Ingin melihat riwayat donasi Anda?</p>
                <p className="text-sm mt-1">Daftar akun untuk melacak semua donasi dan mendapatkan akses ke fitur donatur.</p>
                <a 
                  href="/signup" 
                  className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Daftar Sekarang
                </a>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {isAuthenticated && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
            <div className="mr-3 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <img 
                src={user?.profile_image || "/img/user/admin.jpeg"} 
                alt={user?.nama} 
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium">Anda login sebagai {user?.nama}</p>
              <p className="text-xs">Informasi donasi akan menggunakan data profil Anda</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            {isAuthenticated ? (
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={true}
                  className="w-full px-4 py-2 border rounded-lg shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                />
                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    id="is_anonymous"
                    name="is_anonymous"
                    checked={formData.is_anonymous}
                    onChange={handleAnonymousToggle}
                    className="h-4 w-4 text-[#59B997] focus:ring-[#59B997] border-gray-300 rounded"
                  />
                  <label htmlFor="is_anonymous" className="ml-2 block text-sm text-gray-700">
                    Tampilkan sebagai "Donatur Anonim"
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.is_anonymous 
                    ? "Nama Anda akan disembunyikan dalam publikasi donasi" 
                    : "Nama diambil dari akun Anda"}
                </p>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#59B997] transition"
                  placeholder="Masukkan nama lengkap atau 'Donatur Anonim'"
                />
                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    id="is_anonymous"
                    name="is_anonymous"
                    checked={formData.is_anonymous}
                    onChange={handleAnonymousToggle}
                    className="h-4 w-4 text-[#59B997] focus:ring-[#59B997] border-gray-300 rounded"
                  />
                  <label htmlFor="is_anonymous" className="ml-2 block text-sm text-gray-700">
                    Saya ingin berdonasi sebagai "Donatur Anonim"
                  </label>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Aktif</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isAuthenticated}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#59B997] transition ${isAuthenticated ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : ''}`}
              placeholder="Masukkan email aktif Anda"
            />
            {isAuthenticated && (
              <p className="text-xs text-gray-500 mt-1">Email diambil dari akun Anda</p>
            )}
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
                type="text"
                name="amount"
                value={displayAmount}
                onChange={handleChange}
                required
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

          {/* Sign up prompt for non-authenticated users */}
          {!isAuthenticated && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Belum memiliki akun?</span> Dengan mendaftar, Anda dapat melacak riwayat donasi Anda kapanpun.
                  </p>
                </div>
              </div>
            </div>
          )}
          
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
