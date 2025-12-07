import React from 'react';
import { Box, Typography, IconButton, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

const ModernChatHeader = () => {
  return (
    <Box
      sx={{
        height: '80px',
        background: 'white',
        borderBottom: '1px solid #EFEFEF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 4,
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
          AI Multi-Agent
        </Typography>
        <Typography variant="body2" sx={{ color: '#475569' }}>
          Powered by Ollama and Multi-Agent System
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          sx={{
            width: 40,
            height: 40,
            background: '#F1F5F9',
            '&:hover': { background: '#E2E8F0' },
          }}
        >
          <SearchIcon sx={{ fontSize: 20, color: '#475569' }} />
        </IconButton>
        <IconButton
          sx={{
            width: 40,
            height: 40,
            background: '#F1F5F9',
            '&:hover': { background: '#E2E8F0' },
          }}
        >
          <NotificationsNoneIcon sx={{ fontSize: 20, color: '#475569' }} />
        </IconButton>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #6054FF 0%, #8B81FF 100%)',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          AI
        </Avatar>
      </Box>
    </Box>
  );
};

export default ModernChatHeader;
