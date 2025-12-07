import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  SmartToy,
  CheckCircle,
} from '@mui/icons-material';
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
      'general-analyst': 'General Analyst'
    };
    return names[type] || type;
  };

  if (!isProcessing && agents.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Submit a task to see agent progress
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {agents.map((agent, index) => {
        const progress = agent.progress || (agent.status === 'completed' ? 100 : 0);
        const isCompleted = agent.status === 'completed';
        
        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Box sx={{ 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              <SmartToy sx={{ color: 'primary.main' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 500,
                    }}
                  >
                    {getAgentDisplayName(agent.type)}
                  </Typography>
                  {isCompleted && (
                    <Chip
                      icon={<CheckCircle />}
                      label="completed"
                      size="small"
                      sx={{
                        bgcolor: 'success.main',
                        color: 'background.default',
                        '& .MuiChip-icon': {
                          color: 'background.default',
                        },
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ mb: 0.5 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: isCompleted ? 'primary.main' : 'text.secondary',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Progress: {Math.round(progress)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ 
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'primary.main',
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </motion.div>
        );
      })}
    </Box>
  );
}

export default AgentProgress;