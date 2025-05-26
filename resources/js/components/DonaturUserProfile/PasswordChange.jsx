import React from 'react';
import {
  Card,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock as LockIcon } from '@mui/icons-material';

const PasswordChange = ({
  passwords,
  showPassword,
  handlePasswordChange,
  toggleShowPassword,
  handleSubmitPasswordChange,
  isMobile,
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={6}
      sx={{
        borderRadius: 0,
        p: isMobile ? 5 : 8,
        bgcolor: 'white',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        flex: 1,
        width: '100%',
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          color: '#59B997',
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.3s ease',
        }}
      >
        <LockIcon sx={{ mr: 1 }} />
        Ganti Password
      </Typography>
      <TextField
        label="Password Lama"
        name="currentPassword"
        type={showPassword.currentPassword ? 'text' : 'password'}
        value={passwords.currentPassword}
        onChange={handlePasswordChange}
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => toggleShowPassword('currentPassword')}
                edge="end"
                aria-label="toggle password visibility"
              >
                {showPassword.currentPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Password Baru"
        name="newPassword"
        type={showPassword.newPassword ? 'text' : 'password'}
        value={passwords.newPassword}
        onChange={handlePasswordChange}
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => toggleShowPassword('newPassword')}
                edge="end"
                aria-label="toggle password visibility"
              >
                {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Konfirmasi Password Baru"
        name="confirmNewPassword"
        type={showPassword.confirmNewPassword ? 'text' : 'password'}
        value={passwords.confirmNewPassword}
        onChange={handlePasswordChange}
        fullWidth
        variant="outlined"
        sx={{ mb: 3 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => toggleShowPassword('confirmNewPassword')}
                edge="end"
                aria-label="toggle password visibility"
              >
                {showPassword.confirmNewPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{
          py: 1.5,
          borderRadius: 0,
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,128,0,0.3)',
          transition: 'background-color 0.3s',
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        }}
        onClick={handleSubmitPasswordChange}
      >
        Perbarui Password
      </Button>
    </Card>
  );
};

export default PasswordChange;
