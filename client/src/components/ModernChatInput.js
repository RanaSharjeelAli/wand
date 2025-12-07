import React, { useState } from 'react';
import { Box, TextField, IconButton, CircularProgress, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { motion, AnimatePresence } from 'framer-motion';
import ModernExampleTasks from './ModernExampleTasks';

const ModernChatInput = ({ onSend, isProcessing, showExamples = false }) => {
  const [input, setInput] = useState('');
  const [examplesExpanded, setExamplesExpanded] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 1.5,
        background: 'white',
        borderTop: '1px solid #EFEFEF',
      }}
    >
      {/* Compact Example Tasks - Collapsible with Slide Down Animation */}
      <AnimatePresence>
        {showExamples && (
          <motion.div
            initial={{ opacity: 0, y: -50, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -50, height: 0 }}
            transition={{ 
              duration: 0.5,
              ease: 'easeOut',
              delay: 0.2
            }}
            style={{ overflow: 'hidden' }}
          >
            <Box sx={{ mb: 1.5 }}>
              {/* Toggle Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                    px: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748B',
                      fontWeight: 600,
                      fontSize: '11px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    QUICK PROMPTS
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setExamplesExpanded(!examplesExpanded)}
                    sx={{
                      color: '#64748B',
                      width: 24,
                      height: 24,
                      '&:hover': {
                        background: '#F1F5F9',
                        color: '#6054FF',
                      },
                    }}
                  >
                    {examplesExpanded ? (
                      <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                </Box>
              </motion.div>

              {/* Collapsible Example Tasks */}
              <AnimatePresence>
                {examplesExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <ModernExampleTasks onTaskSelect={onSend} compact={true} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          background: '#F8FAFC',
          borderRadius: '10px',
          px: 1.5,
          py: 0.75,
          border: '1px solid #E2E8F0',
          transition: 'all 0.3s ease',
          '&:focus-within': {
            border: '1px solid #8B81FF',
            boxShadow: '0px 4px 20px rgba(139, 129, 255, 0.2)',
          },
        }}
      >
        <IconButton
          size="small"
          sx={{
            color: '#6A6969',
            '&:hover': { color: '#6054FF' },
          }}
        >
          <AttachFileIcon />
        </IconButton>

        <TextField
          fullWidth
          multiline={false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          variant="standard"
          disabled={isProcessing}
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '14px',
              color: '#334155',
              '& ::placeholder': {
                color: '#94A3B8',
                opacity: 1,
              },
            },
          }}
          sx={{
            '& .MuiInputBase-root': {
              background: 'transparent',
            },
          }}
        />

        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          animate={input.trim() && !isProcessing ? { 
            scale: [1, 1.05, 1],
          } : {}}
          transition={{
            duration: 0.6,
            repeat: input.trim() && !isProcessing ? Infinity : 0,
            repeatDelay: 1
          }}
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: isProcessing ? 360 : 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <IconButton
              type="submit"
              disabled={!input.trim() || isProcessing}
              sx={{
                background: input.trim() && !isProcessing
                  ? 'linear-gradient(135deg, #6054FF 0%, #8B81FF 100%)'
                  : '#E2E8F0',
                color: 'white',
                width: 36,
                height: 36,
                transition: 'background 0.3s ease',
                '&:hover': {
                  background: input.trim() && !isProcessing
                    ? 'linear-gradient(135deg, #5043EE 0%, #7A70EE 100%)'
                    : '#E2E8F0',
                },
                '&:disabled': {
                  color: '#94A3B8',
                },
              }}
            >
              {isProcessing ? (
                <CircularProgress size={18} sx={{ color: 'white' }} />
              ) : (
                <SendIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </motion.div>
        </motion.div>
      </Box>

      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textAlign: 'center',
          mt: 1,
          color: '#94A3B8',
          fontSize: '11px',
        }}
      >
        Powered by Ollama AI • Multi-Agent System
      </Typography>
    </Box>
  );
};

export default ModernChatInput;
