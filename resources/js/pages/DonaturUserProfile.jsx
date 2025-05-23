import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Card,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  AccountCircle as AccountCircleIcon,
  MonetizationOn as MonetizationOnIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import NavbarBaru from '../components/LandingPage/NavbarBaru';
import { SimpleFooter } from '../components/LandingPage/SimpleFooter';

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
              <Card
                elevation={6}
                sx={{
                  borderRadius: 12,
                  p: 4,
                  bgcolor: 'white',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Avatar
                  src={profile.profile_image}
                  alt={profile.nama}
                  sx={{ width: 110, height: 110, mb: 2, boxShadow: 3 }}
                />
                <Box sx={{ width: '100%', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    label="Nama Pengguna"
                    value={namaInput}
                    onChange={handleNamaChange}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      readOnly: !editNama,
                      startAdornment: !editNama ? (
                        <InputAdornment position="start" sx={{ color: 'white' }}>
                          <AccountCircleIcon sx={{ color: '#59B997', mr: 1 }} />
                        </InputAdornment>
                      ) : null,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleToggleEditNama}
                            edge="end"
                            color="primary"
                            aria-label={editNama ? 'Simpan Nama' : 'Edit Nama'}
                          >
                            {editNama ? <SaveIcon /> : <EditIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      bgcolor: editNama ? 'white' : '#f5f7fa',
                      borderRadius: 2,
                      color: editNama ? 'black' : 'black',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#59B997',
                      },
                      '& .MuiInputLabel-root': {
                        color: editNama ? 'black' : '#59B997',
                      },
                      '& .MuiInputBase-input': {
                        color: editNama ? 'black' : 'black',
                      },
                      transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
                    }}
                  />
                  </Box>
                  <TextField
                    label="Email"
                    value={profile.email}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start" sx={{ color: '#59B997' }}>
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      bgcolor: '#f5f7fa',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#59B997',
                      },
                      '& .MuiInputLabel-root': {
                        color: '#59B997',
                      },
                      '& .MuiInputBase-input': {
                        color: 'black',
                      },
                    }}
                  />
                  <Box sx={{ mt: 3 }}>
                  <Box
                    sx={{
                      borderBottom: '2px solid rgba(0, 0, 0, 0.2)',
                      mb: 3,
                      width: '100%',
                    }}
                  />
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        gap: 1,
                        mt: 2,
                      }}
                    >
                    {navItems.map(({ label, icon, href }) => (
                      <Button
                        key={label}
                        variant="outlined"
                        startIcon={icon}
                        href={href}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 1,
                        width: '100%',
                        color: '#59B997',
                        borderColor: '#59B997',
                        transition: 'all 0.3s',
                        '&:hover': {
                          backgroundColor: '#59B997',
                          borderColor: '#59B997',
                          color: '#fff',
                          '& svg': {
                            color: '#fff',
                          },
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        },
                      }}
                      >
                        {label}
                      </Button>
                    ))}
                    <Button
                      variant="outlined"
                      startIcon={<LogoutIcon fontSize="large" color="error" />}
                      onClick={handleLogout}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 1,
                        width: '100%',
                        color: theme.palette.error.main,
                        borderColor: theme.palette.error.main,
                        transition: 'color 0.3s, border-color 0.3s, background-color 0.3s, box-shadow 0.3s',
                        '& svg': {
                          transition: 'color 0.3s',
                        },
                        '&:hover': {
                          backgroundColor: theme.palette.error.main,
                          borderColor: theme.palette.error.dark,
                          color: '#fff',
                          '& svg': {
                            color: '#fff',
                          },
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      Keluar
                    </Button>
                  </Box>
                  </Box>
                </Box>
              </Card>
            </div>

            {/* Right side with flex-1 to fill remaining space */}
            <div className="flex flex-col flex-1 space-y-4">
              <Card
                elevation={6}
                sx={{
                  borderRadius: 12,
                  p: 4,
                  bgcolor: 'white',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                  width: '100%',
                }}
              >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  color: '#59B997',
                  mb: 3,
                  transition: 'color 0.3s ease',
                }}
              >
                Statistik Donasi
              </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    width: '100%',
                    mt: 2,
                  }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      flex: 1,
                      mr: 1,
                      p: 2,
                      borderRadius: 2,
                      textAlign: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    <MonetizationOnIcon
                      color="primary"
                      sx={{ fontSize: 40, mb: 1 }}
                    />
                    <Typography variant="h6" fontWeight={700}>
                      {profile.totalDonationsCount} Kali Donasi
                    </Typography>
                  </Card>
                  <Card
                    variant="outlined"
                    sx={{
                      flex: 1,
                      ml: 1,
                      p: 2,
                      borderRadius: 2,
                      textAlign: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    <TrendingUpIcon
                      color="primary"
                      sx={{ fontSize: 40, mb: 1 }}
                    />
                    <Typography variant="h6" fontWeight={700}>
                      Rp {profile.totalDonationsAmount.toLocaleString()}
                    </Typography>
                  </Card>
                </Box>
              </Card>

              <Card
                elevation={6}
                sx={{
                  borderRadius: 12,
                  p: isMobile ? 5 : 8,
                  bgcolor: 'white',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  height: '100%',
                  flex: 1,
                  width: '100%',
                }}
              >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  color: '#59B997',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.3s ease',
                }}
              >
                <LockIcon sx={{ mr: 1 }} />
                Ganti Password
              </Typography>
                <TextField
                  label="Password Lama"
                  name="currentPassword"
                  type={showPassword.currentPassword ? 'text' : 'password'}
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => toggleShowPassword('currentPassword')}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword.currentPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Password Baru"
                  name="newPassword"
                  type={showPassword.newPassword ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => toggleShowPassword('newPassword')}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword.newPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Konfirmasi Password Baru"
                  name="confirmNewPassword"
                  type={showPassword.confirmNewPassword ? 'text' : 'password'}
                  value={passwords.confirmNewPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 3 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => toggleShowPassword('confirmNewPassword')}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword.confirmNewPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0,128,0,0.3)',
                    transition: 'background-color 0.3s',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                  onClick={handleSubmitPasswordChange}
                >
                  Perbarui Password
                </Button>
              </Card>
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