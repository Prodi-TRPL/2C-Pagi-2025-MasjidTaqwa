import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    password_confirmation: ''
    // Removed nomor_hp field
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear specific error when user starts typing in a field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };
  
  const handleVerificationCodeChange = (e) => {
    // Only allow 6 digits
    const value = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
    setVerificationCode(value);
    if (verificationError) {
      setVerificationError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama tidak boleh kosong';
    }
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email tidak boleh kosong';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password tidak boleh kosong';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }
    
    // Validate password confirmation
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Konfirmasi password tidak boleh kosong';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Konfirmasi password tidak sesuai';
    }
    
    console.log('Validation errors:', newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // Prepare data
    const registrationData = {
      nama: formData.nama,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.password_confirmation
      // Removed nomor_hp field
    };
    
    // Log form data for debugging
    console.log('Form data being submitted:', registrationData);
    
    setLoading(true);
    
    try {
      // First try the simple registration endpoint to check for validation issues
      try {
        const validationCheck = await axios.post('/api/simple-register', registrationData);
        console.log('Validation check response:', validationCheck.data);
        
        if (!validationCheck.data.success) {
          console.error('Validation errors:', validationCheck.data.errors);
          setErrors(validationCheck.data.errors);
          setLoading(false);
          return;
        }
      } catch (validationError) {
        console.error('Validation check error:', validationError);
        if (validationError.response?.data?.errors) {
          setErrors(validationError.response.data.errors);
          setLoading(false);
          return;
        }
      }
      
      // Actual registration call
      const response = await axios.post('/api/register', registrationData);
      
      // Set registration success
      setRegistrationSuccess(true);
      setRegisteredEmail(response.data.email);
      
      // Show success message
      if (response.data.email_sent) {
        Swal.fire({
          icon: 'success',
          title: 'Pendaftaran Berhasil!',
          text: 'Silakan masukkan kode verifikasi yang telah dikirim ke email Anda.',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Pendaftaran Berhasil!',
          text: 'Terjadi masalah saat mengirim email verifikasi. Silakan klik tombol kirim ulang kode untuk mencoba lagi.',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        // Handle validation errors from API
        console.log('Validation errors from API:', error.response.data.errors);
        setErrors(error.response.data.errors);
      } else {
        // Generic error message
        Swal.fire({
          icon: 'error',
          title: 'Pendaftaran Gagal',
          text: error.response?.data?.message || 'Terjadi kesalahan saat pendaftaran. Silakan coba lagi.'
        });
      }
    } finally {
      // Always set loading to false after request completes
      setLoading(false);
    }
  };
  
  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setVerificationError('Kode verifikasi harus 6 digit');
      return;
    }
    
    setVerifyingCode(true);
    
    try {
      const response = await axios.post('/api/verify-email', {
        email: registeredEmail,
        code: verificationCode
      });
      
      // Verification successful
      Swal.fire({
        icon: 'success',
        title: 'Verifikasi Berhasil!',
        text: 'Email Anda telah diverifikasi. Silakan login untuk melanjutkan.',
        confirmButtonText: 'Ke Halaman Login'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/loginbaru');
        }
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
  
  const handleResendCode = async () => {
    try {
      setVerifyingCode(true);
      
      const response = await axios.post('/api/resend-verification', {
        email: registeredEmail
      });
      
      // Check if email was sent successfully
      if (response.data.email_sent) {
        Swal.fire({
          icon: 'success',
          title: 'Kode Terkirim!',
          text: 'Kode verifikasi baru telah dikirim ke email Anda.',
          confirmButtonText: 'OK'
        });
      } else {
        // Email failed to send but code was generated
        Swal.fire({
          icon: 'warning',
          title: 'Peringatan',
          text: response.data.message || 'Kode verifikasi dibuat, tapi gagal dikirim via email. Silakan coba lagi nanti.',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Resend code error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengirim Kode',
        text: error.response?.data?.message || 'Terjadi kesalahan saat mengirim ulang kode. Silakan coba lagi.',
        confirmButtonText: 'OK'
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
      
      {/* Registration Card */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div 
          className="bg-white bg-opacity-90 rounded-xl shadow-2xl overflow-hidden flex flex-col-reverse md:flex-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          
          {/* Left: Form Section */}
          <motion.div 
            className="p-8 md:w-3/5 md:p-10"
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            exit={{ x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Buat Akun Baru</h1>
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
              
              {registrationSuccess ? (
                <div className="bg-white bg-opacity-90 p-6 rounded-lg">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-center mb-2">Pendaftaran Berhasil!</h2>
                  
                  <p className="text-gray-600 text-center mb-6">
                    Kode verifikasi telah dikirim ke email <span className="font-medium">{registeredEmail}</span>.
                    Silakan masukkan kode 6 digit untuk mengaktifkan akun Anda.
                  </p>
                  
                  <div className="mb-6">
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
                      onClick={handleVerifyCode} 
                      className="text-white font-semibold rounded-md py-2 px-4 w-full flex items-center justify-center transition-colors duration-300"
                      style={{
                        backgroundColor: verifyingCode ? '#4DA987' : '#59B997', 
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.30)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4DA987';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#59B997';
                      }}
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
                      ) : "Verifikasi Sekarang"}
                    </button>
                    
                    <button
                      onClick={handleResendCode}
                      className="border border-[#59B997] text-[#479479] hover:bg-[#59B997]/10 font-semibold rounded-md py-2 px-4 w-full flex items-center justify-center transition-colors"
                      disabled={verifyingCode}
                    >
                      {verifyingCode ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-[#479479]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Mengirim...
                        </>
                      ) : "Kirim Ulang Kode"}
                    </button>
                    
                    <Link 
                      to="/loginbaru" 
                      className="text-[#479479] hover:text-[#59B997] text-center text-sm mt-2 transition-colors duration-300 relative group"
                    >
                      <span className="relative">
                        Sudah punya akun? Masuk di sini
                        <span
                          className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#4DA987] transition-all duration-300 group-hover:w-full"
                        ></span>
                      </span>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name and Email inputs in one row */}
                  <div className="flex flex-col md:flex-row md:space-x-4 space-y-5 md:space-y-0">
                    {/* Nama Input */}
                    <div className="flex-1">
                      <label htmlFor="nama" className="block text-gray-700 font-medium mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        id="nama"
                        name="nama"
                        className={`w-full border ${errors.nama ? 'border-red-500' : 'border-gray-300'} rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                        value={formData.nama}
                        onChange={handleChange}
                      />
                      {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama}</p>}
                    </div>
                    
                    {/* Email Input */}
                    <div className="flex-1">
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  
                  {/* Password and Confirm Password inputs in one row */}
                  <div className="flex flex-col md:flex-row md:space-x-4 space-y-5 md:space-y-0">
                    {/* Password Input */}
                    <div className="flex-1">
                      <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
                        Kata Sandi
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                        value={formData.password}
                        onChange={handleChange}
                      />
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                    
                    {/* Confirm Password Input */}
                    <div className="flex-1">
                      <label htmlFor="password_confirmation" className="block text-gray-700 font-medium mb-1">
                        Konfirmasi Kata Sandi
                      </label>
                      <input
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        className={`w-full border ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300'} rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                        value={formData.password_confirmation}
                        onChange={handleChange}
                      />
                      {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>}
                    </div>
                  </div>
                  
                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    className="text-white font-semibold rounded-lg py-3 px-4 w-full flex items-center justify-center transition-colors duration-300 mt-6"
                    style={{
                      backgroundColor: loading ? '#4DA987' : '#59B997', 
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.30)',
                    }}
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
                        Mendaftar...
                      </>
                    ) : "Daftar"}
                  </button>
                  
                  {/* Login Link */}
                  <div className="text-center pt-4">
                    <p className="text-gray-700 mb-1">Sudah punya akun?</p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Link 
                        to="/loginbaru" 
                        className="text-[#479479] hover:text-[#59B997] font-medium transition-colors duration-300 relative group"
                      >
                        <span className="relative">
                          Masuk Sekarang
                          <span
                            className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#4DA987] transition-all duration-300 group-hover:w-full"
                          ></span>
                        </span>
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
          
          {/* Right: Image with Overlay Section */}
          <motion.div 
            className="relative md:w-2/5 flex flex-col"
            initial={{ x: 50 }}
            animate={{ x: 0 }}
            exit={{ x: 100 }}
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
                <h2 className="text-2xl font-bold mb-2">Daftar Akun</h2>
                <p className="text-sm md:text-base opacity-90">
                  Sistem Informasi Donasi dan Pengelolaan Keuangan Masjid Taqwa Muhammadiyah
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
