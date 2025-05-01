import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar({ isLoggedIn, role }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isInformasiOpen, setIsInformasiOpen] = useState(false);
    const [isTransparansiOpen, setIsTransparansiOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
<nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-14">
            <div className="flex justify-between h-16 items-center">
            {/* Logo and Burger Menu for Mobile */}
            <div className="flex justify-between md:block w-full">
                {/* Tempat menaruh logo */}
                <div className="flex-shrink-0">
                    <Link to="/" className="flex items-center">
                        {/* Ganti LOGO dengan gambar logo */}
                        <img src="/img/LogoSidontaqNav.jpeg" alt="Logo" className="h-13 w-auto" />
                    </Link>
                </div>

                {/* Tombol Burger untuk Mobile */}
                <div className="md:hidden flex items-center">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-blue-600 focus:outline-none">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>

{/* Menu untuk Desktop */}  
<div className="hidden md:flex space-x-8 items-center">
                <a href="#beranda" className="text-gray-700 hover:text-blue-600">Beranda</a>

                {/* Dropdown Informasi */}
                <div className="relative">
<button onClick={() => {
                    setIsInformasiOpen(!isInformasiOpen);
                    setIsTransparansiOpen(false);
                }} className="text-gray-700 hover:text-blue-600 focus:outline-none">
                    Informasi
                </button>
                {isInformasiOpen && (
                    <div className="absolute mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                        <Link to="/tentang" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tentang</Link>
                        <Link to="/keunggulan" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Keunggulan</Link>
                    </div>
                    </div>
                )}
                </div>

                {/* Dropdown Transparansi */}
                <div className="relative">
                    <button onClick={() => {
                    setIsTransparansiOpen(!isTransparansiOpen);
                    setIsInformasiOpen(false);
                }} className="text-gray-700 hover:text-blue-600 focus:outline-none">
                    Transparansi
                </button>
                {isTransparansiOpen && (
                    <div className="absolute mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                        <Link to="/rekapanbulanan" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rekapan Bulanan</Link>
                        <Link to="/rekapandonatur" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rekapan Donatur</Link>
                    </div>
                    </div>
                )}
                </div>

                <Link to="/hubungi" className="text-gray-700 hover:text-blue-600">Hubungi</Link>
            </div>

            {/* Profile / Login */} 
            <div className="flex items-center ml-6">
                {!isLoggedIn ? (
                <Link to="/login" className="hidden md:block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Masuk</Link>
                ) : (
                <div className="relative">
                    <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="focus:outline-none">
                    <img
                        src="https://via.placeholder.com/40"
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover"
                    />
                    </button>
                    {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                        {role === 'admin' ? (
                            <>
                            <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</Link>
                            <Link to="/admin/data-pembangunan" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Data Pembangunan</Link>
                            <Link to="/profil-saya" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil Saya</Link>
                            <a href="/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-100">Logout</a>
                            </>
                        ) : (
                            <>
                            <Link to="/donatur/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</Link>
                            <Link to="/donatur/riwayat-donasi" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Riwayat Donasi</Link>
                            <Link to="/profil-saya" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil Saya</Link>
                            <a href="/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-100">Logout</a>
                            </>
                        )}
                        </div>
                    </div>
                    )}
                </div>
                )}
            </div>

            </div>
        </div>

        {/* Menu Burger untuk Mobile */} 
<div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            <div className="space-y-1 px-2 pt-2 pb-3">
            <a href="#beranda" className="block text-gray-700 hover:bg-gray-100">Beranda</a>
            <button onClick={() => {
                setIsInformasiOpen(!isInformasiOpen);
                setIsTransparansiOpen(false);
            }} className="block text-gray-700 hover:bg-gray-100">
                Informasi
            </button>
            {isInformasiOpen && (
                <div className="space-y-1">
                <Link to="/tentang" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tentang</Link>
                <Link to="/keunggulan" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Keunggulan</Link>
                </div>
            )}
            <button onClick={() => {
                setIsTransparansiOpen(!isTransparansiOpen);
                setIsInformasiOpen(false);
            }} className="block text-gray-700 hover:bg-gray-100">
                Transparansi
            </button>
            {isTransparansiOpen && (
                <div className="space-y-1">
                <Link to="/rekapanbulanan" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rekapan Bulanan</Link>
                <Link to="/rekapandonatur" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rekapan Donatur</Link>
                </div>
            )}
            <Link to="/hubungi" className="block text-gray-700 hover:bg-gray-100">Hubungi</Link>
            {!isLoggedIn ? (
                <Link to="/login" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-100">Masuk</Link>
            ) : (
                <div className="block text-gray-700">
                {role === 'admin' ? (
                    <Link to="/admin/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-100">Dashboard</Link>
                ) : (
                    <Link to="/donatur/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-100">Dashboard</Link>
                )}
                </div>
            )}
            </div>
        </div>
        </nav>
    );
    }

export default Navbar;