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
  Avatar,
  Button,
  TextField,
  Paper,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  Divider,
  Snackbar,
  Alert,
  Tab,
  Tabs,
  Skeleton,
  Chip,
  Badge,
  Tooltip,
  Zoom,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon,
  AccountBalanceWallet as WalletIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  VerifiedUser as VerifiedUserIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import NavbarBaru from '../components/LandingPage/NavbarBaru';
import { SimpleFooter } from '../components/LandingPage/SimpleFooter';

// Profile avatar skeleton loader
const ProfileSkeleton = () => (
  <Box display="flex" flexDirection="column" alignItems="center" sx={{ width: '100%', py: 3 }}>
    <Skeleton variant="circular" width={100} height={100} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="60%" height={35} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="40%" height={25} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="70%" height={20} sx={{ mb: 0.5 }} />
    <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="90%" height={50} sx={{ mb: 1, borderRadius: 1 }} />
    <Skeleton variant="rectangular" width="90%" height={50} sx={{ mb: 1, borderRadius: 1 }} />
    <Skeleton variant="rectangular" width="90%" height={50} sx={{ mb: 1, borderRadius: 1 }} />
  </Box>
);

// Stats skeleton loader
const StatsSkeleton = () => (
  <Box sx={{ width: '100%', py: 2 }}>
    <Skeleton variant="text" width="40%" height={35} sx={{ mb: 2 }} />
    <Box display="flex" gap={2}>
      <Skeleton variant="rectangular" width="50%" height={100} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" width="50%" height={100} sx={{ borderRadius: 2 }} />
    </Box>
  </Box>
);

