import { useState } from 'react';

function Navbar({ isLoggedIn, role }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isInformasiOpen, setIsInformasiOpen] = useState(false);
    const [isTransparansiOpen, setIsTransparansiOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-14">
            <div className="flex justify-between h-16 items-center">
            {/* Logo and Burger Menu for Mobile */}
            <div className="flex justify-between md:block w-full">
                <div className="flex-shrink-0">
                    <a href="/" className="text-2xl font-bold text-blue-600">LOGO</a>
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
                        <a href="/tentang" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tentang</a>
                        <a href="/keunggulan" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Keunggulan</a>
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
                        <a href="/rekapan-bulanan" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rekapan Bulanan</a>
                        <a href="/rekapan-donatur" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rekapan Donatur</a>
                    </div>
                    </div>
                )}
                </div>

                <a href="/hubungi" className="text-gray-700 hover:text-blue-600">Hubungi</a>
            </div>

            {/* Profile / Login */} 
            <div className="flex items-center ml-6">
                {!isLoggedIn ? (
                <a href="/login" className="hidden md:block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Masuk</a>
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
                            <a href="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</a>
                            <a href="/admin/data-pembangunan" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Data Pembangunan</a>
                            <a href="/profil-saya" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil Saya</a>
                            <a href="/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-100">Logout</a>
                            </>
                        ) : (
                            <>
                            <a href="/donatur/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</a>
                            <a href="/donatur/riwayat-donasi" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Riwayat Donasi</a>
                            <a href="/profil-saya" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil Saya</a>
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
                <a href="/tentang" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tentang</a>
                <a href="/keunggulan" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Keunggulan</a>
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
                <a href="/rekapan-bulanan" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rekapan Bulanan</a>
                <a href="/rekapan-donatur" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rekapan Donatur</a>
                </div>
            )}
            <a href="/hubungi" className="block text-gray-700 hover:bg-gray-100">Hubungi</a>
            {!isLoggedIn ? (
                <a href="/login" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-100">Masuk</a>
            ) : (
                <div className="block text-gray-700">
                {role === 'admin' ? (
                    <a href="/admin/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-100">Dashboard</a>
                ) : (
                    <a href="/donatur/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-100">Dashboard</a>
                )}
                </div>
            )}
            </div>
        </div>
        </nav>
    );
    }

export default Navbar;
