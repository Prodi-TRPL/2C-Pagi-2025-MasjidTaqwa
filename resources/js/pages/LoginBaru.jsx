import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import ForcedLogoutAlert from '../components/ui/ForcedLogoutAlert';

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
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (token && storedUser) {
    const user = JSON.parse(storedUser);

    if (user.role === 'admin') {
      navigate('/dashboardhome', { replace: true });
    } else if (user.role === 'donatur') {
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
      localStorage.setItem('user', JSON.stringify({
        name: user.nama || '',
        email: user.email || '',
        role: user.role || '',
      }));
      localStorage.setItem('role', user.role || '');
      
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
    <div className="flex h-screen overflow-hidden relative">
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
      {/* Left: Image for desktop */}
      <div className="hidden lg:block w-1/2">
        <img
          src="../img/bg-repeat.png"
          alt="Background"
          className="object-cover w-full h-full"
          style={{ height: '100vh' }}
        />
      </div>
      {/* Right: Login Form */}
      <div
        className="w-full lg:w-1/2 p-6 sm:p-8 md:p-12 bg-gray-100"
      >
        <div className="p-6 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-4">Masuk</h1>
          
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
            <div className="bg-white p-6 rounded-lg shadow-md">
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
                    className={`w-full border ${verificationError ? 'border-red-500' : 'border-gray-300'} rounded-md py-3 px-3 text-center text-lg tracking-widest focus:outline-none focus:border-blue-500`}
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
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md py-2 px-4 w-full flex items-center justify-center"
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
                    className="border border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold rounded-md py-2 px-4 w-full flex items-center justify-center"
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
                    className="text-gray-500 hover:text-gray-700 text-center text-sm"
                  >
                    Kembali ke login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:border-blue-500`}
                  required
                />
              </div>
              
              {/* Password Input */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-600">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:border-blue-500`}
                  required
                />
              </div>
              
              {/* Remember Me Checkbox */}
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="mr-2"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label htmlFor="remember" className="text-gray-600">
                  Ingat Saya
                </label>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mb-4 text-red-600 font-semibold">
                  {error}
                </div>
              )}
              
              {/* Forgot Password Link */}
              <div className="mb-6 text-blue-500">
                <a href="/lupapassword" className="hover:underline">
                  Lupa Kata Sandi?
                </a>
              </div>
              
              {/* Login Button */}
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full flex items-center justify-center"
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
            </form>
          )}
          {/* Sign up  Link */}
          <div className="mt-6 text-blue-500 text-center">
            <p className='text-black'>Belum punya akun?</p>
            <Link to="/signup" className="hover:underline">
              Daftar Sekarang
            </Link>
          </div>
          {/* Footer */}
          <div className="mt-6 text-gray-600 text-center">
            <p>&copy;Copyright 2025 Masjid Taqwa Muhammadiyah. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginBaru;
