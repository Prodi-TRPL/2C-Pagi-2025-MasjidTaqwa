import React, { useEffect, useState } from "react";
import NavbarBaru from '../components/LandingPage/NavbarBaru'; 
import { SimpleFooter } from "../components/LandingPage/SimpleFooter";
import { 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  Typography, 
  TextField, 
  MenuItem, 
  Zoom,
  Paper,
  Skeleton,
  IconButton,
  Tooltip,
  Chip,
  Button,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Alert,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CampaignIcon from '@mui/icons-material/Campaign';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import Badge from "../components/ui/badge/Badge"; // Assuming this is your custom Badge component
import axios from "axios";
import { format, isToday, isYesterday } from "date-fns";
import { id } from "date-fns/locale";

// Configuration for different notification types
const notificationTypeConfig = {
  target_tercapai: {
    label: "Target Tercapai",
    color: "success",
    icon: <CheckCircleIcon fontSize="small" />,
    bgColor: "rgba(46, 125, 50, 0.1)",
    borderColor: "rgba(46, 125, 50, 0.3)",
  },
  progres_pembangunan: {
    label: "Update Progres",
    color: "info",
    icon: <CampaignIcon fontSize="small" />,
    bgColor: "rgba(3, 169, 244, 0.1)",
    borderColor: "rgba(3, 169, 244, 0.3)",
  },
  donasi_diterima: {
    label: "Donasi Diterima",
    color: "warning",
    icon: <AttachMoneyIcon fontSize="small" />,
    bgColor: "rgba(255, 152, 0, 0.1)",
    borderColor: "rgba(255, 152, 0, 0.3)",
  },
};

// Notification card skeleton loader component
const NotificationSkeleton = ({ count = 3 }) => (
  <Grid container spacing={2}>
    {[...Array(count)].map((_, index) => (
      <Grid item xs={12} key={index}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Skeleton variant="rectangular" width={120} height={28} sx={{ borderRadius: 1 }} />
            <Box sx={{ flexGrow: 1 }} />
            <Skeleton variant="text" width={120} />
          </Box>
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="75%" />
        </Card>
      </Grid>
    ))}
  </Grid>
);

// Empty state component for when there are no notifications
const EmptyState = ({ filterType, onReset }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      py: 8,
      textAlign: 'center',
    }}
  >
    <Zoom in={true} style={{ transitionDelay: '300ms' }}>
      <NotificationsIcon 
        sx={{ 
          fontSize: 80, 
          color: 'rgba(89, 185, 151, 0.2)', // Light green color from your design
          mb: 2,
        }} 
      />
    </Zoom>
    <Typography variant="h6" color="text.secondary" gutterBottom>
      {filterType 
        ? `Tidak ada notifikasi dengan tipe "${notificationTypeConfig[filterType]?.label || filterType}"` 
        : "Tidak ada notifikasi"}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
      {filterType 
        ? "Coba pilih filter lain atau tampilkan semua notifikasi" 
        : "Anda akan menerima notifikasi tentang donasi dan progres pembangunan masjid di sini"}
    </Typography>
    {filterType && (
      <Button 
        startIcon={<RefreshIcon />}
        variant="outlined" 
        onClick={onReset}
        sx={{
          borderRadius: 2,
          borderColor: '#59B997',
          color: '#59B997',
          '&:hover': {
            borderColor: '#59B997',
            backgroundColor: 'rgba(89, 185, 151, 0.1)',
          }
        }}
      >
        Tampilkan Semua
      </Button>
    )}
  </Box>
);

