import React from 'react';
import { Box, IconButton } from '@mui/material';
import {
  Home,
  BarChart,
  AccessTime,
  Settings,
} from '@mui/icons-material';

function Sidebar() {
  return (
    <Box
      sx={{
        width: 80,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 3,
        gap: 3,
        zIndex: 1000,
      }}
    >
      <IconButton
        sx={{
          color: 'primary.main',
          '&:hover': {
            backgroundColor: 'rgba(0, 191, 255, 0.1)',
          },
        }}
      >
        <Home />
      </IconButton>
      <IconButton
        sx={{
          color: 'primary.main',
          '&:hover': {
            backgroundColor: 'rgba(0, 191, 255, 0.1)',
          },
        }}
      >
        <BarChart />
      </IconButton>
      <IconButton
        sx={{
          color: 'primary.main',
          '&:hover': {
            backgroundColor: 'rgba(0, 191, 255, 0.1)',
          },
        }}
      >
        <AccessTime />
      </IconButton>
      <IconButton
        sx={{
          color: 'primary.main',
          '&:hover': {
            backgroundColor: 'rgba(0, 191, 255, 0.1)',
          },
        }}
      >
        <Settings />
      </IconButton>
    </Box>
  );
}

export default Sidebar;

