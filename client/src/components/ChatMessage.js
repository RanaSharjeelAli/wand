import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import Results from './Results';

function ChatMessage({ message, isUser, timestamp, result }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: isUser
              ? 'linear-gradient(135deg, #6054FF 0%, #8B81FF 100%)'
              : '#F1F5F9',
            color: isUser ? 'white' : '#6054FF',
            flexShrink: 0,
          }}
        >
          {isUser ? <PersonIcon /> : <SmartToyIcon />}
        </Avatar>

        {/* Message Bubble */}
        <Box
          sx={{
            maxWidth: '70%',
            background: isUser
              ? 'linear-gradient(135deg, #6054FF 0%, #8B81FF 100%)'
              : 'white',
            color: isUser ? 'white' : '#334155',
            borderRadius: '16px',
            p: 2.5,
            boxShadow: isUser
              ? '0px 4px 16px rgba(96, 84, 255, 0.2)'
              : '0px 2px 8px rgba(0, 0, 0, 0.08)',
            border: isUser ? 'none' : '1px solid #E2E8F0',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontSize: '15px',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message}
          </Typography>
          {timestamp && (
            <Typography
              variant="caption"
              sx={{
                mt: 1,
                display: 'block',
                opacity: 0.7,
                fontSize: '12px',
              }}
            >
              {new Date(timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          )}
        </Box>
      </Box>
      
      {/* Display results if this is an AI message with results */}
      {!isUser && result && (
        <Box sx={{ mt: 2, ml: 7 }}>
          <Results results={result} />
        </Box>
      )}
    </motion.div>
  );
}

export default ChatMessage;

