import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';

function ChatMessage({ message, isUser, timestamp }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '16px',
        width: '100%',
      }}
    >
      <Box
        sx={{
          maxWidth: '70%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: isUser 
              ? 'rgba(33, 150, 243, 0.1)' 
              : 'rgba(255, 255, 255, 0.9)',
            borderRadius: isUser 
              ? '20px 20px 4px 20px' 
              : '20px 20px 20px 4px',
            border: '1px solid',
            borderColor: isUser 
              ? 'rgba(33, 150, 243, 0.2)' 
              : 'rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: 'text.primary',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message}
          </Typography>
        </Paper>
        {timestamp && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              mt: 0.5,
              fontSize: '0.7rem',
            }}
          >
            {new Date(timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
}

export default ChatMessage;

