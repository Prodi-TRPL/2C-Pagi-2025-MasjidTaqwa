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
            <TableCell>ID Transaksi</TableCell>
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
              <TableCell><Skeleton width={140} /></TableCell>
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

// Updated EmptyState component - removed statusFilter parameter since we only show accepted donations
const EmptyState = () => (
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
      Belum ada riwayat donasi yang diterima
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
      Riwayat donasi yang sudah diterima akan muncul di sini setelah Anda melakukan donasi.
    </Typography>
    <Button 
      variant="contained" 
      component="a"
      href="/donasi"
      startIcon={<AttachMoneyIcon />}
      sx={{
        borderRadius: 2,
        bgcolor: '#59B997',
        '&:hover': { bgcolor: '#4a9d80' },
      }}
    >
      Donasi Sekarang
    </Button>
  </Box>
);

// Mobile card view component for responsive design
const MobileCardView = ({ donations, handleOpenDialog }) => (
  <Grid container spacing={2}>
    {donations.map((donation, index) => {
      const status = statusConfig[donation.status] || statusConfig.Menunggu;
      
      // Ensure jumlah is a number
      const numericAmount = typeof donation.jumlah === 'number' 
        ? donation.jumlah 
        : parseInt(String(donation.jumlah).replace(/[^\d]/g, ''), 10) || 0;
      
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
                      {format(new Date(donation.tanggal_donasi || donation.created_at), "dd MMMM yyyy", { locale: id })}
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
                  Rp {numericAmount.toLocaleString('id-ID')}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PaymentIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2">
                    {donation.payment_method_name || 
                     formatPaymentMethod(donation.payment_type) || 
                     'Tidak diketahui'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ReceiptIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                  <Typography 
                    variant="body2" 
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ID: {donation.order_id || donation.donasi_id || '-'}
                  </Typography>
                </Box>
                
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
        if (!token) {
          setError('Sesi login tidak ditemukan. Silakan login kembali.');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/donasi/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Sesi login telah berakhir. Silakan login kembali.');
          } else {
            throw new Error('Gagal mengambil data donasi');
          }
          return;
        }
        
        const data = await response.json();
        
        // Check if data has the correct structure
        const donationsArray = data.donations || data;
        
        if (Array.isArray(donationsArray)) {
          // Transform donation data and filter to show ONLY "Diterima" status
          const processedDonations = donationsArray
            .filter(donation => donation.status === 'Diterima')
            .map(donation => {
              // Debug the raw amount value
              console.log(`Raw donation amount for ${donation.donasi_id || 'unknown'}: ${donation.jumlah}, type: ${typeof donation.jumlah}`);
              
              // Process jumlah correctly based on data type
              let amount = donation.jumlah;
              
              // Use toString() to ensure we're working with a string, then remove non-digits
              if (amount !== undefined && amount !== null) {
                // Convert to string first for consistent handling
                const amountStr = String(amount);
                
                // Check if the string already contains digits only
                const isCleanDigits = /^\d+$/.test(amountStr);
                
                if (isCleanDigits) {
                  // If it's already clean digits, parse it directly
                  amount = parseInt(amountStr, 10);
                } else {
                  // Otherwise, remove non-digits and then parse
                  amount = parseInt(amountStr.replace(/[^\d]/g, ''), 10);
                }
                
                console.log(`Processed amount (after parsing): ${amount}`);
              } else {
                // Default to 0 if undefined or null
                amount = 0;
              }
              
              // Critical debugging
              console.log(`Final donation amount for ${donation.donasi_id || 'unknown'}: Original=${donation.jumlah}, Processed=${amount}`);
              
              return {
                ...donation,
                // If tanggal_donasi is missing, use created_at
                tanggal_donasi: donation.tanggal_donasi || donation.created_at,
                // Store the processed amount without any additional manipulation
                jumlah: amount,
                // Preserve raw amount for debugging
                raw_jumlah: donation.jumlah,
                // Handle payment method display
                payment_method_name: donation.payment_method_name || 
                  (donation.payment_type ? formatPaymentMethod(donation.payment_type) : 'Midtrans')
              };
            });
          
          console.log('Processed donations:', processedDonations);
          setDonations(processedDonations);
          setFilteredDonations(processedDonations);
        } else {
          console.error('Unexpected data format:', data);
          setError('Format data tidak valid');
        }
      } catch (err) {
        console.error('Error fetching donations:', err);
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
    // Only sort by date - no filtering since we only display "Diterima" status
    let filtered = [...donations];
    filtered.sort((a, b) => {
      const dateA = new Date(a.tanggal_donasi);
      const dateB = new Date(b.tanggal_donasi);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setFilteredDonations(filtered);
    setPage(0);
  }, [sortOrder, donations]);

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
    // Debugging to track value before formatting
    console.log(`Formatting currency: ${amount}, type: ${typeof amount}`);
    
    // Handle different types safely
    let numericAmount;
    
    // First, ensure we're working with a number
    if (typeof amount === 'string') {
      // If string contains formatting characters, remove them
      const cleanAmount = amount.replace(/[^\d.-]/g, '');
      numericAmount = parseFloat(cleanAmount);
    } else {
      numericAmount = Number(amount);
    }
    
    // Check for valid number
    if (isNaN(numericAmount)) {
      console.error('Invalid amount value:', amount);
      return 'Rp 0';
    }
    
    console.log(`After conversion to number: ${numericAmount}`);
    
    try {
      return `Rp ${numericAmount.toLocaleString('id-ID')}`;
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `Rp ${amount}`;
    }
  };

  // Function to format payment method names
  const formatPaymentMethod = (paymentType) => {
    if (!paymentType) return 'Tidak diketahui';
    
    const methodMap = {
      'bank_transfer': 'Transfer Bank',
      'echannel': 'Virtual Account',
      'gopay': 'GoPay',
      'shopeepay': 'ShopeePay',
      'credit_card': 'Kartu Kredit',
      'cstore': 'Convenience Store',
      'midtrans': 'Midtrans',
    };
    
    return methodMap[paymentType.toLowerCase()] || 
      paymentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
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
            <div>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#59B997',
                }}
              >
                Riwayat Donasi Diterima
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Daftar donasi yang telah berhasil diterima dan diproses
              </Typography>
            </div>
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
              alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}
          >
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

            {/* Add "Donasi Sekarang" button in the filter section for better visibility */}
            {!isMobile && filteredDonations.length > 0 && (
              <Button 
                variant="contained" 
                component="a"
                href="/donasi"
                startIcon={<AttachMoneyIcon />}
                sx={{
                  ml: 'auto',
                  borderRadius: 2,
                  bgcolor: '#59B997',
                  '&:hover': { bgcolor: '#4a9d80' },
                }}
              >
                Donasi Sekarang
              </Button>
            )}
          </Box>
        </Paper>

        {loading ? (
          <TableSkeleton />
        ) : filteredDonations.length === 0 ? (
          <EmptyState />
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
                      <TableCell>ID Transaksi</TableCell>
                      <TableCell align="center">Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDonations
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((donation, index) => {
                        const status = statusConfig[donation.status] || statusConfig.Diterima;
                        
                        // Debug donation amount
                        console.log(`Rendering donation ${index}: id=${donation.donasi_id}, amount=${donation.jumlah}, raw=${donation.raw_jumlah}`);
                        
                        // Ensure jumlah is a number
                        const numericAmount = typeof donation.jumlah === 'number' 
                          ? donation.jumlah 
                          : parseInt(String(donation.jumlah).replace(/[^\d]/g, ''), 10) || 0;
                        
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
                                {formatDate(donation.tanggal_donasi || donation.created_at)}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'medium' }}>
                              {`Rp ${numericAmount.toLocaleString('id-ID')}`}
                            </TableCell>
                            <TableCell>
                              {donation.payment_method_name || 
                              formatPaymentMethod(donation.payment_type) || 
                              'Tidak diketahui'}
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
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'monospace',
                                  fontSize: '0.75rem',
                                  color: 'text.secondary' 
                                }}
                              >
                                {donation.order_id ? 
                                  donation.order_id.substring(0, 15) + '...' : 
                                  donation.donasi_id ? 
                                    donation.donasi_id.substring(0, 8) : 
                                    '-'}
                              </Typography>
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

        {/* Mobile "Donasi Sekarang" button (only visible if there are already donations) */}
        {isMobile && filteredDonations.length > 0 && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              component="a"
              href="/donasi"
              startIcon={<AttachMoneyIcon />}
              fullWidth
              sx={{
                borderRadius: 2,
                py: 1.5,
                bgcolor: '#59B997',
                '&:hover': { bgcolor: '#4a9d80' },
              }}
            >
              Donasi Sekarang
            </Button>
          </Box>
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
                Detail Transaksi Donasi Diterima
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
                  {/* Get numeric amount directly */}
                  {(() => {
                    const numericAmount = typeof selectedDonation.jumlah === 'number' 
                      ? selectedDonation.jumlah 
                      : parseInt(String(selectedDonation.jumlah).replace(/[^\d]/g, ''), 10) || 0;
                    
                    console.log(`Dialog amount: original=${selectedDonation.jumlah}, processed=${numericAmount}, type=${typeof selectedDonation.jumlah}`);
                    
                    return (
                      <Typography variant="h5" sx={{ mb: 1, color: '#59B997', fontWeight: 'bold' }}>
                        Rp {numericAmount.toLocaleString('id-ID')}
                      </Typography>
                    );
                  })()}
                  
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
                      <ReceiptIcon sx={{ color: '#59B997' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="ID Transaksi" 
                      secondary={selectedDonation.order_id || selectedDonation.donasi_id || '(Tidak ada ID)'} 
                      secondaryTypographyProps={{
                        sx: { 
                          fontFamily: 'monospace', 
                          fontSize: '0.85rem',
                          wordBreak: 'break-all'
                        }
                      }}
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CalendarTodayIcon sx={{ color: '#59B997' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Tanggal Donasi" 
                      secondary={format(new Date(selectedDonation.tanggal_donasi || selectedDonation.created_at), "dd MMMM yyyy, HH:mm", { locale: id })} 
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <PaymentIcon sx={{ color: '#59B997' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Metode Pembayaran" 
                      secondary={
                        selectedDonation.payment_method_name || 
                        formatPaymentMethod(selectedDonation.payment_type) || 
                        'Tidak diketahui'
                      } 
                    />
                  </ListItem>

                  {selectedDonation.name && (
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#59B997', fontSize: '0.75rem' }}>
                          {selectedDonation.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary="Nama Donatur" 
                        secondary={selectedDonation.name} 
                      />
                    </ListItem>
                  )}

                  {selectedDonation.email && (
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#59B997" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary={selectedDonation.email} 
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

                {selectedDonation.status === 'Diterima' && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(89, 185, 151, 0.1)', borderRadius: 2, border: '1px dashed #59B997' }}>
                    <Typography variant="body2" align="center" color="#59B997" sx={{ fontWeight: 'medium' }}>
                      Terima kasih atas donasi Anda! Semoga kebaikan Anda dibalas berlipat ganda.
                    </Typography>
                  </Box>
                )}
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
