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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavbarBaru from '../components/LandingPage/NavbarBaru';
import { SimpleFooter } from '../components/LandingPage/SimpleFooter';

const primaryColor = '#59B997';
const contrastColor = '#ffffff';

const statusOptions = ['Semua', 'Menunggu', 'Diterima', 'Kadaluarsa'];

const statusColors = {
  Diterima: primaryColor,
  Menunggu: '#FFA500', // orange
  Kadaluarsa: '#FF6347', // tomato red
};

function DonaturUserRiwayatTransaksi() {
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
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

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

  return (
    <>
      <NavbarBaru />
      <Container maxWidth="lg" sx={{ mt: 15, mb: 4}}>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            color: primaryColor,
            mb: 3,
            transition: 'color 0.3s ease',
          }}
        >
          Riwayat Transaksi Donasi
        </Typography>

        {loading && <Typography>Memuat data donasi...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {!loading && !error && (
          <>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', }}>
              <TextField
                select
                label="Filter Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
                sx={{ 
                  minWidth: 150, 
                  transition: 'all 0.3s ease',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: primaryColor,
                    },
                  },
                  '& .MuiSelect-select': {
                    transition: 'background-color 0.3s ease',
                  },
                  '&:active .MuiSelect-select': {
                    backgroundColor: primaryColor,
                    color: contrastColor,
                    transition: 'background-color 0.2s ease',
                  },
                }}
                InputLabelProps={{
                  sx: { color: primaryColor },
                }}
              >
                {statusOptions.map((option) => (
                  <MenuItem 
                    key={option} 
                    value={option}
                    sx={{
                      '&:hover': {
                        backgroundColor: `${primaryColor}80`,
                        color: contrastColor,
                      },
                    }}
                  >
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Urutkan Tanggal"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                size="small"
                sx={{ 
                  minWidth: 180, 
                  transition: 'all 0.3s ease',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: primaryColor,
                    },
                  },
                  '& .MuiSelect-select': {
                    transition: 'background-color 0.3s ease',
                  },
                  '&:active .MuiSelect-select': {
                    backgroundColor: primaryColor,
                    color: contrastColor,
                    transition: 'background-color 0.2s ease',
                  },
                }}
                InputLabelProps={{
                  sx: { color: primaryColor },
                }}
              >
                <MenuItem 
                  value="desc"
                  sx={{
                    '&:hover': {
                      backgroundColor: `${primaryColor}80`,
                      color: contrastColor,
                    },
                  }}
                >
                  Terbaru ke Terlama
                </MenuItem>
                <MenuItem 
                  value="asc"
                  sx={{
                    '&:hover': {
                      backgroundColor: `${primaryColor}80`,
                      color: contrastColor,
                    },
                  }}
                >
                  Terlama ke Terbaru
                </MenuItem>
              </TextField>
            </Box>

            <Paper>
              <TableContainer>
                <Table sx={{ minWidth: 650, transition: 'all 0.3s ease' }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: primaryColor, '& th': { color: 'white' } }}>
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
                      .map((donation) => (
                        <TableRow key={donation.donasi_id}>
                          <TableCell>
                            {new Date(donation.tanggal_donasi).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>
                            Rp {donation.jumlah.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell>
                            {donation.metode_pembayaran?.nama_metode || 'Tidak diketahui'}
                          </TableCell>
                          <TableCell sx={{ color: statusColors[donation.status] || 'inherit', fontWeight: 'bold' }}>
                            {donation.status}
                          </TableCell>
                          <TableCell>
                            {donation.laporan_keuangan?.periode
                              ? new Date(donation.laporan_keuangan.periode).toLocaleDateString('id-ID', {
                                  month: 'long',
                                  year: 'numeric',
                                })
                              : '-'}
                          </TableCell>
                          <TableCell align="center">
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={() => handleOpenDialog(donation)}
                              sx={{
                                color: primaryColor,
                                borderColor: primaryColor,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: primaryColor,
                                  color: contrastColor,
                                  borderColor: primaryColor,
                                },
                                '&:active': {
                                  transform: 'scale(0.95)',
                                  backgroundColor: contrastColor,
                                  color: primaryColor,
                                  borderColor: primaryColor,
                                },
                              }}
                            >
                              Lihat Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {filteredDonations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Belum ada donasi yang sesuai filter.
                        </TableCell>
                      </TableRow>
                    )}
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
                sx={{
                  '& .Mui-selected': {
                    backgroundColor: `${primaryColor}40 !important`,
                  },
                  '& .MuiPaginationItem-root:hover': {
                    backgroundColor: `${primaryColor}20`,
                  },
                }}
              />
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
              <DialogTitle>
                Detail Donasi
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
              <DialogContent dividers>
                {selectedDonation && (
                  <>
                    <Typography gutterBottom>
                      <strong>Tanggal Donasi:</strong>{' '}
                      {new Date(selectedDonation.tanggal_donasi).toLocaleString('id-ID')}
                    </Typography>
                    <Typography gutterBottom>
                      <strong>Jumlah Donasi:</strong> Rp {selectedDonation.jumlah.toLocaleString('id-ID')}
                    </Typography>
                    <Typography gutterBottom>
                      <strong>Metode Pembayaran:</strong>{' '}
                      {selectedDonation.metode_pembayaran?.nama_metode || 'Tidak diketahui'}
                    </Typography>
                    <Typography gutterBottom>
                      <strong>Status:</strong> {selectedDonation.status}
                    </Typography>
                    <Typography gutterBottom>
                      <strong>Periode Laporan:</strong>{' '}
                      {selectedDonation.laporan_keuangan?.periode
                        ? new Date(selectedDonation.laporan_keuangan.periode).toLocaleDateString('id-ID', {
                            month: 'long',
                            year: 'numeric',
                          })
                        : '-'}
                    </Typography>
                    {selectedDonation.keterangan && (
                      <Typography gutterBottom>
                        <strong>Keterangan:</strong> {selectedDonation.keterangan}
                      </Typography>
                    )}
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog} sx={{ color: primaryColor }}>
                  Tutup
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Container>
      <SimpleFooter />
    </>
  );
}

export default DonaturUserRiwayatTransaksi;