// ProfileInfo Component
const ProfileInfo = ({ 
  profile, 
  namaInput, 
  editNama, 
  handleNamaChange, 
  handleToggleEditNama, 
  navItems, 
  handleLogout,
  loading
}) => {
  if (loading) return <ProfileSkeleton />;

  return (
    <Card 
      elevation={3} 
      sx={{ 
        borderRadius: 3,
        overflow: 'visible',
        mb: { xs: 4, lg: 0 },
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
        position: 'relative',
      }}
    >
      <Box 
        sx={{ 
          height: { xs: 60, sm: 80 }, 
          width: '100%', 
          position: 'absolute', 
          top: 0, 
          left: 0,
          background: 'linear-gradient(135deg, #4CAF50 0%, #59B997 100%)',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }} 
      />

      <CardContent sx={{ p: { xs: 2, md: 3 }, position: 'relative', pt: { xs: 6, sm: 8 } }}>
        <Box className="flex flex-col items-center text-center mb-4">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Tooltip title="Donatur Terverifikasi">
                <VerifiedUserIcon 
                  sx={{ 
                    color: '#59B997', 
                    backgroundColor: 'white', 
                    borderRadius: '50%',
                    padding: '2px',
                    fontSize: { xs: 20, sm: 24 },
                  }} 
                />
              </Tooltip>
            }
          >
            <Avatar
              src={profile.profile_image}
              alt={profile.nama}
              sx={{ 
                width: { xs: 80, sm: 100 }, 
                height: { xs: 80, sm: 100 }, 
                mb: 2,
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
              />
            </Badge>
          
          <Zoom in={true} style={{ transitionDelay: '300ms' }}>
            <Box sx={{ width: '100%', mb: 2 }}>
              {editNama ? (
                <TextField
                  fullWidth
                  value={namaInput}
                  onChange={handleNamaChange}
                  size="small"
                  sx={{ mb: 1 }}
                  placeholder="Masukkan nama baru"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              ) : (
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {profile.nama}
                </Typography>
              )}
              
              <Button
                startIcon={editNama ? <CheckCircleIcon /> : <EditIcon />}
                onClick={handleToggleEditNama}
                size="small"
                sx={{ 
                  mb: 1,
                  borderRadius: 4,
                  px: 2,
                  transition: 'all 0.2s',
                  backgroundColor: editNama ? '#59B997' : 'transparent',
                  color: editNama ? 'white' : '#59B997',
                  border: '1px solid #59B997',
                  '&:hover': {
                    backgroundColor: editNama ? '#4a9d80' : 'rgba(89, 185, 151, 0.1)',
                  }
                }}
              >
                {editNama ? 'Simpan' : 'Edit Nama'}
              </Button>
            </Box>
          </Zoom>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <EmailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {profile.email}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Bergabung sejak {profile.created_at}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }}>
          <Chip label="Menu Utama" size="small" sx={{ backgroundColor: '#f5f8fa', color: '#59B997' }} />
        </Divider>
        
        <Box className="flex flex-col space-y-2 mt-4">
          {navItems.map((item, index) => (
            <Button
              key={index}
              href={item.href}
              startIcon={item.icon}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                py: 1.5,
                borderRadius: 2,
                color: 'text.primary',
                fontWeight: 500,
                border: '1px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(89, 185, 151, 0.1)',
                  borderColor: 'rgba(89, 185, 151, 0.3)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
          
          <Button
            startIcon={<ExitToAppIcon />}
            onClick={handleLogout}
            fullWidth
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              py: 1.5,
              mt: 2,
              borderRadius: 2,
              color: 'error.main',
              fontWeight: 500,
              border: '1px solid transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.05)',
                borderColor: 'rgba(211, 47, 47, 0.2)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Keluar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// DonationStats Component
const DonationStats = ({ profile, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) return <StatsSkeleton />;

  return (
    <Card 
      elevation={3} 
      sx={{ 
        borderRadius: 3, 
        mb: 4,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <WalletIcon sx={{ mr: 1, color: '#59B997' }} />
          Ringkasan Donasi
        </Typography>
        
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: 'rgba(89, 185, 151, 0.1)',
                border: '1px solid rgba(89, 185, 151, 0.2)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 24px rgba(89, 185, 151, 0.15)',
                  borderColor: 'rgba(89, 185, 151, 0.4)',
                },
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Donasi
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="#59B997" sx={{ display: 'flex', alignItems: 'center' }}>
                <HistoryIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                {profile.totalDonationsCount} kali
              </Typography>
            </Paper>
          </Zoom>
          
          <Zoom in={true} style={{ transitionDelay: '200ms' }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: 'rgba(89, 185, 151, 0.1)',
                border: '1px solid rgba(89, 185, 151, 0.2)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 24px rgba(89, 185, 151, 0.15)',
                  borderColor: 'rgba(89, 185, 151, 0.4)',
                },
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Nominal
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="#59B997" sx={{ display: 'flex', alignItems: 'center' }}>
                <WalletIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                {formatCurrency(profile.totalDonationsAmount)}
              </Typography>
            </Paper>
          </Zoom>
        </Box>
      </CardContent>
    </Card>
  );
};

// ProfileInformation Component
const ProfileInformation = ({ profile, loading }) => {
  if (loading) {
    return (
      <Box className="flex flex-col space-y-4">
        {[1, 2, 3, 4].map((item) => (
          <React.Fragment key={item}>
            <Box className="flex flex-col space-y-2">
              <Skeleton variant="text" width="30%" height={24} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
            {item < 4 && <Divider />}
          </React.Fragment>
        ))}
      </Box>
    );
  }

  const infoItems = [
    {
      label: 'Nama Lengkap',
      value: profile.nama,
      icon: <PersonIcon sx={{ color: '#59B997' }} />,
    },
    {
      label: 'Email',
      value: profile.email,
      icon: <EmailIcon sx={{ color: '#59B997' }} />,
    },
    {
      label: 'Tanggal Bergabung',
      value: profile.created_at,
      icon: <CalendarIcon sx={{ color: '#59B997' }} />,
    },
    {
      label: 'Total Donasi',
      value: `${profile.totalDonationsCount} kali`,
      icon: <HistoryIcon sx={{ color: '#59B997' }} />,
    },
  ];

  return (
    <Box className="flex flex-col space-y-4">
      {infoItems.map((item, index) => (
        <React.Fragment key={index}>
          <Box className="flex flex-col space-y-2">
            <Typography variant="body1" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
              {item.value}
            </Typography>
          </Box>
          {index < infoItems.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Box>
  );
};

// PasswordChange Component
const PasswordChange = ({
  passwords,
  showPassword,
  handlePasswordChange,
  toggleShowPassword,
  handleSubmitPasswordChange,
  isMobile,
  loading,
}) => {
  if (loading) {
    return (
      <Box className="flex flex-col space-y-4">
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={150} height={36} sx={{ borderRadius: 4, mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box className="flex flex-col space-y-4">
      <FormControl variant="outlined" fullWidth>
        <InputLabel htmlFor="current-password">Password Saat Ini</InputLabel>
        <OutlinedInput
          id="current-password"
          type={showPassword.currentPassword ? 'text' : 'password'}
          name="currentPassword"
          value={passwords.currentPassword}
          onChange={handlePasswordChange}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => toggleShowPassword('currentPassword')}
              >
                {showPassword.currentPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          label="Password Saat Ini"
          sx={{ borderRadius: 2 }}
        />
      </FormControl>
      
      <FormControl variant="outlined" fullWidth>
        <InputLabel htmlFor="new-password">Password Baru</InputLabel>
        <OutlinedInput
          id="new-password"
          type={showPassword.newPassword ? 'text' : 'password'}
          name="newPassword"
          value={passwords.newPassword}
          onChange={handlePasswordChange}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => toggleShowPassword('newPassword')}
              >
                {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          label="Password Baru"
          sx={{ borderRadius: 2 }}
        />
      </FormControl>
      
      <FormControl variant="outlined" fullWidth>
        <InputLabel htmlFor="confirm-new-password">Konfirmasi Password Baru</InputLabel>
        <OutlinedInput
          id="confirm-new-password"
          type={showPassword.confirmNewPassword ? 'text' : 'password'}
          name="confirmNewPassword"
          value={passwords.confirmNewPassword}
          onChange={handlePasswordChange}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => toggleShowPassword('confirmNewPassword')}
              >
                {showPassword.confirmNewPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          label="Konfirmasi Password Baru"
          sx={{ borderRadius: 2 }}
        />
      </FormControl>
      
      <Button
        variant="contained"
        onClick={handleSubmitPasswordChange}
        sx={{
          bgcolor: '#59B997',
          '&:hover': { bgcolor: '#4a9d80' },
          color: 'white',
          textTransform: 'none',
          mt: 2,
          fontWeight: 'medium',
          py: 1.2,
          borderRadius: 8,
          boxShadow: '0 4px 14px rgba(89, 185, 151, 0.4)',
          transition: 'all 0.3s',
          '&:hover': {
            bgcolor: '#4a9d80',
            boxShadow: '0 6px 20px rgba(89, 185, 151, 0.6)',
            transform: 'translateY(-2px)',
          },
          alignSelf: isMobile ? 'stretch' : 'flex-end',
        }}
      >
        Ubah Password
      </Button>
    </Box>
  );
};

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

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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

        // Add slight delay to show loading state
        setTimeout(() => {
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
        }, 800);
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
      icon: <NotificationsIcon fontSize="medium" sx={{ color: '#59B997' }} />,
      href: '/donatur/notifikasi',
    },
    {
      label: 'Riwayat Transaksi',
      icon: <HistoryIcon fontSize="medium" sx={{ color: '#59B997' }} />,
      href: '/donatur/riwayat-transaksi',
    },
    {
      label: 'Progress Pembangunan',
      icon: <TrendingUpIcon fontSize="medium" sx={{ color: '#59B997' }} />,
      href: '/donatur/pembangunan',
    },
  ];

  const simulatePermissionRevocation = async () => {
    try {
      const response = await axios.get('/api/test/revoke-permission');
      console.log('Permission revocation simulated:', response.data);
      // The permission checker should detect this on its next check
    } catch (error) {
      console.error('Error simulating permission revocation:', error);
    }
  };

  if (error) {
    return (
      <Box
        className="flex flex-col min-h-screen"
        sx={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)' 
        }}
      >
        <NavbarBaru />
        <Box className="flex-grow flex items-center justify-center">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              maxWidth: 400,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" color="error" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
              sx={{ mt: 2, borderRadius: 8 }}
            >
              Coba Lagi
            </Button>
          </Paper>
        </Box>
        <SimpleFooter />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%2359B997" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")',
        backgroundAttachment: 'fixed',
      }}
    >
      <NavbarBaru />
      <Container
        component="main"
        sx={{
          flexGrow: 1,
          mt: { xs: 8, sm: 10, md: 12 },
          py: { xs: 2, md: 4 },
          px: { xs: 2, md: 3 },
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          mb: 4,
          maxWidth: { xs: '100%', lg: 'lg' },
        }}
      >
        <Fade in timeout={600}>
          <div className="flex flex-col lg:flex-row w-full gap-6">
            {/* Left profile section - stacks vertically on mobile, side-by-side on larger screens */}
            <div className="w-full lg:w-1/3 mb-6 lg:mb-0">
              <ProfileInfo
                profile={profile}
                namaInput={namaInput}
                editNama={editNama}
                handleNamaChange={handleNamaChange}
                handleToggleEditNama={handleToggleEditNama}
                navItems={navItems}
                handleLogout={handleLogout}
                loading={loading}
              />
            </div>

            {/* Right side */}
            <div className="flex flex-col flex-1 space-y-4">
              <DonationStats 
                profile={profile} 
                loading={loading}
              />
              
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    variant={isMobile ? "fullWidth" : "standard"}
                    sx={{
                      mb: 3,
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 'medium',
                        borderRadius: '12px',
                        py: 1.5,
                        transition: 'all 0.3s',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        minHeight: { xs: '40px', sm: '48px' },
                        px: { xs: 1, sm: 2 },
                      },
                      '& .Mui-selected': {
                        color: '#59B997',
                        fontWeight: 'bold',
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: '#59B997',
                        height: 3,
                        borderRadius: 1.5,
                      },
                    }}
                  >
                    <Tab 
                      label={isMobile ? "Informasi" : "Informasi Profil"} 
                      icon={<PersonIcon fontSize={isMobile ? "small" : "medium"} />} 
                      iconPosition="start"
                    />
                    <Tab 
                      label={isMobile ? "Password" : "Ubah Password"} 
                      icon={<LockIcon fontSize={isMobile ? "small" : "medium"} />} 
                      iconPosition="start"
                    />
                  </Tabs>
                  
                  <div hidden={activeTab !== 0}>
                    {activeTab === 0 && <ProfileInformation profile={profile} loading={loading} />}
                  </div>
                  
                  <div hidden={activeTab !== 1}>
                    {activeTab === 1 && (
                      <PasswordChange
                        passwords={passwords}
                        showPassword={showPassword}
                        handlePasswordChange={handlePasswordChange}
                        toggleShowPassword={toggleShowPassword}
                        handleSubmitPasswordChange={handleSubmitPasswordChange}
                        isMobile={isMobile}
                        loading={loading}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Fade>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Zoom}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%', 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Box sx={{ zIndex: 10 }}>
        <SimpleFooter />
      </Box>
      {process.env.NODE_ENV === 'development' && (
        <button 
          onClick={simulatePermissionRevocation}
          className="fixed bottom-2 right-2 bg-red-500 text-white text-xs p-1 rounded opacity-30 hover:opacity-100"
          style={{ fontSize: '8px' }}
        >
          Test Permission Revocation
        </button>
      )}
    </Box>
  );
};

export default DonaturUserProfile;
