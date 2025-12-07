import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography } from '@mui/material';
import axios from 'axios';

import ModernSidebar from './components/ModernSidebar';
import ChatInterface from './components/ChatInterface';
import KnowledgeBase from './components/KnowledgeBase';
import Login from './components/Login';
import Signup from './components/Signup';
import useSocketConnection from './hooks/useSocketConnection';
import { setMessages, clearAgents, clearResults, setResults } from './store/slices/taskSlice';
import { SOCKET_EVENTS } from './config/constants';
import { generateId } from './utils/helpers';

function App() {
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'knowledge'
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
  const [authLoading, setAuthLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Verify token with backend
          const response = await axios.get('http://localhost:5001/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data.success) {
            setAuthToken(token);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
      setAuthLoading(false);
    };
    
    checkAuth();
  }, []);

  // Initialize socket connection only when authenticated
  useSocketConnection();

  // Get state from Redux
  const { messages, socket } = useSelector((state) => state.task);

  // Fetch conversations only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch('http://localhost:5001/api/chats?limit=20', {
        headers
      });
      const data = await response.json();
      if (data.chats) {
        setConversations(data.chats);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleChatCreated = (data) => {
      console.log('[App] Chat created:', data);
      setCurrentChatId(data.chatId);
      fetchConversations();
    };

    const handleChatUpdated = (data) => {
      console.log('[App] Chat updated:', data);
      setConversations(prev => {
        const chat = prev.find(c => c._id === data.chatId);
        if (chat) {
          return [
            { ...chat, updatedAt: new Date().toISOString() },
            ...prev.filter(c => c._id !== data.chatId)
          ];
        }
        return prev;
      });
    };

    socket.on('chat-created', handleChatCreated);
    socket.on('chat-updated', handleChatUpdated);

    return () => {
      socket.off('chat-created', handleChatCreated);
      socket.off('chat-updated', handleChatUpdated);
    };
  }, [socket]);

  const handleNewChat = () => {
    dispatch(setMessages([]));
    dispatch(clearAgents());
    dispatch(clearResults());
    setActiveConversation(null);
    setCurrentChatId(null);
  };

  const handleSelectConversation = async (id) => {
    setActiveConversation(id);
    setCurrentChatId(id);
    setCurrentView('chat'); // Switch to chat view when selecting a conversation
    
    dispatch(clearAgents());
    dispatch(clearResults());
    
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`http://localhost:5001/api/chats/${id}`, {
        headers
      });
      const chat = await response.json();
      
      if (chat && chat.messages) {
        const formattedMessages = chat.messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          isUser: msg.isUser,
          timestamp: msg.timestamp,
          result: msg.results
        }));
        
        dispatch(setMessages(formattedMessages));
        
        const lastAiMessage = [...chat.messages].reverse().find(msg => !msg.isUser && msg.results);
        if (lastAiMessage && lastAiMessage.results) {
          dispatch(setResults(lastAiMessage.results));
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleDeleteConversation = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`http://localhost:5001/api/chats/${id}`, {
        method: 'DELETE',
        headers
      });
      
      if (response.ok) {
        if (activeConversation === id) {
          handleNewChat();
        }
        await fetchConversations();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
    setIsAuthenticated(true);
  };

  const handleSignupSuccess = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
    dispatch(setMessages([]));
    dispatch(clearAgents());
    dispatch(clearResults());
    setConversations([]);
    setActiveConversation(null);
    setCurrentChatId(null);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(180deg, #5925DC 0%, #7B4FE8 100%)'
      }}>
        <Box sx={{ textAlign: 'center', color: '#FCFCFC' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>Wand AI</Typography>
          <Typography variant="body1">Loading...</Typography>
        </Box>
      </Box>
    );
  }

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    if (authView === 'signup') {
      return (
        <Signup 
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => setAuthView('signup')}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F1F5F9' }}>
      {/* Sidebar with Navigation */}
      <ModernSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        activeConversation={activeConversation}
        currentView={currentView}
        onViewChange={handleViewChange}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {currentView === 'chat' ? (
          <ChatInterface
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            currentChatId={currentChatId}
            onNewChat={handleNewChat}
          />
        ) : (
          <KnowledgeBase />
        )}
      </Box>
    </Box>
  );
}

export default App;
