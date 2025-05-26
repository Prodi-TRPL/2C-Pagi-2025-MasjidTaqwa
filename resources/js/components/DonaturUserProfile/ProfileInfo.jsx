import React from 'react';
import {
  Box,
  Card,
  Avatar,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

const ProfileInfo = ({
  profile,
  namaInput,
  editNama,
  handleNamaChange,
  handleToggleEditNama,
  navItems,
  handleLogout,
}) => {
  const theme = useTheme();

  return (
    <>
      <Card
        elevation={6}
        sx={{
          borderRadius: '8px 8px 0 0',
          p: 4,
          maxWidth: 300,
          bgcolor: '#59B997',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          flexGrow: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 0,
          borderBottom: 'none',
          }}
      >
        {/* Profile Information Section */}
        <Avatar
          src={profile.profile_image}
          alt={profile.nama}
          sx={{ width: 110, height: 110, mb: 2, boxShadow: 3 }}
        />
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                p: 1.5,
                color: 'black',
                width: '100%',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              {profile.nama}
            </Box>
          </Box>
          {/* Removed email display as per user request */}
          {/* Removed account status display as per user request */}
        </Box>
      </Card>
      <Card
        elevation={6}
        sx={{
          borderRadius: '0 0 8px 8px',
          p: 0,
          maxWidth: 300,
          bgcolor: 'white',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 0,
          borderTop: 'none',
          }}
      >
        {/* Navigation Menu Section */}
        <Box sx={{ width: '100%' }}>
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
                  borderRadius: 0,
                  textTransform: 'none',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 1,
                  width: '100%',
                  color: '#505050',
                  borderColor: '#505050',
                  transition: 'all 0.3s',
                  '& svg': {
                    color: '#505050',
                  },
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
                borderRadius: 0,
                textTransform: 'none',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 1,
                width: '100%',
                color: theme.palette.error.main,
                borderColor: theme.palette.error.main,
                transition:
                  'color 0.3s, border-color 0.3s, background-color 0.3s, box-shadow 0.3s',
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
      </Card>
    </>
  );
};

export default ProfileInfo;
