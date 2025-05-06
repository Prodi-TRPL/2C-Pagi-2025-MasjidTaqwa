import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginBaru = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleRememberChange = (e) => {
    setRemember(e.target.checked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just log the form data
    console.log({ username, password, remember });
    // You can add your login logic here
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
          src="../img/GreenBackground.jpeg"
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
                value={username}
                onChange={handleUsernameChange}
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
