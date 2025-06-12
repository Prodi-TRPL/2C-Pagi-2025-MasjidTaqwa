import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Chip,
  Skeleton,
  InputAdornment,
  Tooltip,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Grid,
  Zoom,
  Alert,
  Divider,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import NavbarBaru from '../components/LandingPage/NavbarBaru';
import { SimpleFooter } from '../components/LandingPage/SimpleFooter';
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Define status configurations
const statusConfig = {
  'Diterima': {
    color: '#59B997',
    bgColor: 'rgba(89, 185, 151, 0.1)',
    borderColor: 'rgba(89, 185, 151, 0.3)',
    icon: <CheckCircleIcon />,
    label: 'Diterima',
  },
  'Menunggu': {
    color: '#FFA500',
    bgColor: 'rgba(255, 165, 0, 0.1)',
    borderColor: 'rgba(255, 165, 0, 0.3)',
    icon: <HourglassEmptyIcon />,
    label: 'Menunggu',
  },
  'Kadaluarsa': {
    color: '#FF6347',
    bgColor: 'rgba(255, 99, 71, 0.1)',
    borderColor: 'rgba(255, 99, 71, 0.3)',
    icon: <ErrorIcon />,
    label: 'Kadaluarsa',
  },
};

const statusOptions = ['Semua', 'Menunggu', 'Diterima', 'Kadaluarsa'];

// Table skeleton loader
const TableSkeleton = () => (
  <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#59B997', '& th': { color: 'white' } }}>
            <TableCell>Tanggal Donasi</TableCell>
            <TableCell>Jumlah</TableCell>
            <TableCell>Metode Pembayaran</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Periode</TableCell>
            <TableCell align="center">Aksi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton width={120} /></TableCell>
              <TableCell><Skeleton width={100} /></TableCell>
              <TableCell><Skeleton width={150} /></TableCell>
              <TableCell><Skeleton width={80} /></TableCell>
              <TableCell><Skeleton width={100} /></TableCell>
              <TableCell align="center"><Skeleton width={90} height={36} sx={{ mx: 'auto', borderRadius: 1 }} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
      <Skeleton width={300} height={40} />
    </Box>
  </Paper>
);

// Empty state component
const EmptyState = ({ statusFilter, onReset }) => (
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
      <ReceiptIcon 
        sx={{ 
          fontSize: 80, 
          color: 'rgba(89, 185, 151, 0.2)',
          mb: 2,
        }} 
      />
    </Zoom>
    <Typography variant="h6" color="text.secondary" gutterBottom>
      {statusFilter !== 'Semua' 
        ? `Belum ada donasi dengan status "${statusFilter}"` 
        : "Belum ada riwayat donasi"}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
      {statusFilter !== 'Semua' 
        ? "Coba pilih filter lain atau tampilkan semua donasi" 
        : "Riwayat donasi Anda akan muncul di sini setelah Anda melakukan donasi"}
    </Typography>
    {statusFilter !== 'Semua' && (
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

// Mobile card view component for responsive design
const MobileCardView = ({ donations, handleOpenDialog }) => (
  <Grid container spacing={2}>
    {donations.map((donation, index) => {
      const status = statusConfig[donation.status] || statusConfig.Menunggu;
      return (
        <Grid item xs={12} key={donation.donasi_id || index}>
          <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
            <Card 
              variant="outlined" 
              sx={{
                borderRadius: 3,
                borderColor: status.borderColor,
                transition: "all 0.3s",
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                },
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(donation.tanggal_donasi), "dd MMMM yyyy", { locale: id })}
                    </Typography>
                  </Box>
                  <Chip 
                    icon={status.icon} 
                    label={status.label}
                    size="small"
                    sx={{ 
                      backgroundColor: status.bgColor,
                      color: status.color,
                      '& .MuiChip-icon': { color: status.color },
                      fontWeight: 500,
                    }}
                  />
                </Box>
                
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon sx={{ mr: 1, color: '#59B997' }} />
                  Rp {donation.jumlah.toLocaleString('id-ID')}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PaymentIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2">
                    {donation.metode_pembayaran?.nama_metode || 'Tidak diketahui'}
                  </Typography>
                </Box>
                
                {donation.laporan_keuangan?.periode && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2">
                      {format(new Date(donation.laporan_keuangan.periode), "MMMM yyyy", { locale: id })}
                    </Typography>
                  </Box>
                )}
                
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => handleOpenDialog(donation)}
                  startIcon={<InfoIcon />}
                  sx={{
                    mt: 2,
                    color: '#59B997',
                    borderColor: '#59B997',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(89, 185, 151, 0.1)',
                      borderColor: '#59B997',
                    },
                  }}
                >
                  Lihat Detail
                </Button>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      );
    })}
  </Grid>
);

