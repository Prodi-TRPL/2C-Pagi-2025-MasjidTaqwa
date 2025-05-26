import React from 'react';
import { Card, Typography, Box } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const DonationStats = ({ profile }) => {
  return (
    <Card
      elevation={6}
      sx={{
        borderRadius: 0,
        p: 4,
        bgcolor: 'white',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        display: 'flex',
        justifyContent: 'space-around',
        width: '100%',
      }}
    >
      <Card
        variant="outlined"
        sx={{
          flex: 1,
          mr: 1,
          p: 2,
          borderRadius: 0,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          },
        }}
      >
        <MonetizationOnIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6" fontWeight={700}>
          {profile.totalDonationsCount} Kali Donasi
        </Typography>
      </Card>
      <Card
        variant="outlined"
        sx={{
          flex: 1,
          ml: 1,
          p: 2,
          borderRadius: 0,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          },
        }}
      >
        <TrendingUpIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6" fontWeight={700}>
          Rp {profile.totalDonationsAmount.toLocaleString()}
        </Typography>
      </Card>
    </Card>
  );
};

export default DonationStats;
