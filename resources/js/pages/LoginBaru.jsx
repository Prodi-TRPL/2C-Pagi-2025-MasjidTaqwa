import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const LoginBaru = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if token exists
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboardhome', { replace: true });
    }
  }, [navigate]);

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
    try {
      const response = await axios.post('/api/login', {
        email,
        password,
      });
      // Assuming response data contains token and user info with role
      const { token, user } = response.data;
      if (user.role === 'admin') {
        localStorage.setItem('token', token);
        // Store user info in localStorage with normalized keys
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
        navigate('/dashboardhome', { replace: true });
      } else {
        setError('Anda tidak memiliki akses sebagai admin.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login gagal. Silakan coba lagi.');
      }
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
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-600">
                Email Pengguna
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                autoComplete="off"
                value={email}
                onChange={handleEmailChange}
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
                name="password"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                autoComplete="off"
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            {/* Remember Me Checkbox */}
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                className="text-blue-500"
                checked={remember}
                onChange={handleRememberChange}
              />
              <label htmlFor="remember" className="text-gray-600 ml-2">
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
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
            >
              Masuk
            </button>
          </form>
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
