import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import NavbarBaru from '../components/LandingPage/NavbarBaru';
import { SimpleFooter } from '../components/LandingPage/SimpleFooter';
import ProfileInfo from '../components/DonaturUserProfile/ProfileInfo';
import DonationStats from '../components/DonaturUserProfile/DonationStats';
import PasswordChange from '../components/DonaturUserProfile/PasswordChange';

const DonaturUserProfile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    nama: '',
    email: '',
    profile_image: '/img/user/admin.jpeg',
    created_at: '',
    totalDonationsCount: 0,
    totalDonationsAmount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editNama, setEditNama] = useState(false);
  const [namaInput, setNamaInput] = useState('');

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/loginbaru');
          return;
        }
        const response = await axios.get('/api/donatur/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;

        const statsResponse = await axios.get('/api/donatur/donations/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const stats = statsResponse.data;

        setProfile({
          nama: data.nama || '',
          email: data.email || '',
          profile_image: data.profile_image || '/img/user/admin.jpeg',
          created_at: data.created_at
            ? new Date(data.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : '',
          totalDonationsCount: stats.total_count || 0,
          totalDonationsAmount: stats.total_amount || 0,
        });
        setNamaInput(data.nama || '');
        setLoading(false);
      } catch (err) {
        setError('Gagal memuat profil. Silakan coba lagi.');
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/loginbaru', { replace: true });
  };

  const handleToggleEditNama = () => {
    if (editNama) {
      handleSaveNama();
    }
    setEditNama(!editNama);
  };

  const handleNamaChange = (e) => {
    setNamaInput(e.target.value);
  };

  const handleSaveNama = async () => {
    if (!namaInput.trim()) {
      setSnackbar({
        open: true,
        message: 'Nama pengguna tidak boleh kosong.',
        severity: 'error',
      });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/loginbaru');
        return;
      }
      await axios.put(
        '/api/donatur/profile',
        { nama: namaInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile((prev) => ({ ...prev, nama: namaInput }));
      setSnackbar({
        open: true,
        message: 'Nama pengguna berhasil diperbarui.',
        severity: 'success',
      });
      setEditNama(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Gagal memperbarui nama pengguna.',
        severity: 'error',
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmitPasswordChange = async () => {
    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmNewPassword
    ) {
      setSnackbar({
        open: true,
        message: 'Semua kolom password harus diisi.',
        severity: 'error',
      });
      return;
    }
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setSnackbar({
        open: true,
        message: 'Password baru dan konfirmasi tidak cocok.',
        severity: 'error',
      });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/loginbaru');
        return;
      }
      await axios.post(
        '/api/donatur/change-password',
        {
          current_password: passwords.currentPassword,
          new_password: passwords.newPassword,
          new_password_confirmation: passwords.confirmNewPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSnackbar({
        open: true,
        message: 'Password berhasil diubah.',
        severity: 'success',
      });
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          'Gagal mengubah password. Silakan coba lagi.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const navItems = [
    {
      label: 'Notifikasi',
      icon: <NotificationsIcon fontSize="large" sx={{ color: '#59B997' }} />,
      href: '/donatur/notifikasi',
    },
    {
      label: 'Riwayat Transaksi',
      icon: <HistoryIcon fontSize="large" sx={{ color: '#59B997' }} />,
      href: '/donatur/riwayat-transaksi',
    },
    {
      label: 'Progress Pembangunan',
      icon: <TrendingUpIcon fontSize="large" sx={{ color: '#59B997' }} />,
      href: '/donatur/progress-pembangunan',
    },
  ];

  if (loading) {
    return (
      <Box
        className="flex flex-col min-h-screen"
        sx={{ backgroundColor: '#f0f4f8' }}
      >
        <NavbarBaru />
        <Box className="flex-grow flex items-center justify-center">
          <Typography variant="h6" color="textSecondary">
            Memuat profil...
          </Typography>
        </Box>
        <SimpleFooter />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        className="flex flex-col min-h-screen"
        sx={{ backgroundColor: '#f0f4f8' }}
      >
        <NavbarBaru />
        <Box className="flex-grow flex items-center justify-center">
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
        <SimpleFooter />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavbarBaru />
      <Container
        component="main"
        sx={{
          flexGrow: 1,
          mt: 12,
          py: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Fade in timeout={600}>
          <div className="flex flex-col md:flex-row flex-grow w-full gap-x-6">
            {/* Left profile section with fixed width */}
            <div className="w-full md:w-1/3 flex flex-col flex-shrink-0">
              <ProfileInfo
                profile={profile}
                namaInput={namaInput}
                editNama={editNama}
                handleNamaChange={handleNamaChange}
                handleToggleEditNama={handleToggleEditNama}
                navItems={navItems}
                handleLogout={handleLogout}
              />
            </div>

            {/* Right side with flex-1 to fill remaining space */}
            <div className="flex flex-col flex-1 space-y-4">
              <DonationStats profile={profile} />
              <PasswordChange
                passwords={passwords}
                showPassword={showPassword}
                handlePasswordChange={handlePasswordChange}
                toggleShowPassword={toggleShowPassword}
                handleSubmitPasswordChange={handleSubmitPasswordChange}
                isMobile={isMobile}
              />
            </div>
          </div>
        </Fade>
      </Container>
      <Box sx={{ zIndex: 10 }}>
        <SimpleFooter />
      </Box>
    </Box>
  );
};

export default DonaturUserProfile;