function DonaturUserRiwayatTransaksi() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/donasi/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Gagal mengambil data donasi');
        }
        const data = await response.json();
        setDonations(data);
        setFilteredDonations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        // Add slight delay to show loading state
        setTimeout(() => {
          setLoading(false);
        }, 600);
      }
    };
    fetchDonations();
  }, [refreshKey]);

  useEffect(() => {
    let filtered = [...donations];
    if (statusFilter !== 'Semua') {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }
    filtered.sort((a, b) => {
      const dateA = new Date(a.tanggal_donasi);
      const dateB = new Date(b.tanggal_donasi);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setFilteredDonations(filtered);
    setPage(0);
  }, [statusFilter, sortOrder, donations]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (donation) => {
    setSelectedDonation(donation);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedDonation(null);
    setOpenDialog(false);
  };

  const handleResetFilter = () => {
    setStatusFilter('Semua');
  };

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const formatDate = (dateString, formatStr = "dd MMMM yyyy") => {
    try {
      return format(new Date(dateString), formatStr, { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
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
      <NavbarBaru />
      <Container 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1, 
          mt: 12, 
          mb: 4, 
          py: 4, 
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon sx={{ color: '#59B997', fontSize: 28 }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#59B997',
              }}
            >
              Riwayat Transaksi Donasi
            </Typography>
          </Box>
          
          <Tooltip title="Refresh Data">
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
              gap: 2, 
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}
          >
            <TextField
              select
              label="Filter Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Urutkan"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
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
          <TableSkeleton />
        ) : filteredDonations.length === 0 ? (
          <EmptyState statusFilter={statusFilter} onReset={handleResetFilter} />
        ) : isMobile ? (
          <MobileCardView 
            donations={filteredDonations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)} 
            handleOpenDialog={handleOpenDialog} 
          />
        ) : (
          <Fade in={true}>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ 
                      backgroundColor: '#59B997', 
                      '& th': { 
                        color: 'white',
                        fontWeight: 'bold',
                      }
                    }}>
                      <TableCell>Tanggal Donasi</TableCell>
                      <TableCell>Jumlah</TableCell>
                      <TableCell>Metode Pembayaran</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Periode</TableCell>
                      <TableCell align="center">Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDonations
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((donation, index) => {
                        const status = statusConfig[donation.status] || statusConfig.Menunggu;
                        return (
                          <TableRow 
                            key={donation.donasi_id || index}
                            sx={{ 
                              '&:nth-of-type(even)': { 
                                backgroundColor: 'rgba(0, 0, 0, 0.02)'
                              },
                              '&:hover': {
                                backgroundColor: 'rgba(89, 185, 151, 0.05)',
                              },
                              transition: 'background-color 0.3s',
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                {formatDate(donation.tanggal_donasi)}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'medium' }}>
                              {formatCurrency(donation.jumlah)}
                            </TableCell>
                            <TableCell>
                              {donation.metode_pembayaran?.nama_metode || 'Tidak diketahui'}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                icon={status.icon} 
                                label={status.label}
                                size="small"
                                sx={{ 
                                  backgroundColor: status.bgColor,
                                  color: status.color,
                                  '& .MuiChip-icon': { color: status.color },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {donation.laporan_keuangan?.periode
                                ? formatDate(donation.laporan_keuangan.periode, "MMMM yyyy")
                                : '-'}
                            </TableCell>
                            <TableCell align="center">
                              <Button 
                                variant="outlined" 
                                size="small" 
                                onClick={() => handleOpenDialog(donation)}
                                sx={{
                                  color: '#59B997',
                                  borderColor: '#59B997',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: 'rgba(89, 185, 151, 0.1)',
                                    borderColor: '#59B997',
                                  },
                                }}
                              >
                                Lihat Detail
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredDonations.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Baris per halaman:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
                sx={{
                  borderTop: '1px solid rgba(224, 224, 224, 1)',
                  '& .MuiTablePagination-selectIcon': {
                    color: '#59B997',
                  },
                }}
              />
            </Paper>
          </Fade>
        )}

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            }
          }}
        >
          {selectedDonation && (
            <>
              <DialogTitle sx={{ 
                backgroundColor: '#59B997',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
                <ReceiptIcon />
                Detail Transaksi Donasi
                <IconButton
                  aria-label="close"
                  onClick={handleCloseDialog}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: 'white',
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ mb: 1, color: '#59B997', fontWeight: 'bold' }}>
                    {formatCurrency(selectedDonation.jumlah)}
                  </Typography>
                  
                  <Chip 
                    icon={statusConfig[selectedDonation.status]?.icon} 
                    label={selectedDonation.status}
                    sx={{ 
                      backgroundColor: statusConfig[selectedDonation.status]?.bgColor,
                      color: statusConfig[selectedDonation.status]?.color,
                      '& .MuiChip-icon': { color: statusConfig[selectedDonation.status]?.color },
                      fontWeight: 'medium',
                    }}
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <List disablePadding>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CalendarTodayIcon sx={{ color: '#59B997' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Tanggal Donasi" 
                      secondary={format(new Date(selectedDonation.tanggal_donasi), "dd MMMM yyyy, HH:mm", { locale: id })} 
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <PaymentIcon sx={{ color: '#59B997' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Metode Pembayaran" 
                      secondary={selectedDonation.metode_pembayaran?.nama_metode || 'Tidak diketahui'} 
                    />
                  </ListItem>
                  
                  {selectedDonation.laporan_keuangan?.periode && (
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <EventIcon sx={{ color: '#59B997' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Periode Laporan" 
                        secondary={format(new Date(selectedDonation.laporan_keuangan.periode), "MMMM yyyy", { locale: id })} 
                      />
                    </ListItem>
                  )}
                  
                  {selectedDonation.keterangan && (
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <InfoIcon sx={{ color: '#59B997' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Keterangan" 
                        secondary={selectedDonation.keterangan} 
                      />
                    </ListItem>
                  )}
                </List>
              </DialogContent>
              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button 
                  onClick={handleCloseDialog} 
                  variant="contained"
                  sx={{ 
                    bgcolor: '#59B997',
                    '&:hover': { bgcolor: '#4a9d80' },
                    borderRadius: 2,
                  }}
                >
                  Tutup
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
      <SimpleFooter />
    </Box>
  );
}

export default DonaturUserRiwayatTransaksi;
