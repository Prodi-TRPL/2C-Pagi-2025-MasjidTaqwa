import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavbarBaru from '../components/LandingPage/NavbarBaru';
import { SimpleFooter } from "../components/LandingPage/SimpleFooter";

const DonaturUserProfile = () => {
    const [profile, setProfile] = useState({
        nama: '',
        created_at: '',
        email: '',
        nomor_hp: '',
        alamat: 'Jl. Kenanga No. 15, Bandung, Jawa Barat',
        status: 'Aktif',
        profile_image: '/img/user/admin.jpeg' // default profile image path
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/loginbaru');
                    return;
                }

                const response = await axios.get('/api/donatur/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setProfile({
                    nama: response.data.nama || 'Muhammad Addin',
                    created_at: response.data.created_at ? 
                        new Date(response.data.created_at).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                        }) : '15 Januari 2023',
                    email: response.data.email || 'addin@gmail.com',
                    nomor_hp: response.data.nomor_hp || '081234567890',
                    alamat: response.data.alamat || 'Jl. Kenanga No. 15, Bandung, Jawa Barat',
                    status: 'Aktif',
                    profile_image: response.data.profile_image || '/img/user/admin.jpeg'
                });
                setLoading(false);
            } catch (err) {
                setError('Gagal memuat profil. Silakan coba lagi.');
                setLoading(false);
                console.error(err);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/loginbaru', { replace: true });
    };

    if (loading) {
        return (
            <div className="pt-16 relative min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="relative z-20">
                    <NavbarBaru />
                </div>
                <div className="flex justify-center items-center h-screen">
                    <p>Memuat profil...</p>
                </div>
                <div className="relative z-10">
                    <SimpleFooter />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pt-16 relative min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="relative z-20">
                    <NavbarBaru />
                </div>
                <div className="text-red-500 text-center mt-4">
                    {error}
                </div>
                <div className="relative z-10">
                    <SimpleFooter />
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 relative min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="relative z-20">
                <NavbarBaru />
            </div>

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden transition hover:shadow-lg dark:bg-gray-800">
                    <div className="p-6">
                        <div className="flex items-center space-x-6 mb-6">
                            <img
                                className="w-24 h-24 rounded-full object-cover border-2 border-green-600 dark:border-blue-400"
                                src={profile.profile_image}
                                alt="Profile"
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{profile.nama}</h1>
                                <p className="text-gray-600 dark:text-gray-300">Terdaftar sejak {profile.created_at}</p>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-6 dark:text-gray-300">Manajemen profil dan preferensi akun Anda</p>

                        <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                                {[
                                    { label: 'Nama Lengkap', value: profile.nama },
                                    { label: 'Email', value: profile.email, note: 'Email tidak dapat diubah' },
                                    { label: 'Nomor Telepon', value: profile.nomor_hp },
                                    { label: 'Status Akun', value: (
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                            profile.status === 'Aktif'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {profile.status}
                                        </span>
                                    )},
                                    { label: 'Alamat', value: profile.alamat },
                                ].map((item, idx) => (
                                    <div key={idx}>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{item.value}</p>
                                        {item.note && <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">{item.note}</p>}
                                    </div>
                                ))}
                            </div>

                            {/* Tombol edit profil */}
                            <div className="flex justify-center">
                                <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150 ease-in-out dark:bg-green-700 dark:hover:bg--800">
                                    Edit Profil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                <SimpleFooter />
            </div>
        </div>
    );
};

export default DonaturUserProfile;
