// API Configuration
export const API_CONFIG = {
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001',
  SOCKET_OPTIONS: {
    transports: ['websocket'],
    upgrade: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  },
};

// Socket Events
export const SOCKET_EVENTS = {
  // Client to Server
  SUBMIT_TASK: 'submit-task',
  
  // Server to Client
  TASK_STARTED: 'task-started',
  AGENT_UPDATED: 'agent-updated',
  AGENT_PROGRESS: 'agent-progress',
  TASK_COMPLETED: 'task-completed',
  TASK_ERROR: 'task-error',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
};

// UI Constants
export const UI_CONSTANTS = {
  SCROLL_BEHAVIOR: 'smooth',
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
};

// Chart Configuration
export const CHART_CONFIG = {
  COLORS: {
    PRIMARY: 'rgba(33, 150, 243, 0.8)',
    SUCCESS: 'rgba(76, 175, 80, 0.8)',
    WARNING: 'rgba(255, 193, 7, 0.8)',
    INFO: 'rgba(156, 39, 176, 0.8)',
    ERROR: 'rgba(255, 87, 34, 0.8)',
  },
  DEFAULT_HEIGHT: 250,
  DETAILED_HEIGHT: 400,
};
