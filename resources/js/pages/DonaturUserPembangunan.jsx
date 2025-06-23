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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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

const DonaturUserPembangunan = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [progressData, setProgressData] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [refreshKey, setRefreshKey] = useState(0); // Key to force re-fetch

  // --- MOCK DATA FOR DEVELOPMENT (REMOVE IN PRODUCTION) ---
  useEffect(() => {
    const mockProgressData = [
      {
        id: "progress_001",
        nama_item: "Masjid Agung",
        deskripsi: "Pembangunan Masjid Agung sedang dalam tahap pemasangan atap. Mohon doa dan dukungan.",
        target_dana: 1000000000,
        dana_terkumpul: 650000000,
        waktu: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
      },
      {
        id: "progress_002",
        nama_item: "Masjid Baiturrahman",
        deskripsi: "Pembangunan Masjid Baiturrahman telah mencapai 80%. Saat ini sedang memasang jendela.",
        target_dana: 800000000,
        dana_terkumpul: 640000000,
        waktu: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), // 1 day ago
      },
      {
        id: "progress_003",
        nama_item: "Masjid Nurul Iman",
        deskripsi: "Pembangunan Masjid Nurul Iman telah selesai. Terima kasih atas dukungan semua donatur!",
        target_dana: 1200000000,
        dana_terkumpul: 1200000000,
        waktu: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), // 5 days ago
      },
      {
        id: "progress_004",
        nama_item: "Masjid Al-Ikhlas",
        deskripsi: "Fondasi pembangunan Masjid Al-Ikhlas telah selesai. Tahap selanjutnya adalah pembangunan dinding.",
        target_dana: 600000000,
        dana_terkumpul: 240000000,
        waktu: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(), // 7 days ago
      },
      {
        id: "progress_005",
        nama_item: "Masjid Raya",
        deskripsi: "Pembangunan Masjid Raya sedang dalam tahap pondasi. Mohon doa dan dukungan.",
        target_dana: 500000000,
        dana_terkumpul: 125000000,
        waktu: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), // 10 days ago
      },
    ];

    setLoading(true);
    setTimeout(() => {
      const filteredProgress = filterType
        ? mockProgressData.filter(item => item.status.toLowerCase().includes(filterType.toLowerCase()))
        : mockProgressData;
      setProgressData(filteredProgress);
      setLoading(false);
      setError(null);
    }, 1000);
  }, [filterType, refreshKey]);
  // --- END MOCK DATA BLOCK ---

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
      return format(date, "dd MMMM yyyy, HH:mm", { locale: id });
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
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%2359B997" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")',
        backgroundAttachment: "fixed",
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
              Progress Pembangunan
            </Typography>
          </Box>

          <Tooltip title="Refresh Progress">
            <IconButton
              onClick={handleRefresh}
              sx={{
                color: '#59B997',
                '&:hover': {
                  backgroundColor: 'rgba(89, 185, 151, 0.1)',
                },
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
              label="Filter Progress"
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
                Semua Progress
              </MenuItem>
              <MenuItem value="pemasangan atap">Pemasangan Atap</MenuItem>
              <MenuItem value="pemasangan jendela">Pemasangan Jendela</MenuItem>
              <MenuItem value="selesai">Selesai</MenuItem>
              <MenuItem value="pondasi selesai">Pondasi Selesai</MenuItem>
              <MenuItem value="pondasi">Pondasi</MenuItem>
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
        ) : progressData.length === 0 ? (
          <EmptyState filterType={filterType} onReset={handleResetFilter} />
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader size={isMobile ? "small" : "medium"}>
              <TableHead sx={{ backgroundColor: '#59B997' }}>
                <TableRow>
                  <TableCell sx={{ backgroundColor: '#59B997', color: 'white', fontWeight: 'bold' }}>Nama Item</TableCell>
                  <TableCell sx={{ backgroundColor: '#59B997', color: 'white', fontWeight: 'bold' }}>Deskripsi</TableCell>
                  <TableCell sx={{ backgroundColor: '#59B997', color: 'white', fontWeight: 'bold' }}>Target Dana</TableCell>
                  <TableCell sx={{ backgroundColor: '#59B997', color: 'white', fontWeight: 'bold' }}>Dana Terkumpul</TableCell>
                  <TableCell sx={{ backgroundColor: '#59B997', color: 'white', fontWeight: 'bold' }}>Waktu</TableCell>
                </TableRow>
              </TableHead>
          <TableBody>
            {progressData
              .slice()
              .sort((a, b) => {
                const dateA = new Date(a.waktu);
                const dateB = new Date(b.waktu);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
              })
              .map((progress, index) => (
                <TableRow key={progress.id} hover sx={{ cursor: 'pointer', backgroundColor: index % 2 === 0 ? 'rgba(89, 185, 151, 0.1)' : 'rgba(89, 185, 151, 0.05)' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#59B997' }}>{progress.nama_item}</TableCell>
                  <TableCell sx={{ maxWidth: 300, whiteSpace: 'normal', wordWrap: 'break-word' }}>{progress.deskripsi}</TableCell>
                  <TableCell sx={{ color: '#59B997' }}>{progress.target_dana ? progress.target_dana.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : '-'}</TableCell>
                  <TableCell sx={{ width: 200 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ width: '100%', height: 20, backgroundColor: '#ddd', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
                        <Box
                          sx={{
                            width: progress.target_dana ? `${Math.min((progress.dana_terkumpul / progress.target_dana) * 100, 100)}%` : '0%',
                            height: '100%',
                            backgroundColor: '#457B9D',
                            borderRadius: 1,
                            transition: 'width 0.5s ease-in-out',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#020426',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            whiteSpace: 'nowrap',
                            px: 1,
                          }}
                        >
                          {progress.dana_terkumpul ? progress.dana_terkumpul.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : '-'}
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{formatDateTime(progress.waktu)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      <Box sx={{ zIndex: 10 }}>
        <SimpleFooter />
      </Box>
    </Box>
  );
};

export default DonaturUserPembangunan;
