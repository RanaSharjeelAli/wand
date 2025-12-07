import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import {
  Summarize,
  Assessment,
  TrendingUp,
  Analytics,
  AutoAwesome,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const exampleTasks = [
  {
    text: 'Summarize the last 3 quarters\' financial trends and create a chart',
    icon: <Summarize />,
    color: '#6054FF',
  },
  {
    text: 'Analyze customer satisfaction data from last month',
    icon: <Assessment />,
    color: '#8B81FF',
  },
  {
    text: 'Create a report on sales performance by region',
    icon: <TrendingUp />,
    color: '#10B981',
  },
  {
    text: 'Identify trends in user engagement metrics',
    icon: <Analytics />,
    color: '#F59E0B',
  },
];

const ModernExampleTasks = ({ onTaskSelect, compact = false }) => {
  if (compact) {
    // Compact horizontal view for after first message
    return (
      <Box
        sx={{
          background: 'white',
          borderRadius: '12px',
          p: 1.5,
          mb: 3,
          border: '1px solid #E2E8F0',
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#E2E8F0',
            borderRadius: '3px',
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, minWidth: 'fit-content' }}>
          {exampleTasks.map((task, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Box
                onClick={() => onTaskSelect(task.text)}
                sx={{
                  background: `${task.color}08`,
                  borderRadius: '10px',
                  px: 2,
                  py: 1.5,
                  cursor: 'pointer',
                  border: `1px solid ${task.color}20`,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  minWidth: 'fit-content',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    background: `${task.color}15`,
                    borderColor: task.color,
                    '& .task-icon': {
                      background: task.color,
                      color: 'white',
                    },
                  },
                }}
              >
                {/* Icon */}
                <Box
                  className="task-icon"
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    background: `${task.color}20`,
                    color: task.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {React.cloneElement(task.icon, { sx: { fontSize: 18 } })}
                </Box>

                {/* Text */}
                <Typography
                  variant="caption"
                  sx={{
                    color: '#334155',
                    fontWeight: 500,
                    fontSize: '13px',
                    maxWidth: '250px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {task.text}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>
    );
  }

  // Full view for welcome screen
  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      {/* Example Tasks Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
        <AutoAwesome sx={{ color: '#6054FF', fontSize: 20 }} />
        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          Example Prompts
        </Typography>
      </Box>

      {/* Task Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 2,
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {exampleTasks.map((task, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Box
              onClick={() => onTaskSelect(task.text)}
              sx={{
                background: 'white',
                borderRadius: '12px',
                p: 2.5,
                cursor: 'pointer',
                border: '1px solid #E2E8F0',
                transition: 'all 0.3s ease',
                textAlign: 'left',
                '&:hover': {
                  borderColor: task.color,
                  boxShadow: `0px 8px 24px ${task.color}20`,
                  '& .task-icon': {
                    background: task.color,
                    color: 'white',
                  },
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                {/* Icon */}
                <Box
                  className="task-icon"
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: `${task.color}15`,
                    color: task.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {React.cloneElement(task.icon, { sx: { fontSize: 22 } })}
                </Box>

                {/* Text */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#334155',
                      fontWeight: 500,
                      lineHeight: 1.5,
                    }}
                  >
                    {task.text}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>

      {/* How it Works Section */}
      <Box sx={{ maxWidth: 700, margin: '0 auto', mt: 5 }}>
        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            fontWeight: 600,
            mb: 2.5,
            letterSpacing: '0.5px',
          }}
        >
          How it Works
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { step: '1', title: 'AI Analyzes', desc: 'Request analyzed' },
            { step: '2', title: 'Agents Execute', desc: 'Work in parallel' },
            { step: '3', title: 'Results Ready', desc: 'Comprehensive answer' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Box
                sx={{
                  background: 'white',
                  borderRadius: '12px',
                  p: 2,
                  border: '1px solid #E2E8F0',
                  minWidth: 140,
                  textAlign: 'center',
                }}
              >
                <Chip
                  label={item.step}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #6054FF 0%, #8B81FF 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '12px',
                    height: 24,
                    mb: 1,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontWeight: 600,
                    color: '#334155',
                    mb: 0.5,
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: '#94A3B8',
                    fontSize: '11px',
                  }}
                >
                  {item.desc}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ModernExampleTasks;
