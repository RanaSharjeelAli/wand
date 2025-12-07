import React from 'react';
import { Box, IconButton, Typography, Button, List, ListItem, ListItemText, Divider, ListItemButton, ListItemIcon, Avatar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ChatIcon from '@mui/icons-material/Chat';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LogoutIcon from '@mui/icons-material/Logout';

const ModernSidebar = ({ 
  isOpen, 
  onToggle, 
  conversations, 
  onNewChat, 
  onSelectConversation, 
  onDeleteConversation, 
  activeConversation,
  currentView,
  onViewChange,
  user,
  onLogout
}) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen ? (
        <motion.div
          key="open-sidebar"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 348, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{
            height: '100%',
            background: 'white',
            borderRight: '1px solid #EFEFEF',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(135deg, #6054FF 0%, #459AFF 100%)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'rotate(45deg)',
                  }}
                >
                  <Box
                    sx={{
                      transform: 'rotate(-45deg)',
                      fontSize: '20px',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  >
                    W
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
                  WAND AI
                </Typography>
              </Box>
              <IconButton onClick={onToggle} size="small">
                <ChevronLeftIcon />
              </IconButton>
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ mb: 2 }}>
              <List sx={{ p: 0 }}>
                <ListItemButton
                  selected={currentView === 'chat'}
                  onClick={() => onViewChange('chat')}
                  sx={{
                    borderRadius: '12px',
                    mb: 1,
                    '&.Mui-selected': {
                      background: 'linear-gradient(90deg, rgba(96, 84, 255, 0.1) 0%, rgba(139, 129, 255, 0.1) 100%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, rgba(96, 84, 255, 0.15) 0%, rgba(139, 129, 255, 0.15) 100%)',
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <ChatIcon sx={{ color: currentView === 'chat' ? '#6054FF' : '#64748B' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Multi-Agent Chat" 
                    primaryTypographyProps={{
                      fontWeight: currentView === 'chat' ? 600 : 400,
                      color: currentView === 'chat' ? '#6054FF' : '#64748B'
                    }}
                  />
                </ListItemButton>
                
                <ListItemButton
                  selected={currentView === 'knowledge'}
                  onClick={() => onViewChange('knowledge')}
                  sx={{
                    borderRadius: '12px',
                    '&.Mui-selected': {
                      background: 'linear-gradient(90deg, rgba(96, 84, 255, 0.1) 0%, rgba(139, 129, 255, 0.1) 100%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, rgba(96, 84, 255, 0.15) 0%, rgba(139, 129, 255, 0.15) 100%)',
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LibraryBooksIcon sx={{ color: currentView === 'knowledge' ? '#6054FF' : '#64748B' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Knowledge Base" 
                    primaryTypographyProps={{
                      fontWeight: currentView === 'knowledge' ? 600 : 400,
                      color: currentView === 'knowledge' ? '#6054FF' : '#64748B'
                    }}
                  />
                </ListItemButton>
              </List>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* New Chat Button - Only show in chat view */}
            {currentView === 'chat' && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onNewChat}
                sx={{
                  mb: 3,
                  background: 'linear-gradient(90deg, #6054FF 0%, #8B81FF 100%)',
                  borderRadius: '25px',
                  height: '50px',
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 500,
                  boxShadow: '0px 4px 12px rgba(96, 84, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #5043EE 0%, #7A70EE 100%)',
                  },
                }}
              >
                New Chat
              </Button>
            )}

            {/* Conversations List - Only show in chat view */}
            {currentView === 'chat' && (
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <Typography variant="subtitle2" sx={{ color: '#6A6969', mb: 2, fontSize: '14px' }}>
                  Your conversations
                </Typography>
              <List sx={{ p: 0 }}>
                {conversations.map((conv, index) => (
                  <motion.div
                    key={conv._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ListItem
                      button
                      onClick={() => onSelectConversation(conv._id)}
                      sx={{
                        borderRadius: '12px',
                        mb: 1,
                        background: activeConversation === conv._id ? '#EBF4FF' : 'transparent',
                        border: activeConversation === conv._id ? '1px solid #77B5FF' : '1px solid transparent',
                        '&:hover': {
                          background: '#F8FAFC',
                        },
                      }}
                    >
                      <ChatIcon sx={{ mr: 2, color: activeConversation === conv._id ? '#02489B' : '#6A6969', fontSize: 20 }} />
                      <ListItemText
                        primary={conv.title}
                        primaryTypographyProps={{
                          fontSize: '14px',
                          fontWeight: activeConversation === conv._id ? 600 : 400,
                          color: activeConversation === conv._id ? '#02489B' : '#475569',
                          noWrap: true,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv._id);
                        }}
                        sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </Box>
            )}

            {/* User Info and Logout - At the bottom */}
            <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #EFEFEF' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      background: 'linear-gradient(135deg, #6054FF 0%, #8B81FF 100%)',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#334155',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {user?.email || 'User'}
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  onClick={onLogout}
                  sx={{
                    color: '#64748B',
                    '&:hover': {
                      background: '#FEE2E2',
                      color: '#DC2626',
                    },
                  }}
                  title="Logout"
                >
                  <LogoutIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </motion.div>
      ) : (
        <motion.div
          key="closed-sidebar"
          initial={{ width: 0 }}
          animate={{ width: 60 }}
          exit={{ width: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            height: '100%',
            background: 'white',
            borderRight: '1px solid #EFEFEF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 0',
          }}
        >
          <IconButton
            onClick={onToggle}
            sx={{
              mb: 2,
              background: '#F1F5F9',
              '&:hover': { background: '#E2E8F0' },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
          <IconButton
            onClick={onNewChat}
            sx={{
              background: 'linear-gradient(135deg, #6054FF 0%, #8B81FF 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5043EE 0%, #7A70EE 100%)',
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModernSidebar;
