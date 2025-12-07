import React, { useState } from 'react';
import {
  TextField,
  IconButton,
  Box,
  Chip,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { motion } from 'framer-motion';

const exampleTasks = [
  { text: 'Summarize the last 3 quarters\' financial trends and create a chart', color: '#FF6B6B' },
  { text: 'Analyze customer satisfaction data from last month', color: '#4ECDC4' },
  { text: 'Create a report on sales performance by region', color: '#45B7D1' },
  { text: 'Identify trends in user engagement metrics', color: '#96CEB4' },
];

function TaskForm({ onSubmit, disabled, floating = false, compact = false, showExamplePills = false }) {
  const [request, setRequest] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (request.trim()) {
      onSubmit({ request: request.trim() });
      setRequest(''); // Clear input after submit
    }
  };

  if (floating) {
    return (
      <Box>
        {/* Pills above text field */}
        {showExamplePills && (
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            mb: 2,
            p: '10px',
            width: '100%',
            margin: '0 auto',
            color: 'white',
            justifyContent: 'center',
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(33, 150, 243, 0.2)',
              borderRadius: '2px',
            },
          }}>
            {[
              { text: 'Summarize the last 3 quarters\' financial trends and create a chart', color: '#097c0bff' }, 
              { text: 'Analyze customer satisfaction data from last month', color: '#465bd0ff' }, 
              { text: 'Create a report on sales performance by region', color: '#17b1d3ff' }, 
              { text: 'Identify trends in user engagement metrics', color: '#3fd58fff' }
            ].map((example, index) => (
              <div
                key={index}
                style={{ cursor: 'pointer' }}
              >
                <Chip
                  label={example.text.length > 50 ? example.text.substring(0, 50) + '...' : example.text}
                  onClick={() => setRequest(example.text)}
                  disabled={disabled}
                  clickable
                  sx={{
                    bgcolor: 'white',
                    color: example.color,
                    border: '2px solid',
                    borderColor: example.color,
                    borderRadius: '20px',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: 'white',
                      borderColor: example.color,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${example.color}40`,
                    },
                    '&:active': {
                      transform: 'translateY(0px) scale(0.98)',
                    },
                    '&:disabled': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                      color: 'text.disabled',
                    },
                  }}
                />
              </div>
            ))}
          </Box>
        )}
        
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter your business request"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            disabled={disabled}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                color: 'text.primary',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '24px',
                border: '1px solid',
                borderColor: 'rgba(33, 150, 243, 0.3)',
                transition: 'all 0.3s ease',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover': {
                  borderColor: 'rgba(33, 150, 243, 0.4)',
                },
                '&.Mui-focused': {
                  borderColor: 'rgba(33, 150, 243, 0.5)',
                },
              },
            }}
          />
          <IconButton
            type="submit"
            disabled={disabled || !request.trim()}
            sx={{
              bgcolor: 'primary.main',
              color: 'background.default',
              borderRadius: '50%',
              width: 48,
              height: 48,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'primary.light',
                transform: 'scale(1.05)',
                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
              '&:disabled': {
                bgcolor: 'rgba(33, 150, 243, 0.3)',
                boxShadow: 'none',
              },
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    );
  }

  // Compact mode for the Submit Task section
  if (compact) {
    return (
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          label="Enter your business request"
          placeholder="e.g., Summarize the last 3 quarters' financial trends and create a chart"
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          disabled={disabled}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              color: 'text.primary',
              '& fieldset': {
                borderColor: 'primary.main',
              },
              '&:hover fieldset': {
                borderColor: 'primary.light',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
      </Box>
    );
  }

  // Default mode (not used in new layout, but kept for compatibility)
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <TextField
        fullWidth
        multiline
        rows={3}
        variant="outlined"
        placeholder="Summarize the last 3 quarters' financial trends and create a chart"
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        disabled={disabled}
        sx={{ 
          mb: 2,
          '& .MuiOutlinedInput-root': {
            color: 'text.primary',
            '& fieldset': {
              borderColor: 'primary.main',
            },
            '&:hover fieldset': {
              borderColor: 'primary.light',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />
    </Box>
  );
}

export default TaskForm;