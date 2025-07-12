import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const LupaPassword = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: verification code, 3: new password
  const [userId, setUserId] = useState(null);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleVerificationCodeChange = (e) => {
    // Only allow 6 digits
    const value = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
    setVerificationCode(value);
    setError('');
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    setError('');
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setError('');
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email tidak boleh kosong');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Format email tidak valid');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('/api/forgot-password', { email });
      setStep(2); // Move to verification code step
      
      // Check if email was sent successfully
      if (response.data.email_sent) {
        Swal.fire({
          icon: 'success',
          title: 'Kode Terkirim',
          text: 'Kode reset password telah dikirim ke email Anda.'
        });
      } else {
        // Email failed but code was generated
        Swal.fire({
          icon: 'warning',
          title: 'Peringatan',
          text: response.data.message || 'Kode reset password dibuat, tapi gagal dikirim via email. Coba lagi nanti.'
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response && error.response.status === 404) {
        setError('Email tidak terdaftar');
      } else {
        setError(error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      setError('Kode verifikasi harus 6 digit');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('/api/verify-reset-code', { 
        email, 
        code: verificationCode 
      });
      
      setUserId(response.data.user_id);
      setStep(3); // Move to new password step
    } catch (error) {
      console.error('Verify code error:', error);
      setError(error.response?.data?.message || 'Kode verifikasi tidak valid atau sudah kadaluarsa.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword) {
      setError('Password baru tidak boleh kosong');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak sesuai');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('/api/reset-password', {
        user_id: userId,
        code: verificationCode,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Password berhasil diubah. Silakan login dengan password baru Anda.',
        confirmButtonText: 'Ke Halaman Login'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/loginbaru';
        }
      });
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.response?.data?.message || 'Terjadi kesalahan saat reset password. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleRequestCode} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                Email Pengguna
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                value={email}
                onChange={handleEmailChange}
                required
                placeholder="Masukkan email terdaftar"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 px-4 w-full flex items-center justify-center transition-colors"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mengirim...
                </>
              ) : "Kirim Kode Reset"}
            </button>
          </form>
        );
        
      case 2:
        return (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <div>
              <p className="text-gray-600 mb-4">
                Kode reset password telah dikirim ke email <span className="font-medium">{email}</span>.
                Silakan masukkan kode 6 digit untuk melanjutkan.
              </p>
              <label htmlFor="verification_code" className="block text-gray-700 font-medium mb-1">
                Kode Verifikasi
              </label>
              <input
                type="text"
                id="verification_code"
                name="verification_code"
                className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg py-3 px-3 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={verificationCode}
                onChange={handleVerificationCodeChange}
                placeholder="000000"
                maxLength={6}
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 px-4 w-full flex items-center justify-center transition-colors"
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memverifikasi...
                </>
              ) : "Verifikasi Kode"}
            </button>
            
            <button
              type="button"
              onClick={handleRequestCode}
              className="w-full border border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold rounded-lg py-3 px-4 flex items-center justify-center transition-colors"
              disabled={loading}
            >
              Kirim Ulang Kode
            </button>
          </form>
        );
        
      case 3:
        return (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label htmlFor="new_password" className="block text-gray-700 font-medium mb-1">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                value={newPassword}
                onChange={handleNewPasswordChange}
                minLength={8}
                required
                placeholder="Minimal 8 karakter"
              />
            </div>
            
            <div>
              <label htmlFor="confirm_password" className="block text-gray-700 font-medium mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                placeholder="Ulangi kata sandi"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 px-4 w-full flex items-center justify-center transition-colors"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : "Ubah Kata Sandi"}
            </button>
          </form>
        );
        
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Lupa Kata Sandi';
      case 2:
        return 'Masukkan Kode Verifikasi';
      case 3:
        return 'Buat Kata Sandi Baru';
      default:
        return 'Lupa Kata Sandi';
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" 
      style={{
        backgroundImage: `url('../img/bg-repeat.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
      
      {/* Card Container */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="bg-white bg-opacity-90 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          
          {/* Left: Logo/Image Section */}
          <motion.div 
            className="bg-white p-4 md:p-8 flex flex-col justify-center items-center md:w-1/3"
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            exit={{ x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src="../img/logoSidontaq.jpeg" 
              alt="Masjid Taqwa Logo" 
              className="w-32 h-32 md:w-48 md:h-48 object-contain"
            />
          </motion.div>
          
          {/* Right: Form Section */}
          <motion.div 
            className="p-8 md:w-2/3 md:p-10"
            initial={{ x: 50 }}
            animate={{ x: 0 }}
            exit={{ x: 100 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{getStepTitle()}</h1>
                <a
                  href="/"
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  aria-label="Back to homepage"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Kembali</span>
                </a>
              </div>
              
              {/* Step indicators */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center w-full">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
                    1
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${step > 1 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
                    2
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${step > 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
                    3
                  </div>
                </div>
              </div>
              
              {renderStepContent()}
              
              <div className="mt-6 text-center">
                <Link to="/loginbaru" className="text-blue-600 hover:text-blue-800 font-medium">
                  Kembali ke Masuk
                </Link>
              </div>
              
              {/* Footer */}
              <div className="mt-8 text-gray-600 text-center text-xs">
                <p>&copy;Copyright 2025 Masjid Taqwa Muhammadiyah. All rights reserved.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LupaPassword;
