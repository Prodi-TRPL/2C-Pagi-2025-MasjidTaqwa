import React, { useEffect, useState, useCallback } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Slide,
  Snackbar,
  DialogContentText,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CampaignIcon from '@mui/icons-material/Campaign';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CloseIcon from '@mui/icons-material/Close';
import Badge from "../components/ui/badge/Badge"; // Assuming this is your custom Badge component
import axios from "axios";
import { format, isToday, isYesterday } from "date-fns";
import { id } from "date-fns/locale";
import { getUserPermissions, hasPermission, getPermissionDeniedMessage } from "../utils/permissions";
import AccessDeniedModal from "../components/ui/AccessDeniedModal";
import { useNavigate, useLocation, Navigate } from "react-router-dom";

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
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: "",
    action: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [permissions, setPermissions] = useState(null);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [accessDeniedModal, setAccessDeniedModal] = useState({
    show: false,
    title: "",
    message: ""
  });
  const [lastPermissionCheck, setLastPermissionCheck] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState(null);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState(Date.now());
  const [notificationCount, setNotificationCount] = useState(0);

  // Effect to check permissions - Modified to prevent false triggers
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Add a debounce mechanism to prevent multiple checks in short time
        const now = Date.now();
        if (now - lastPermissionCheck < 5000) {
          // Skip if we checked less than 5 seconds ago
          return;
        }
        
        setLastPermissionCheck(now);
        const userPermissions = await getUserPermissions();
        
        // Store previous permissions to compare
        const prevPermissions = permissions;
        setPermissions(userPermissions);
        
        // Check if user has the required permission
        if (!hasPermission(userPermissions, 'canViewNotification')) {
          // Only show modal if this is the first check or permissions actually changed
          if (!prevPermissions || (prevPermissions && prevPermissions.canViewNotification === true)) {
            const { title, message } = getPermissionDeniedMessage('canViewNotification');
            setAccessDeniedModal({
              show: true,
              title,
              message
            });
          }
        } else {
          // Make sure to hide the modal if permissions were restored
          setAccessDeniedModal({
            show: false,
            title: "",
            message: ""
          });
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
      } finally {
        setPermissionChecked(true);
      }
    };
    
    checkPermission();
    
    // Disable the auto permission checker from permissionChecker.js for this component
    const disableAutoCheck = () => {
      // Check if the global permission checker controller exists
      if (window.__permissionCheckerController) {
        // Store the original state
        window.__permissionCheckerControllerPaused = true;
        // Stop the checker temporarily
        window.__permissionCheckerController.pause?.();
      }
      
      return () => {
        // Resume the checker when component unmounts
        if (window.__permissionCheckerController && window.__permissionCheckerControllerPaused) {
          window.__permissionCheckerControllerPaused = false;
          window.__permissionCheckerController.resume?.();
        }
      };
    };
    
    // Return cleanup function
    return disableAutoCheck();
  }, []);

  // Don't render the main component content if user doesn't have permission
  if (permissionChecked && permissions && !permissions.canViewNotification) {
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

  // Function to fetch notifications from the API
  const fetchNotifications = useCallback(async (type = "", checkForNew = false) => {
    // Don't set loading state if we're just checking for new notifications
    if (!checkForNew) {
      setLoading(true);
      setError(null);
    }
    
    try {
      const token = localStorage.getItem("token"); // Get authentication token
      
      if (!token) {
        setError("Autentikasi diperlukan. Silakan login kembali.");
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Make API call to get user notifications
      const response = await axios.get("/api/notifikasi", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      // Filter notifications by type if specified
      let filteredNotifications = response.data;
      if (type && type !== "") {
        filteredNotifications = response.data.filter(notif => notif.tipe === type);
      }
      
      // Check if there are new notifications since last check
      if (checkForNew && filteredNotifications.length > notificationCount) {
        setHasNewNotifications(true);
      }
      
      // Only update these states if not just checking for new notifications
      if (!checkForNew) {
        // Update notification count
        setNotificationCount(filteredNotifications.length);
        
        // Update notifications list
        setNotifications(filteredNotifications);
        
        // Update last checked time
        setLastCheckedTime(Date.now());
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      
      // Only update error state if not just checking for new
      if (!checkForNew) {
        if (error.response) {
          // Don't show 401 errors as they're handled by the auth system
          if (error.response.status === 401) {
            setError("Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.");
          } else if (error.response.status === 429) {
            setError("Terlalu banyak permintaan. Silakan coba lagi nanti.");
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
      }
    } finally {
      // Only finish loading if not just checking for new
      if (!checkForNew) {
        setTimeout(() => {
          setLoading(false);
        }, 300); // Small delay for better UX
      }
    }
  }, []);

  // Function to check for new notifications without fetching all data
  const checkForNewNotifications = useCallback(async () => {
    // Don't check again if we already know there are new notifications
    if (hasNewNotifications) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Use a separate lightweight endpoint just to check for new notifications
      const response = await axios.get("/api/notifikasi/check-new", {
        params: { since: lastCheckedTime },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (response.data.has_new) {
        setHasNewNotifications(true);
        console.log("New notifications detected:", response.data.count);
      }
      
    } catch (error) {
      // Just log errors but don't update state to avoid loops
      console.error("Failed to check for new notifications:", error);
    }
  }, [hasNewNotifications, lastCheckedTime]);

  // Open notification detail dialog and mark as read
  const openNotificationDetail = (notification) => {
    setSelectedNotification(notification);
    setDetailDialogOpen(true);
    
    // Mark as read if not already read
    if (!notification.is_read) {
      markAsRead(notification.notifikasi_id);
    }
  };
  
  // Close notification detail dialog
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };
  
  // Mark notification as read when opened
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      await axios.post(`/api/notifikasi/mark-as-read/${notificationId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      // Update the local state to reflect the read status with animation
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif.notifikasi_id === notificationId 
            ? { ...notif, is_read: true, justMarkedAsRead: true } 
            : notif
        )
      );
      
      // Remove the animation flag after animation completes
      setTimeout(() => {
        setNotifications(prevNotifications => 
          prevNotifications.map(notif => 
            notif.notifikasi_id === notificationId 
              ? { ...notif, justMarkedAsRead: false } 
              : notif
          )
        );
      }, 1000);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      setSnackbar({
        open: true,
        message: "Gagal menandai notifikasi sebagai dibaca",
        severity: "error"
      });
    }
  };

  // Show confirmation dialog for marking all as read
  const confirmMarkAllAsRead = () => {
    setConfirmDialogAction("markAllAsRead");
    setConfirmDialogOpen(true);
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setConfirmDialogOpen(false);
      const token = localStorage.getItem("token");
      if (!token) return;
      
      await axios.post(`/api/notifikasi/mark-all-as-read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      // Update the local state to reflect all notifications as read
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => ({ ...notif, is_read: true }))
      );
      
      // Show success message
      setSnackbar({
        open: true,
        message: "Semua notifikasi telah ditandai sebagai dibaca",
        severity: "success"
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      setSnackbar({
        open: true,
        message: "Gagal menandai notifikasi sebagai dibaca",
        severity: "error"
      });
    }
  };
  
  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      setConfirmDialogOpen(false);
      const token = localStorage.getItem("token");
      if (!token) return;
      
      await axios.delete(`/api/notifikasi/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      // Remove from local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notif => notif.notifikasi_id !== notificationId)
      );
      
      // Close detail dialog if it was open
      if (detailDialogOpen && selectedNotification?.notifikasi_id === notificationId) {
        setDetailDialogOpen(false);
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: "Notifikasi berhasil dihapus",
        severity: "success"
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
      setSnackbar({
        open: true,
        message: "Gagal menghapus notifikasi",
        severity: "error"
      });
    }
  };
  
  // Show confirmation dialog for deleting a notification
  const confirmDeleteNotification = (notification) => {
    setNotificationToDelete(notification);
    setConfirmDialogAction("deleteNotification");
    setConfirmDialogOpen(true);
  };
  
  // Handle confirmation dialog close
  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
  };
  
  // Handle confirmation dialog confirm action
  const handleConfirmAction = () => {
    if (confirmDialogAction === "markAllAsRead") {
      markAllAsRead();
    } else if (confirmDialogAction === "deleteNotification" && notificationToDelete) {
      deleteNotification(notificationToDelete.notifikasi_id);
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({...snackbar, open: false});
  };

  // Handle refresh button click - Modified to prevent triggering permission check
  const handleRefresh = () => {
    // Clear any error state first
    setError(null);
    
    // Reset new notifications flag
    setHasNewNotifications(false);
    
    // Reset the last checked time to now before fetching
    setLastCheckedTime(Date.now());
    
    // Use refreshKey to trigger a re-fetch
    setRefreshKey(prevKey => prevKey + 1);
    
    // Explicitly update the last permission check time to prevent unnecessary check
    setLastPermissionCheck(Date.now());
  };
  
  // Check for new notifications periodically - Modified to prevent permission checks
  useEffect(() => {
    // Initial fetch
    fetchNotifications(filterType);
    
    // Set up interval to check for new notifications
    const intervalId = setInterval(() => {
      // Only check for new notifications if the user is active on the page
      if (document.visibilityState === 'visible') {
        checkForNewNotifications();
      }
    }, 30000); // Check every 30 seconds
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [filterType]);
  
  // Fetch notifications when refresh key changes
  useEffect(() => {
    fetchNotifications(filterType);
  }, [refreshKey, filterType]);

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleResetFilter = () => {
    setFilterType("");
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
    <div className="pt-16 relative min-h-screen flex flex-col">
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
          {/* New Notification Banner */}
          {hasNewNotifications && (
            <Fade in={true}>
              <Paper
                elevation={0}
                sx={{
                  mb: 3,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(89, 185, 151, 0.15)',
                  border: '1px solid rgba(89, 185, 151, 0.3)',
                  borderRadius: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NotificationsIcon sx={{ color: '#59B997', mr: 2 }} />
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    Ada notifikasi baru! Donasi Anda telah berhasil diproses.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleRefresh}
                  sx={{
                    backgroundColor: '#59B997',
                    '&:hover': {
                      backgroundColor: '#47a07f',
                    },
                    borderRadius: 2,
                  }}
                >
                  Lihat Sekarang
                </Button>
              </Paper>
            </Fade>
          )}

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
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {notifications.length > 0 && (
                <Tooltip title="Tandai Semua Sudah Dibaca">
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={confirmMarkAllAsRead}
                    startIcon={<DoneAllIcon />}
                    sx={{ 
                      borderColor: '#59B997',
                      color: '#59B997',
                      '&:hover': {
                        borderColor: '#59B997',
                        backgroundColor: 'rgba(89, 185, 151, 0.1)',
                      }
                    }}
                  >
                    Tandai Semua Dibaca
                  </Button>
                </Tooltip>
              )}
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
                            cursor: 'pointer',
                            borderRadius: 3,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            borderColor: notif.is_read ? 'rgba(0,0,0,0.12)' : config.borderColor,
                            backgroundColor: notif.is_read ? 'white' : config.bgColor,
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                            },
                            position: 'relative',
                            overflow: 'hidden',
                            animation: notif.justMarkedAsRead ? 'pulse 1s' : 'none',
                            '@keyframes pulse': {
                              '0%': {
                                boxShadow: '0 0 0 0 rgba(89, 185, 151, 0.7)',
                              },
                              '70%': {
                                boxShadow: '0 0 0 10px rgba(89, 185, 151, 0)',
                              },
                              '100%': {
                                boxShadow: '0 0 0 0 rgba(89, 185, 151, 0)',
                              },
                            },
                          }}
                          onClick={() => openNotificationDetail(notif)}
                        >
                          {!notif.is_read && (
                            <Box 
                              sx={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8, 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                backgroundColor: '#59B997',
                              }} 
                            />
                          )}
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
                              <Tooltip title="Hapus Notifikasi">
                                <IconButton 
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    confirmDeleteNotification(notif);
                                  }}
                                  sx={{ 
                                    ml: 0.5, 
                                    color: 'rgba(0,0,0,0.3)',
                                    '&:hover': { 
                                      color: 'rgba(239, 68, 68, 0.7)',
                                      backgroundColor: 'rgba(239, 68, 68, 0.1)'
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                whiteSpace: "pre-line",
                                fontWeight: notif.is_read ? 'normal' : 'medium',
                                mb: 0.5,
                                transition: 'all 0.3s ease',
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
        
        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={handleConfirmDialogClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            }
          }}
        >
          <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
            {confirmDialogAction === "markAllAsRead" 
              ? "Tandai Semua Notifikasi Dibaca?" 
              : "Hapus Notifikasi?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description" sx={{ mb: 1 }}>
              {confirmDialogAction === "markAllAsRead" 
                ? "Apakah Anda yakin ingin menandai semua notifikasi sebagai sudah dibaca?" 
                : "Apakah Anda yakin ingin menghapus notifikasi ini? Tindakan ini tidak dapat dibatalkan."}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={handleConfirmDialogClose}
              variant="outlined"
              sx={{
                borderColor: 'rgba(0,0,0,0.23)',
                color: 'rgba(0,0,0,0.87)',
                '&:hover': {
                  borderColor: 'rgba(0,0,0,0.5)',
                  backgroundColor: 'rgba(0,0,0,0.04)',
                },
                borderRadius: 2,
              }}
            >
              Batal
            </Button>
            <Button 
              onClick={handleConfirmAction}
              variant="contained"
              autoFocus
              sx={{
                bgcolor: confirmDialogAction === "deleteNotification" ? '#ef4444' : '#59B997',
                '&:hover': {
                  bgcolor: confirmDialogAction === "deleteNotification" ? '#dc2626' : '#47a07f',
                },
                borderRadius: 2,
              }}
            >
              {confirmDialogAction === "markAllAsRead" ? "Tandai Semua" : "Hapus"}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          TransitionComponent={Slide}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity} 
            variant="filled"
            sx={{ 
              width: '100%',
              borderRadius: 2,
              alignItems: 'center'
            }}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleSnackbarClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Notification Detail Dialog */}
        <Dialog 
          open={detailDialogOpen} 
          onClose={handleCloseDetailDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            }
          }}
        >
          {selectedNotification && (
            <>
              <DialogTitle sx={{ 
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                {selectedNotification.judul || (
                  selectedNotification.tipe === 'donasi_diterima' 
                    ? 'Donasi Berhasil' 
                    : 'Pemberitahuan'
                )}
                
                {(() => {
                  const config = notificationTypeConfig[selectedNotification.tipe] || 
                    notificationTypeConfig["donasi_diterima"];
                  return (
                    <Chip 
                      icon={config.icon} 
                      label={config.label}
                      size="small"
                      sx={{ 
                        ml: 'auto',
                        backgroundColor: config.bgColor,
                        color: config.color === 'success' ? '#2e7d32' : 
                               config.color === 'info' ? '#0288d1' : 
                               config.color === 'warning' ? '#ed6c02' : '#59B997',
                      }}
                    />
                  );
                })()}
              </DialogTitle>
              
              <DialogContent sx={{ pt: 2, pb: 1 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedNotification.pesan}
                  </Typography>
                </Box>
                
                {selectedNotification.donasi_info && (
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      backgroundColor: 'rgba(89, 185, 151, 0.05)',
                      borderColor: 'rgba(89, 185, 151, 0.2)',
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Detail Donasi
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Jumlah</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(selectedNotification.donasi_info.jumlah)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {selectedNotification.donasi_info.status}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Tanggal</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDateTime(selectedNotification.donasi_info.tanggal_donasi)}
                      </Typography>
                    </Box>
                  </Paper>
                )}
                
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">
                    Diterima pada {formatDateTime(selectedNotification.created_at)}
                  </Typography>
                </Box>
              </DialogContent>
              
              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button 
                  onClick={() => confirmDeleteNotification(selectedNotification)}
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  sx={{
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    '&:hover': {
                      borderColor: '#dc2626',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    },
                    borderRadius: 2,
                    mr: 1,
                  }}
                >
                  Hapus
                </Button>
                <Button 
                  onClick={handleCloseDetailDialog}
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
      </Box>
    </div>
  );
};

export default DonaturUserNotifikasi;