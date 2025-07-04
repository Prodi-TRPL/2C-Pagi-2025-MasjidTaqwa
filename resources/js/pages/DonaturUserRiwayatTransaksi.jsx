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
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { getUserPermissions, hasPermission, getPermissionDeniedMessage } from "../utils/permissions";
import AccessDeniedModal from "../components/ui/AccessDeniedModal";

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
  const [filterStatus, setFilterStatus] = useState("all");
  const [permissions, setPermissions] = useState(null);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [accessDeniedModal, setAccessDeniedModal] = useState({
    show: false,
    title: "",
    message: ""
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Effect to check permissions
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const userPermissions = await getUserPermissions();
        setPermissions(userPermissions);
        
        // Check if user has the required permission
        if (!hasPermission(userPermissions, 'canViewHistory')) {
          // Show access denied modal
          const { title, message } = getPermissionDeniedMessage('canViewHistory');
          setAccessDeniedModal({
            show: true,
            title,
            message
          });
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
      } finally {
        setPermissionChecked(true);
      }
    };
    
    checkPermission();
  }, []);

  // Don't render the main component content if user doesn't have permission
  if (permissionChecked && permissions) {
    // Helper function to convert various truthy values to boolean
    const toBool = (value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value === 1;
      if (typeof value === 'string') {
        const lower = value.toLowerCase();
        return lower === '1' || lower === 'true' || lower === 'yes';
      }
      return Boolean(value);
    };
    
    const hasViewHistoryPermission = toBool(permissions.canViewHistory);
    
    if (!hasViewHistoryPermission) {
      return (
        <div className="pt-16 relative">
          {/* Navbar */}
          <div className="relative z-20">
            <NavbarBaru />
          </div>
          
          <AccessDeniedModal
            isOpen={accessDeniedModal.show}
            onClose={() => {
              setAccessDeniedModal({ ...accessDeniedModal, show: false });
              navigate('/');
            }}
            title={accessDeniedModal.title}
            message={accessDeniedModal.message}
          />
          
          <Navigate to="/" replace state={{ from: location }} />
        </div>
      );
    }
  }
  
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
                  (donation.payment_type ? formatPaymentMethod(donation.payment_type) : 'Transfer')
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
      'midtrans': 'Transfer',
    };
    
    return methodMap[paymentType.toLowerCase()] || 
      paymentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="pt-16 relative">
      {/* Navbar */}
      <div className="relative z-20">
        <NavbarBaru />
      </div>
      
      {/* Main Content */}
      <Container 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          mt: 5,
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
            <HistoryIcon sx={{ color: '#59B997', fontSize: 28 }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#59B997',
              }}
            >
              Riwayat Transaksi
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
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

        {/* Sorting Controls */}
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

        {/* Donations Table or Empty State */}
        {loading ? (
          <TableSkeleton />
        ) : filteredDonations.length === 0 ? (
          <EmptyState />
        ) : isMobile ? (
          <MobileCardView 
            donations={filteredDonations.slice(
              page * rowsPerPage, 
              page * rowsPerPage + rowsPerPage
            )} 
            handleOpenDialog={handleOpenDialog} 
          />
        ) : (
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
                  {filteredDonations
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((donation) => (
                      <TableRow key={donation.donasi_id}>
                        <TableCell>{formatDate(donation.tanggal_donasi)}</TableCell>
                        <TableCell>{formatCurrency(donation.jumlah)}</TableCell>
                        <TableCell>{donation.payment_method_name}</TableCell>
                        <TableCell>
                          <Chip 
                            label="Diterima"
                            size="small"
                            sx={{ 
                              backgroundColor: 'rgba(89, 185, 151, 0.1)',
                              color: '#59B997',
                              fontWeight: 500,
                            }}
                            icon={<CheckCircleIcon style={{ color: '#59B997' }} />}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                            }}
                          >
                            {donation.order_id || donation.donasi_id || '-'}
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
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredDonations.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Baris per halaman:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
            />
          </Paper>
        )}
      </Container>
      
      {/* Footer */}
      <div className="relative z-10">
        <SimpleFooter />
      </div>
      
      {/* Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }
        }}
      >
        {selectedDonation && (
          <>
            <DialogTitle sx={{ 
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <ReceiptIcon sx={{ color: '#59B997', mr: 1 }} />
              Detail Transaksi Donasi
              <IconButton
                aria-label="close"
                onClick={handleCloseDialog}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 2, pb: 1 }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EventIcon sx={{ color: '#59B997' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tanggal Donasi" 
                    secondary={formatDate(selectedDonation.tanggal_donasi, "dd MMMM yyyy, HH:mm")} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AttachMoneyIcon sx={{ color: '#59B997' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Jumlah Donasi" 
                    secondary={formatCurrency(selectedDonation.jumlah)} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PaymentIcon sx={{ color: '#59B997' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Metode Pembayaran" 
                    secondary={selectedDonation.payment_method_name} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#59B997' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Status" 
                    secondary="Diterima" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ReceiptIcon sx={{ color: '#59B997' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="ID Transaksi" 
                    secondary={selectedDonation.order_id || selectedDonation.donasi_id || '-'} 
                  />
                </ListItem>
              </List>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button 
                onClick={handleCloseDialog}
                variant="contained"
                sx={{
                  bgcolor: '#59B997',
                  '&:hover': {
                    bgcolor: '#47a07f',
                  },
                  borderRadius: 2,
                }}
              >
                Tutup
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}

export default DonaturUserRiwayatTransaksi;
