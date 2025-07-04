import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    password_confirmation: '',
    nomor_hp: ''
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
      password_confirmation: formData.password_confirmation,
      nomor_hp: formData.nomor_hp || ''
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

  // Add a debug function to test the registration
  const debugRegistration = async () => {
    console.log('Debugging registration with form data:', formData);
    
    try {
      const response = await axios.post('/api/debug-register', {
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        nomor_hp: formData.nomor_hp || ''
      });
      
      console.log('Debug response:', response.data);
      
      // Show validation errors if any
      if (Object.keys(response.data.validation).length > 0) {
        setErrors(response.data.validation);
        console.log('Debug validation errors:', response.data.validation);
      } else {
        console.log('Debug validation passed');
      }
    } catch (error) {
      console.error('Debug registration error:', error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Back button top right on mobile, top left on desktop */}
      <a
        href="/"
        className="absolute top-4 right-4 lg:left-4 lg:right-auto text-blue-500 hover:text-blue-700 flex items-center space-x-1"
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
      {/* Left: Sign Up Form */}
      <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-12 bg-gray-100 overflow-auto">
        <div className="p-6 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-4">Daftar</h1>
          
          {registrationSuccess ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
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
                  ) : "Verifikasi Sekarang"}
                </button>
                
                <button
                  onClick={handleResendCode}
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
                
                <Link 
                  to="/loginbaru" 
                  className="text-gray-500 hover:text-gray-700 text-center text-sm mt-2"
                >
                  Sudah punya akun? Masuk di sini
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Nama Input */}
              <div className="mb-4">
                <label htmlFor="nama" className="block text-gray-600">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  className={`w-full border ${errors.nama ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:border-blue-500`}
                  value={formData.nama}
                  onChange={handleChange}
                />
                {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama}</p>}
              </div>
              
              {/* Email Input */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:border-blue-500`}
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              {/* Password Input */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-600">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:border-blue-500`}
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              
              {/* Confirm Password Input */}
              <div className="mb-4">
                <label htmlFor="password_confirmation" className="block text-gray-600">
                  Konfirmasi Kata Sandi
                </label>
                <input
                  type="password"
                  id="password_confirmation"
                  name="password_confirmation"
                  className={`w-full border ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:border-blue-500`}
                  value={formData.password_confirmation}
                  onChange={handleChange}
                />
                {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>}
              </div>
              
              {/* No HP Input */}
              <div className="mb-4">
                <label htmlFor="nomor_hp" className="block text-gray-600">
                  Nomor HP (Opsional)
                </label>
                <input
                  type="text"
                  id="nomor_hp"
                  name="nomor_hp"
                  className={`w-full border ${errors.nomor_hp ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 focus:outline-none focus:border-blue-500`}
                  value={formData.nomor_hp}
                  onChange={handleChange}
                />
                {errors.nomor_hp && <p className="text-red-500 text-sm mt-1">{errors.nomor_hp}</p>}
              </div>
              
              {/* Sign Up Button */}
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
                    Mendaftar...
                  </>
                ) : "Daftar"}
              </button>
              
              {/* Hidden Debug Button - Enable with window.showDebugButton = true in console */}
              {window.showDebugButton && (
                <button
                  type="button"
                  onClick={debugRegistration}
                  className="mt-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-md py-2 px-4 w-full flex items-center justify-center"
                >
                  Debug Registration
                </button>
              )}
            </form>
          )}
          
          {!registrationSuccess && (
            <>
              {/* Login Link */}
              <div className="mt-6 text-blue-500 text-center">
                <p className='text-black'>Sudah punya akun?</p>
                <Link to="/loginbaru" className="hover:underline">
                  Masuk Sekarang
                </Link>
              </div>
            </>
          )}
          
          {/* Footer */}
          <div className="mt-6 text-gray-600 text-center">
            <p>&copy;Copyright 2025 Masjid Taqwa Muhammadiyah. All rights reserved.</p>
          </div>
        </div>
      </div>
      
      {/* Right: Image for desktop */}
      <div className="hidden lg:block w-1/2">
        <img
          src="../img/bg-repeat.png"
          alt="Background"
          className="object-cover w-full h-full"
          style={{ height: '100vh' }}
        />
      </div>
    </div>
  );
};

export default SignUp;
