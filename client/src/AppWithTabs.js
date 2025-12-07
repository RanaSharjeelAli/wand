import React, { useState } from 'react';
import { Box, Tabs, Tab, AppBar } from '@mui/material';
import {
  Chat as ChatIcon,
  LibraryBooks as LibraryIcon,
} from '@mui/icons-material';
import ChatInterface from './components/ChatInterface';
import KnowledgeBase from './components/KnowledgeBase';

function AppWithTabs() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top Navigation */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 600,
              fontSize: '0.95rem',
              minHeight: '64px',
            },
            '& .Mui-selected': {
              color: '#fff !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#fff',
              height: '3px',
            },
          }}
        >
          <Tab icon={<ChatIcon />} label="Multi-Agent Chat" iconPosition="start" />
          <Tab icon={<LibraryIcon />} label="Knowledge Base" iconPosition="start" />
        </Tabs>
      </AppBar>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 0 && <ChatInterface />}
        {activeTab === 1 && <KnowledgeBase />}
      </Box>
    </Box>
  );
}

export default AppWithTabs;
