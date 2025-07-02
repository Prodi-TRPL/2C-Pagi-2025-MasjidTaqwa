import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email, // gunakan 'email' untuk isi 'username'
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validasi dari backend
        setMessage(data.message || 'Pendaftaran gagal.');
      } else {
        setMessage('Pendaftaran berhasil! Silakan login.');
        // Arahkan ke login setelah 2 detik
        setTimeout(() => navigate('/loginbaru'), 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Terjadi kesalahan saat mendaftar.');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      <a
        href="/"
        className="absolute top-4 right-4 lg:left-4 lg:right-auto text-blue-500 hover:text-blue-700 flex items-center space-x-1"
        aria-label="Back to homepage"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Kembali</span>
      </a>

      {/* Form Daftar */}
      <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-12 bg-gray-100">
        <div className="p-6 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-4">Daftar</h1>

          {message && (
            <div className="mb-4 text-sm text-center text-red-500">{message}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-600">Email Pengguna</label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-600">Kata Sandi</label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="text-blue-500"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember" className="text-gray-600 ml-2">Ingat Saya</label>
            </div>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
            >
              Daftar
            </button>
          </form>

          <div className="mt-6 text-blue-500 text-center">
            <p className='text-black'>Sudah punya akun?</p>
            <Link to="/loginbaru" className="hover:underline">Masuk Sekarang</Link>
          </div>

          <div className="mt-6 text-gray-600 text-center">
            <p>&copy; 2025 Masjid Taqwa Muhammadiyah. All rights reserved.</p>
          </div>
        </div>
      </div>

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
