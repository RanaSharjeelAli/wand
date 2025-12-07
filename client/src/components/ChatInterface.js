import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import ModernChatHeader from './ModernChatHeader';
import ModernChatInput from './ModernChatInput';
import ModernExampleTasks from './ModernExampleTasks';
import ChatMessage from './ChatMessage';
import Results from './Results';
import AgentProgress from './AgentProgress';
import { setMessages, clearAgents, clearResults } from '../store/slices/taskSlice';
import { SOCKET_EVENTS } from '../config/constants';
import { scrollToElement, generateId } from '../utils/helpers';

function ChatInterface({ sidebarOpen, onToggleSidebar, currentChatId, onNewChat }) {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  // Get state from Redux
  const { messages, agents, results, isProcessing, socket } = useSelector(
    (state) => state.task
  );

  // Auto-scroll to bottom when messages or results update
  useEffect(() => {
    scrollToElement(messagesEndRef);
  }, [messages, results]);

  const handleTaskSubmit = (input) => {
    if (!socket) {
      console.error('[ChatInterface] Socket not connected');
      return;
    }

    // Create user message
    const userMessage = {
      id: generateId(),
      text: input,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    // Append new message to existing messages (don't clear)
    dispatch(setMessages([...messages, userMessage]));
    dispatch(clearAgents());
    dispatch(clearResults());

    // Emit task to server with current chatId
    socket.emit(SOCKET_EVENTS.SUBMIT_TASK, { 
      request: input,
      chatId: currentChatId 
    });
  };

  return (
    <>
      {/* Chat Header */}
      <ModernChatHeader />

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 4,
          background: '#F1F5F9',
        }}
      >
        <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Welcome Screen with Animations */}
          <AnimatePresence mode="wait">
            {messages.length === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    mt: 10,
                  }}
                >
                  {/* Animated Logo */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 45 }}
                    transition={{ 
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                      delay: 0.1 
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        margin: '0 auto 24px',
                        background: 'linear-gradient(135deg, #6054FF 0%, #8B81FF 100%)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: 'rotate(45deg)',
                        boxShadow: '0px 8px 24px rgba(96, 84, 255, 0.3)',
                      }}
                    >
                      <Box
                        sx={{
                          transform: 'rotate(-45deg)',
                          fontSize: '40px',
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        W
                      </Box>
                    </Box>
                  </motion.div>

                  {/* Animated Title */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: '#334155', mb: 2 }}
                    >
                      Welcome to Wand AI
                      </Typography>
                    </motion.div>

                    {/* Animated Subtitle */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <Typography variant="body1" sx={{ color: '#64748B', mb: 4 }}>
                        Your intelligent multi-agent assistant powered by Ollama
                      </Typography>
                    </motion.div>

                    {/* Animated Example Tasks */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
                    >
                      <ModernExampleTasks onTaskSelect={handleTaskSubmit} />
                    </motion.div>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages - Already animated in ChatMessage component */}
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg.text}
                isUser={msg.isUser}
                timestamp={msg.timestamp}
                result={msg.result}
              />
            ))}

            {/* Agent Progress */}
            {agents.length > 0 && (
              <AgentProgress agents={agents} isProcessing={isProcessing} />
            )}

            {/* Current Results - Only show if processing just completed and not yet in messages */}
            {results && isProcessing === false && messages.length > 0 && !messages[messages.length - 1].result && (
              <Results results={results} />
            )}

            <div ref={messagesEndRef} />
          </Box>
        </Box>

        {/* Chat Input */}
        <ModernChatInput 
          onSend={handleTaskSubmit} 
          isProcessing={isProcessing}
          showExamples={messages.length > 0}
        />
      </>
  );
}

export default ChatInterface;
