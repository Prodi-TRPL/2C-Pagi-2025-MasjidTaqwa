import React, { useEffect, useState } from "react";
import NavbarBaru from '../components/LandingPage/NavbarBaru'; 
import { SimpleFooter } from "../components/LandingPage/SimpleFooter";
import { Box, Container, Grid, Card, Typography, TextField, MenuItem, Fade } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CampaignIcon from '@mui/icons-material/Campaign';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Badge from "../components/ui/badge/Badge";
import axios from "axios";
import { format } from "date-fns";

const notificationTypeConfig = {
  target_tercapai: {
    label: "Target Tercapai",
    color: "success",
    icon: <CheckCircleIcon fontSize="small" />
  },
  progres_pembangunan: {
    label: "Update Progres",
    color: "info",
    icon: <CampaignIcon fontSize="small" />
  },
  donasi_diterima: {
    label: "Donasi Diterima",
    color: "warning",
    icon: <AttachMoneyIcon fontSize="small" />
  }
};

const primaryColor = '#59B997';
const contrastColor = 'black';

const DonaturUserNotifikasi = () => {
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchNotifications = async (type = "") => {
    setLoading(true);
    try {
      const params = {};
      if (type) params.tipe = type;
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/notifikasi", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(filterType);
  }, [filterType]);

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Box className="mt-23" sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ zIndex: 20 }}>
        <NavbarBaru />
      </Box>

      <Container component="main" sx={{ flexGrow: 1, py: 4, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 2 }}>
        <Typography variant="h5" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            color: primaryColor,
            mb: 3,
            transition: 'color 0.3s ease',
          }}>
          Notifikasi Saya
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', maxWidth: 500 }}>
          <TextField
            select
            label="Filter Notifikasi"
            value={filterType}
            onChange={handleFilterChange}
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
              '&:hover .MuiSelect-select': {
                backgroundColor: primaryColor,
                color: contrastColor,
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
            <MenuItem value="">
              Semua
            </MenuItem>
            {Object.entries(notificationTypeConfig).map(([key, { label }]) => (
              <MenuItem
                key={key}
                value={key}
                sx={{
                  '&:hover': {
                    backgroundColor: `${primaryColor}80`,
                    color: contrastColor,
                  },
                }}
              >
                {label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Urutkan Tanggal"
            value={sortOrder}
            onChange={handleSortOrderChange}
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
              Terbaru
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
              Terlama
            </MenuItem>
          </TextField>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <Box
              component="span"
              sx={{
                width: 24,
                height: 24,
                border: '3px solid',
                borderColor: 'primary.main',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
            <Typography sx={{ ml: 2 }}>Loading notifikasi...</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Typography>Tidak ada notifikasi.</Typography>
        ) : (
          <Grid container spacing={2}>
            {notifications
              .slice()
              .sort((a, b) => {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
              })
              .map((notif) => {
                const config = notificationTypeConfig[notif.tipe] || notificationTypeConfig["donasi_diterima"];
                return (
                  <Fade in={true} timeout={500} key={notif.notifikasi_id}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 2,
                          cursor: "pointer",
                          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            transform: "scale(1.03)",
                          },
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Badge color={config.color} variant="solid" size="md" startIcon={config.icon}>
                          {config.label}
                        </Badge>
                        {/*
                        <Typography variant="subtitle1" fontWeight="bold" flexGrow={1}>
                          {config.label}
                        </Typography>
                        */}
                        <Typography variant="caption" color="text.secondary" whiteSpace="nowrap">
                          {formatDateTime(notif.created_at)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-line" }}>
                        {notif.pesan}
                      </Typography>
                    </Card>
                  </Fade>
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
