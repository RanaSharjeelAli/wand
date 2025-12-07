import React from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import { motion } from 'framer-motion';

function AgentProgress({ agents, isProcessing }) {
  const getAgentDisplayName = (type) => {
    const names = {
      'data-collector': 'Data Collector',
      'financial-analyst': 'Financial Analyst',
      'data-analyst': 'Data Analyst',
      'summarizer': 'Summarizer',
      'chart-generator': 'Chart Generator',
      'report-generator': 'Report Generator',
      'general-analyst': 'General Analyst',
    };
    return names[type] || type;
  };

  if (!isProcessing && agents.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Submit a task to see agent progress
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ my: 3, px: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{ color: '#6A6969', mb: 2, fontSize: '14px', fontWeight: 600 }}
      >
        Active Agents
      </Typography>
      {agents.map((agent, index) => {
        const progress = agent.progress || (agent.status === 'completed' ? 100 : 0);
        const isCompleted = agent.status === 'completed';

        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Box
              sx={{
                p: 2.5,
                mb: 2,
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155' }}>
                  {getAgentDisplayName(agent.type || agent.name)}
                </Typography>
                <Chip
                  label={isCompleted ? 'Completed' : 'Working'}
                  size="small"
                  sx={{
                    background: isCompleted
                      ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                      : 'linear-gradient(90deg, #6054FF 0%, #8B81FF 100%)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '11px',
                    height: '24px',
                  }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  mb: 1.5,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#E2E8F0',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #6054FF 0%, #8B81FF 100%)',
                    borderRadius: 3,
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '12px' }}>
                {agent.currentTask || agent.task || 'Processing...'}
              </Typography>
            </Box>
          </motion.div>
        );
      })}
    </Box>
  );
}

export default AgentProgress;