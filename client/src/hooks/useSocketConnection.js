import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { API_CONFIG, SOCKET_EVENTS } from '../config/constants';
import {
  setSocket,
  setAgents,
  updateAgent,
  updateAgentProgress,
  setResults,
  setProcessing,
  addMessage,
  setError,
} from '../store/slices/taskSlice';
import { generateId } from '../utils/helpers';

/**
 * Custom hook to manage Socket.IO connection with Redux integration
 */
const useSocketConnection = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    // Initialize socket connection with auth token
    const socketInstance = io(API_CONFIG.SOCKET_URL, {
      ...API_CONFIG.SOCKET_OPTIONS,
      auth: {
        token: token || null
      }
    });

    // Connection event handlers
    socketInstance.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('[Socket] Connected to server');
      dispatch(setSocket(socketInstance));
    });

    socketInstance.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log('[Socket] Disconnected from server');
    });

    socketInstance.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      console.error('[Socket] Connection error:', error);
      dispatch(setError('Failed to connect to server'));
    });

    // Task event handlers
    socketInstance.on(SOCKET_EVENTS.TASK_STARTED, (data) => {
      console.log('[Socket] Task started:', data.taskId);
      dispatch(setProcessing(true));
      dispatch(setResults(null));
      dispatch(setAgents(data.agents || []));
    });

    socketInstance.on(SOCKET_EVENTS.AGENT_UPDATED, (data) => {
      console.log('[Socket] Agent updated:', data.agent.type);
      dispatch(updateAgent(data.agent));
    });

    socketInstance.on(SOCKET_EVENTS.AGENT_PROGRESS, (data) => {
      dispatch(updateAgentProgress({
        agentId: data.agentId,
        progress: data.progress,
      }));
    });

    socketInstance.on(SOCKET_EVENTS.TASK_COMPLETED, (data) => {
      console.log('[Socket] Task completed');
      dispatch(setResults(data.result));
      dispatch(setProcessing(false));

      // Add AI response to messages
      const aiMessage = {
        id: generateId(),
        text: data.result.summary || 'Analysis completed successfully.',
        isUser: false,
        timestamp: new Date().toISOString(),
        result: data.result,
      };
      dispatch(addMessage(aiMessage));
    });

    socketInstance.on(SOCKET_EVENTS.TASK_ERROR, (data) => {
      console.error('[Socket] Task error:', data.error);
      dispatch(setProcessing(false));
      dispatch(setError(data.error));

      // Add error message to chat
      const errorMessage = {
        id: generateId(),
        text: `Error: ${data.error}`,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage(errorMessage));
    });

    // Cleanup on unmount
    return () => {
      console.log('[Socket] Cleaning up connection');
      socketInstance.off(SOCKET_EVENTS.CONNECT);
      socketInstance.off(SOCKET_EVENTS.DISCONNECT);
      socketInstance.off(SOCKET_EVENTS.CONNECT_ERROR);
      socketInstance.off(SOCKET_EVENTS.TASK_STARTED);
      socketInstance.off(SOCKET_EVENTS.AGENT_UPDATED);
      socketInstance.off(SOCKET_EVENTS.AGENT_PROGRESS);
      socketInstance.off(SOCKET_EVENTS.TASK_COMPLETED);
      socketInstance.off(SOCKET_EVENTS.TASK_ERROR);
      socketInstance.close();
    };
  }, [dispatch]);
};

export default useSocketConnection;
