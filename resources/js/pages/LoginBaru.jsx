import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import ForcedLogoutAlert from '../components/ui/ForcedLogoutAlert';
import { motion } from 'framer-motion';
import { saveUserData, isLoggedIn, getCurrentUser } from '../utils/auth';

const LoginBaru = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verifiedStatus, setVerifiedStatus] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

useEffect(() => {
  if (isLoggedIn()) {
    const user = getCurrentUser();
    
    if (user && user.role === 'admin') {
      navigate('/dashboardhome', { replace: true });
    } else if (user && user.role === 'donatur') {
      navigate('/', { replace: true });
    }
  }
    
    // Check for verification success from URL parameters
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('verification') === 'success') {
      setVerificationSuccess(true);
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Verifikasi Berhasil!',
        text: 'Email Anda berhasil diverifikasi. Silakan login untuk melanjutkan.',
      });
    }
    
    if (queryParams.get('verified') === 'true') {
      setVerifiedStatus(true);
    }
  }, [navigate, location]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleRememberChange = (e) => {
    setRemember(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail('');
    setLoading(true);
    
    try {
      const response = await axios.post('/api/login', {
        email,
        password,
      });
      
      // Get data from response
      const { token, user, message, status } = response.data;
      
      // Check if email is unverified
      if (status === 'unverified') {
        setUnverifiedEmail(email);
        setLoading(false);
        setShowVerificationForm(true);
        return;
      }
      
      // If we get here, login was successful
      localStorage.setItem('token', token);
      saveUserData(user);
      
      await Swal.fire({
        icon: 'success',
        title: 'Login berhasil!',
        text: 'Selamat datang kembali di platform kami 🎉',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
        position: 'center',
      });
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/dashboardhome', { replace: true });
      } else if (user.role === 'donatur') {
        navigate('/', { replace: true }); // ini landing page donatur
      } else {
        setError('Role tidak dikenali, silakan hubungi admin.');
      }

    } catch (err) {
      // Handle specific error response from server
      if (err.response?.status === 403 && err.response?.data?.status === 'unverified') {
        // Handle unverified email case
        setUnverifiedEmail(err.response.data.email);
        setShowVerificationForm(true);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login gagal. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle verification code change
  const handleVerificationCodeChange = (e) => {
    // Only allow 6 digits
    const value = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
    setVerificationCode(value);
    setVerificationError('');
  };

  // Handle verify email
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      setVerificationError('Kode verifikasi harus 6 digit');
      return;
    }
    
    setVerifyingCode(true);
    
    try {
      const response = await axios.post('/api/verify-email', {
        email: unverifiedEmail,
        code: verificationCode
      });
      
      // Verification successful
      Swal.fire({
        icon: 'success',
        title: 'Verifikasi Berhasil!',
        text: 'Email Anda telah diverifikasi. Silakan login untuk melanjutkan.',
      }).then(() => {
        setShowVerificationForm(false);
        setUnverifiedEmail('');
        setVerificationCode('');
      });
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationError(
        error.response?.data?.message || 
        'Terjadi kesalahan saat verifikasi. Silakan coba lagi.'
      );
    } finally {
      setVerifyingCode(false);
    }
  };

  // Handle resend verification code
  const handleResendVerificationCode = async () => {
    try {
      setVerifyingCode(true);
      
      const response = await axios.post('/api/resend-verification', {
        email: unverifiedEmail
      });
      
      // Check if email was sent successfully
      if (response.data.email_sent) {
        Swal.fire({
          icon: 'success',
          title: 'Kode Terkirim!',
          text: 'Kode verifikasi baru telah dikirim ke email Anda.',
        });
      } else {
        // Email failed but code was generated
        Swal.fire({
          icon: 'warning',
          title: 'Peringatan',
          text: response.data.message || 'Kode verifikasi dibuat, tapi gagal dikirim via email. Silakan coba lagi nanti.',
        });
      }
    } catch (error) {
      console.error('Resend code error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengirim Kode',
        text: error.response?.data?.message || 'Terjadi kesalahan saat mengirim ulang kode. Silakan coba lagi.',
      });
    } finally {
      setVerifyingCode(false);
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
      
      {/* Overlay background utama halaman */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(to top, rgba(0, 0, 0, 0.4), rgba(89, 185, 151, 20))`,
        }}
      ></div>
      {/* Login Card */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div 
          className="bg-white bg-opacity-90 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          
                      {/* Left: Image with Overlay Section */}
            <motion.div 
              className="relative md:w-2/5 flex flex-col"
              initial={{ x: -50 }}
              animate={{ x: 0 }}
              exit={{ x: -100 }}
              transition={{ duration: 0.5 }}
              style={{
                backgroundImage: `url('/img/masjid-hero.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Dark overlay */}
              <div
                  className="absolute inset-0 z-10"
                  style={{
                    background: `linear-gradient(to bottom right, rgba(89, 185, 151, 0.5), rgba(0, 0, 0, 0.4))`,
                  }}
                ></div>              
              {/* Content container divided into two sections with more balanced spacing */}
              <div className="relative flex flex-col justify-evenly h-full py-10 px-4 text-white z-10">
                {/* Top section with logo */}
                <div className="flex justify-center items-center">
                  <div className="bg-white p-4 rounded-full shadow-lg">
                    <img 
                      src="../img/logoSidontaq.jpeg" 
                      alt="Masjid Taqwa Logo" 
                      className="w-24 h-24 md:w-28 md:h-28 object-contain rounded-full"
                    />
                  </div>
                </div>
                
                {/* Bottom section with welcome text */}
                <div className="text-center mt-8 mb-6">
                  <h2 className="text-2xl font-bold mb-2">Selamat Datang</h2>
                  <p className="text-sm md:text-base opacity-90">
                    Sistem Informasi Donasi dan Pengelolaan Keuangan Masjid Taqwa Muhammadiyah
                  </p>
                </div>
              </div>
            </motion.div>

          {/* Right: Login Form */}
          <motion.div 
            className="p-8 md:w-3/5 md:p-10"
            initial={{ x: 50 }}
            animate={{ x: 0 }}
            exit={{ x: 100 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-md mx-auto">
              {/* Move the back button here */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Masuk ke Akun Anda</h1>
                <a 
                  href="/"
                  className="flex items-center space-x-1 text-[#479479] hover:text-[#59B997] transition-colors duration-300 relative group"
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

                  <span className="relative">
                    Kembali
                    <span
                      className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#4DA987] transition-all duration-300 group-hover:w-full"
                    ></span>
                  </span>
                </a>
              </div>
              
              {/* Forced Logout Alert */}
              <ForcedLogoutAlert />
              
              {verificationSuccess && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Email Anda berhasil diverifikasi. Silakan login untuk melanjutkan.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {verifiedStatus && (
                <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Email Anda sudah diverifikasi sebelumnya. Silakan login untuk melanjutkan.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {showVerificationForm ? (
                <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow">
                  <div className="flex items-center mb-4">
                    <svg className="h-6 w-6 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-xl font-semibold">Verifikasi Email</h2>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    Email Anda <span className="font-medium">{unverifiedEmail}</span> belum diverifikasi.
                    Silakan masukkan kode verifikasi yang telah dikirim ke email Anda.
                  </p>
                  
                  <form onSubmit={handleVerifyEmail}>
                    <div className="mb-4">
                      <label htmlFor="verification_code" className="block text-gray-600 mb-2">
                        Kode Verifikasi
                      </label>
                      <input
                        type="text"
                        id="verification_code"
                        name="verification_code"
                        className={`w-full border ${verificationError ? 'border-red-500' : 'border-gray-300'} rounded-md py-3 px-3 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        value={verificationCode}
                        onChange={handleVerificationCodeChange}
                        placeholder="000000"
                        maxLength={6}
                      />
                      {verificationError && <p className="text-red-500 text-sm mt-1">{verificationError}</p>}
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      <button 
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md py-2 px-4 w-full flex items-center justify-center transition-colors"
                        disabled={verifyingCode || verificationCode.length !== 6}
                      >
                        {verifyingCode ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Memverifikasi...
                          </>
                        ) : "Verifikasi Email"}
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleResendVerificationCode}
                        className="border border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold rounded-md py-2 px-4 w-full flex items-center justify-center transition-colors"
                        disabled={verifyingCode}
                      >
                        {verifyingCode ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Mengirim...
                          </>
                        ) : "Kirim Ulang Kode"}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setShowVerificationForm(false);
                          setVerificationCode('');
                          setVerificationError('');
                        }}
                        className="text-gray-500 hover:text-gray-700 text-center text-sm transition-colors"
                      >
                        Kembali ke login
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={handleEmailChange}
                      className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                      required
                    />
                  </div>
                  
                  {/* Password Input */}
                  <div>
                    <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
                      Kata Sandi
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={handlePasswordChange}
                      className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                      required
                    />
                  </div>
                  
                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="remember"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={remember}
                        onChange={handleRememberChange}
                      />
                      <label htmlFor="remember" className="ml-2 block text-gray-700">
                        Ingat Saya
                      </label>
                    </div>
                    
                    <div className="text-sm">
                      <Link
                        to="/lupapassword"
                        className="text-[#479479] hover:text-[#59B997] font-medium transition-colors duration-300 relative group"
                      >
                        <span className="relative">
                          Lupa Kata Sandi?
                          <span
                            className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#4DA987] transition-all duration-300 group-hover:w-full"
                          ></span>
                        </span>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                  
                  {/* Login Button */}
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 px-4 w-full flex items-center justify-center transition-colors duration-300" 
                    style={{backgroundColor: loading ? '#4DA987' : '#59B997', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.30)',}}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#4DA987';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#59B997';
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Masuk...
                      </>
                    ) : "Masuk"}
                  </button>
                  
                  {/* Sign up Link */}
                  <div className="text-center pt-4">
                    <p className="text-gray-700 mb-1">Belum punya akun?</p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Link
                        to="/signup"
                        className="text-[#479479] hover:text-[#59B997] font-medium transition-colors duration-300"
                      >
                        Daftar Sekarang
                      </Link>
                    </motion.div>
                  </div>
                </form>
              )}
              
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

export default LoginBaru;