const DonaturUserNotifikasi = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [refreshKey, setRefreshKey] = useState(0); // Key to force re-fetch

  // Function to fetch notifications from the API
  const fetchNotifications = async (type = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (type) params.tipe = type;
      const token = localStorage.getItem("token"); // Get authentication token
      
      if (!token) {
        setError("Autentikasi diperlukan. Silakan login kembali.");
        setNotifications([]);
        setLoading(false);
        return;
      }

      const response = await axios.get("/api/notifikasi", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      if (error.response) {
        if (error.response.status === 401) {
          setError("Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.");
          // Consider redirecting to login page here if authentication fails
        } else if (error.response.data && error.response.data.message) {
          setError(`Gagal memuat notifikasi: ${error.response.data.message}`);
        } else {
          setError("Gagal memuat notifikasi. Terjadi masalah pada server.");
        }
      } else if (error.request) {
        setError("Gagal memuat notifikasi. Tidak ada respon dari server.");
      } else {
        setError("Gagal memuat notifikasi. Silakan coba lagi.");
      }
      setNotifications([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 600); // Simulate network latency for skeleton loader visibility
    }
  };

  // --- MOCK DATA FOR DEVELOPMENT (REMOVE IN PRODUCTION) ---
  // This useEffect will run when the component mounts and set mock data.
  // Comment out or remove this block when you are ready to use your actual API.
  useEffect(() => {
    const mockNotifications = [
      {
        notifikasi_id: "notif_001",
        tipe: "donasi_diterima",
        judul: "Donasi Anda Berhasil Diterima!",
        pesan: "Terima kasih atas donasi sebesar Rp 500.000 untuk pembangunan Masjid Agung. Semoga menjadi amal jariyah.",
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      },
      {
        notifikasi_id: "notif_002",
        tipe: "progres_pembangunan",
        judul: "Update Progres Pembangunan Masjid",
        pesan: "Pembangunan Masjid Baiturrahman telah mencapai 75%. Saat ini sedang dalam tahap pemasangan atap dan jendela. Terima kasih atas dukungan Anda!",
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
      },
      {
        notifikasi_id: "notif_003",
        tipe: "target_tercapai",
        judul: "Selamat! Target Donasi Tercapai",
        pesan: "Alhamdulillah, target donasi untuk Masjid Nurul Iman sebesar Rp 1.000.000.000 telah tercapai. Terima kasih kepada seluruh donatur!",
        created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), // Yesterday
      },
      {
        notifikasi_id: "notif_004",
        tipe: "donasi_diterima",
        judul: "Donasi Anda Telah Terkonfirmasi",
        pesan: "Donasi Anda sebesar Rp 100.000 untuk Masjid Al-Ikhlas sudah kami terima dan akan segera diproses. Jazakallah Khairan.",
        created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // 3 days ago
      },
      {
        notifikasi_id: "notif_005",
        tipe: "progres_pembangunan",
        judul: "Fondasi Masjid Sudah Selesai",
        pesan: "Tahap fondasi pembangunan Masjid Raya telah rampung. Pengerjaan selanjutnya adalah pembangunan dinding. Mohon doa dan dukungannya.",
        created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(), // 7 days ago
      },
      {
        notifikasi_id: "notif_006",
        tipe: "donasi_diterima",
        judul: "Penerimaan Donasi Cash",
        pesan: "Kami telah menerima donasi tunai dari Anda sebesar Rp 75.000. Catatan donasi Anda telah diperbarui.",
        created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), // 10 days ago
      },
    ];

    // Simulate API call delay
    setLoading(true);
    setTimeout(() => {
      // Apply filter to mock data
      const filteredMock = filterType 
        ? mockNotifications.filter(notif => notif.tipe === filterType)
        : mockNotifications;
      setNotifications(filteredMock);
      setLoading(false);
      setError(null); // Clear any previous errors when mock data is loaded
    }, 1000); // 1 second delay for mock data
  }, [filterType, refreshKey]); // Re-run when filterType or refreshKey changes
  // --- END MOCK DATA BLOCK ---

  // Actual API call useEffect (Uncomment and ensure token is handled properly)
  // useEffect(() => {
  //   fetchNotifications(filterType);
  // }, [filterType, refreshKey]); 


  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleResetFilter = () => {
    setFilterType("");
  };

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Formats date/time string to be human-readable, with "Hari ini" and "Kemarin"
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isToday(date)) {
        return `Hari ini, ${format(date, "HH:mm", { locale: id })}`;
      } else if (isYesterday(date)) {
        return `Kemarin, ${format(date, "HH:mm", { locale: id })}`;
      }
      return format(date, "dd MMMM yyyy, HH:mm", { locale: id }); // Correct format for full date
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  // Provides relative time (e.g., "5 menit yang lalu", "Kemarin")
  const getRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) {
        return "Baru saja";
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} menit yang lalu`;
      } else if (diffInSeconds < 86400) { 
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} jam yang lalu`;
      } else if (diffInSeconds < 172800) { 
        return "Kemarin";
      } else {
        return formatDateTime(dateString); 
      }
    } catch (e) {
      console.error("Error getting relative time:", e);
      return dateString;
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column",
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%2359B997" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")',
        backgroundAttachment: 'fixed',
      }}
    >
      <Box sx={{ zIndex: 20 }}>
        <NavbarBaru />
      </Box>

      <Container 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          mt: 12,
          py: 4, 
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon sx={{ color: '#59B997', fontSize: 28 }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#59B997',
                transition: 'color 0.3s ease',
              }}
            >
              Notifikasi Saya
            </Typography>
          </Box>
          
          <Tooltip title="Refresh Notifikasi">
            <IconButton 
              onClick={handleRefresh} 
              sx={{ 
                color: '#59B997',
                '&:hover': {
                  backgroundColor: 'rgba(89, 185, 151, 0.1)',
                } 
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRefresh}
              >
                Coba Lagi
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: 3, 
            backgroundColor: 'rgba(89, 185, 151, 0.05)',
            border: '1px solid rgba(89, 185, 151, 0.1)',
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 3, 
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}
          >
            <TextField
              select
              label="Filter Notifikasi"
              value={filterType}
              onChange={handleFilterChange}
              size="small"
              sx={{
                minWidth: 180,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#59B997',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#59B997',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#59B997',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon sx={{ color: '#59B997' }} />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">
                Semua Notifikasi
              </MenuItem>
              {Object.entries(notificationTypeConfig).map(([key, { label }]) => (
                <MenuItem
                  key={key} 
                  value={key}
                >
                  {label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Urutkan"
              value={sortOrder}
              onChange={handleSortOrderChange}
              size="small"
              sx={{
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#59B997',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#59B997',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#59B997',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SortIcon sx={{ color: '#59B997' }} />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="desc">
                Terbaru
              </MenuItem>
              <MenuItem value="asc">
                Terlama
              </MenuItem>
            </TextField>
          </Box>
        </Paper>

        {loading ? (
          <NotificationSkeleton count={5} />
        ) : notifications.length === 0 ? (
          <EmptyState filterType={filterType} onReset={handleResetFilter} />
        ) : (
          <Grid container spacing={2}>
            {notifications
              .slice()
              .sort((a, b) => {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
              })
              .map((notif, index) => {
                const config = notificationTypeConfig[notif.tipe] || notificationTypeConfig["donasi_diterima"];
                return (
                  <Grid item xs={12} key={notif.notifikasi_id || index}>
                    <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          borderColor: config.borderColor,
                          backgroundColor: config.bgColor,
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                            <Badge color={config.color} variant="solid" size="md" startIcon={config.icon}>
                              {config.label}
                            </Badge>
                            <Box sx={{ flexGrow: 1 }} />
                            <Tooltip title={formatDateTime(notif.created_at)}>
                              <Chip 
                                label={getRelativeTime(notif.created_at)} 
                                size="small" 
                                sx={{ 
                                  fontSize: '0.75rem',
                                  backgroundColor: 'rgba(0,0,0,0.05)',
                                  '& .MuiChip-label': { px: 1 }
                                }} 
                              />
                            </Tooltip>
                          </Box>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              whiteSpace: "pre-line",
                              fontWeight: 'medium',
                              mb: 0.5,
                            }}
                          >
                            {notif.judul || (notif.tipe === 'donasi_diterima' ? 'Donasi Berhasil' : 'Pemberitahuan')}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ whiteSpace: "pre-line" }}
                          >
                            {notif.pesan}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                );
              })}
          </Grid>
        )}
      </Container>

      <Box sx={{ zIndex: 10 }}>
        <SimpleFooter />
      </Box>
    </Box>
  );
};

export default DonaturUserNotifikasi;