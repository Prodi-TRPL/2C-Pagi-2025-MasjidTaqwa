import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const LupaPassword = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fadeIn, setFadeIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: verification code, 3: new password
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    setFadeIn(true);
  }, []);

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
          <form onSubmit={handleRequestCode} className="w-full max-w-md">
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-600 mb-2">
                Email Pengguna
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:border-blue-500`}
                value={email}
                onChange={handleEmailChange}
                required
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 flex items-center justify-center"
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
          <form onSubmit={handleVerifyCode} className="w-full max-w-md">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Kode reset password telah dikirim ke email <span className="font-medium">{email}</span>.
                Silakan masukkan kode 6 digit untuk melanjutkan.
              </p>
              <label htmlFor="verification_code" className="block text-gray-600 mb-2">
                Kode Verifikasi
              </label>
              <input
                type="text"
                id="verification_code"
                name="verification_code"
                className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md py-3 px-3 text-center text-lg tracking-widest focus:outline-none focus:border-blue-500`}
                value={verificationCode}
                onChange={handleVerificationCodeChange}
                placeholder="000000"
                maxLength={6}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 flex items-center justify-center"
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
              className="w-full mt-3 border border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold rounded-md py-2 px-4 flex items-center justify-center"
              disabled={loading}
            >
              Kirim Ulang Kode
            </button>
          </form>
        );
        
      case 3:
        return (
          <form onSubmit={handleResetPassword} className="w-full max-w-md">
            <div className="mb-4">
              <label htmlFor="new_password" className="block text-gray-600 mb-2">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:border-blue-500`}
                value={newPassword}
                onChange={handleNewPasswordChange}
                minLength={8}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="confirm_password" className="block text-gray-600 mb-2">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:border-blue-500`}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 flex items-center justify-center"
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
    <div className={`flex h-screen overflow-hidden relative transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* Left: Background Image */}
      <div className="hidden lg:block w-1/2">
        <img
          src="../img/bg-repeat.png"
          alt="Background"
          className="object-cover w-full h-full"
          style={{ height: '100vh' }}
        />
      </div>
      {/* Right: Form Layout adjusted */}
      <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-12 bg-gray-100 flex flex-col items-center justify-center relative">
        {/* Back button top right */}
        <a
          href="/"
          className="absolute top-4 right-4 text-blue-500 hover:text-blue-700 flex items-center space-x-1"
          aria-label="Back to homepage"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Kembali</span>
        </a>
        
        <h1 className="text-2xl font-semibold mb-6 text-center">{getStepTitle()}</h1>
        
        {/* Step indicators */}
        <div className="flex justify-center mb-8 w-full max-w-md">
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
        
        <div className="mt-6 text-center w-full max-w-md">
          <Link to="/loginbaru" className="text-blue-500 hover:underline">
            Kembali ke Masuk
          </Link>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-gray-600 text-center">
          <p>&copy;Copyright 2025 Masjid Taqwa Muhammadiyah. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LupaPassword;
