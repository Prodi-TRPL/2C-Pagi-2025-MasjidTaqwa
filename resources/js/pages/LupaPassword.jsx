import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LupaPassword = () => {
  const [email, setEmail] = useState('');
  const [fadeIn, setFadeIn] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle forgot password logic here, e.g., send reset link
    console.log({ email });
  };

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className={`flex h-screen overflow-hidden relative transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* Left: Background Image */}
      <div className="hidden lg:block w-1/2">
        <img
          src="../img/GreenBackground.jpeg"
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
        <h1 className="text-2xl font-semibold mb-6 text-center">Lupa Kata Sandi</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-600 mb-2">
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
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4"
          >
            Reset Kata Sandi
          </button>
        </form>
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
