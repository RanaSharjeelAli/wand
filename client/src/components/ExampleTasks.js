import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Summarize,
  Assessment,
  TrendingUp,
  Analytics,
} from '@mui/icons-material';

const exampleTasks = [
  {
    text: 'Summarize the last 3 quarters\' financial trends and create a chart',
    icon: <Summarize />,
  },
  {
    text: 'Analyze customer satisfaction data from last month',
    icon: <Assessment />,
  },
  {
    text: 'Create a report on sales performance by region',
    icon: <TrendingUp />,
  },
  {
    text: 'Identify trends in user engagement metrics',
    icon: <Analytics />,
  },
];

function ExampleTasks({ onTaskSelect }) {
  const handleTaskClick = (taskText) => {
    onTaskSelect({ request: taskText });
  };

  return (
    <Box sx={{ maxWidth: 800, width: '100%', px: 3 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          color: 'primary.main',
          fontWeight: 600,
          mb: 1,
          textAlign: 'center',
        }}
      >
        Wand AI Multi-Agent Task Solver
      </Typography>
      
      <Typography 
        variant="body1" 
        sx={{ 
          color: 'text.secondary',
          mb: 4,
          textAlign: 'center',
        }}
      >
        Get started by selecting an example task or typing your own request
      </Typography>

      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'rgba(33, 150, 243, 0.2)',
          borderRadius: 2,
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.primary',
            fontWeight: 600,
            mb: 2,
          }}
        >
          Example tasks:
        </Typography>
        
        <List>
          {exampleTasks.map((task, index) => (
            <ListItem
              key={index}
              onClick={() => handleTaskClick(task.text)}
              sx={{
                cursor: 'pointer',
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  bgcolor: 'rgba(33, 150, 243, 0.08)',
                },
              }}
            >
              <Box sx={{ color: 'primary.main', mr: 2 }}>
                {task.icon}
              </Box>
              <ListItemText 
                primary={task.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: 'text.primary',
                  },
                }}
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: 'text.secondary',
              mb: 2,
            }}
          >
            How it works:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="1. AI analyzes your request" 
                secondary="Determines which specialized agents are needed"
                sx={{
                  '& .MuiListItemText-primary': {
                    color: 'text.primary',
                  },
                  '& .MuiListItemText-secondary': {
                    color: 'text.secondary',
                  },
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="2. Agents execute tasks" 
                secondary="Multiple AI agents work in parallel on different aspects"
                sx={{
                  '& .MuiListItemText-primary': {
                    color: 'text.primary',
                  },
                  '& .MuiListItemText-secondary': {
                    color: 'text.secondary',
                  },
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="3. Results are aggregated" 
                secondary="All agent outputs are combined into a comprehensive answer"
                sx={{
                  '& .MuiListItemText-primary': {
                    color: 'text.primary',
                  },
                  '& .MuiListItemText-secondary': {
                    color: 'text.secondary',
                  },
                }}
              />
            </ListItem>
          </List>
        </Box>
      </Paper>
    </Box>
  );
}

export default ExampleTasks;

