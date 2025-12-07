import React, { useState, useRef, useEffect } from 'react';
import {
  Typography,
  Box,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';
import TaskForm from './components/TaskForm';
import ChatMessage from './components/ChatMessage';
import Results from './components/Results';
import ExampleTasks from './components/ExampleTasks';
import AgentProgress from './components/AgentProgress';
import useSocket from './hooks/useSocket';

function App() {
  const [agents, setAgents] = useState([]);
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const socket = useSocket('http://localhost:5001');

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, results]);

  React.useEffect(() => {
    if (!socket) return;

    socket.on('task-started', (data) => {
      setIsProcessing(true);
      setResults(null);
      setAgents(data.agents || []);
    });

    socket.on('agent-updated', (data) => {
      setAgents(prev => 
        prev.map(agent => 
          agent.id === data.agent.id ? data.agent : agent
        )
      );
    });

    socket.on('agent-progress', (data) => {
      setAgents(prev => 
        prev.map(agent => 
          agent.id === data.agentId 
            ? { ...agent, progress: data.progress }
            : agent
        )
      );
    });

    socket.on('task-completed', (data) => {
      setResults(data.result);
      setIsProcessing(false);
      
      // Add AI response to chat
      const aiMessage = data.result.summary || 'Analysis completed successfully.';
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: aiMessage,
        isUser: false,
        timestamp: new Date().toISOString(),
        result: data.result
      }]);
    });

    socket.on('task-error', (data) => {
      console.error('Task error:', data.error);
      setIsProcessing(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Error: ${data.error}`,
        isUser: false,
        timestamp: new Date().toISOString(),
      }]);
    });

    return () => {
      socket.off('task-started');
      socket.off('agent-updated');
      socket.off('agent-progress');
      socket.off('task-completed');
      socket.off('task-error');
    };
  }, [socket]);

  const handleTaskSubmit = (task) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: task.request,
      isUser: true,
      timestamp: new Date().toISOString()
    }]);

    if (socket) {
      socket.emit('submit-task', task);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100%',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '140px', // Space for floating input
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.08)',
        py: 2,
        px: 3,
        zIndex: 100,
        position: 'sticky',
        top: 0,
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'text.primary',
            fontWeight: 600,
          }}
        >
          🤖 Wand AI Multi-Agent Task Solver
        </Typography>
      </Box>

      {/* Chat Area with Gradient Background */}
      <Box sx={{
        flex: 1,
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'radial-gradient(circle 800px at top left, rgba(33, 150, 243, 0.12) 0%, rgba(33, 150, 243, 0.06) 25%, rgba(33, 150, 243, 0.02) 50%, rgba(255, 255, 255, 0) 70%)',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(33, 150, 243, 0.2)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(33, 150, 243, 0.3)',
          },
        },
      }}>
        <Container maxWidth="md" sx={{ py: 3, px: 2 }}>
          {!hasMessages ? (
            /* Initial State - Example Tasks in Center */
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: 'calc(100vh - 300px)',
            }}>
              <ExampleTasks onTaskSelect={handleTaskSubmit} />
            </Box>
          ) : (
            /* Chat Messages */
            <Box>
              {messages.map((message) => (
                <React.Fragment key={message.id}>
                  <ChatMessage
                    message={message.text}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                  {/* Show Results component after AI message if available */}
                  {!message.isUser && message.result && (
                    <Box sx={{ mb: 3, mt: -2 }}>
                      <Results results={message.result} />
                    </Box>
                  )}
                  {isProcessing && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <AgentProgress agents={agents} isProcessing={isProcessing} />
                    </Box>
                  )}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </Container>
      </Box>

      {/* Floating Input Field at Bottom */}
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        p: 2,
        zIndex: 1000,
      }}>
        <TaskForm 
          onSubmit={handleTaskSubmit} 
          disabled={isProcessing}
          floating={true}
showExamplePills={true}
        />
      </Box>
    </Box>
  );
}

export default App;