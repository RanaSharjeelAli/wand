import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  agents: [],
  results: null,
  isProcessing: false,
  socket: null,
  error: null,
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    
    clearMessages: (state) => {
      state.messages = [];
    },
    
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    
    setAgents: (state, action) => {
      state.agents = action.payload;
    },
    
    updateAgent: (state, action) => {
      const index = state.agents.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.agents[index] = action.payload;
      }
    },
    
    updateAgentProgress: (state, action) => {
      const { agentId, progress } = action.payload;
      const index = state.agents.findIndex(a => a.id === agentId);
      if (index !== -1) {
        state.agents[index].progress = progress;
      }
    },
    
    clearAgents: (state) => {
      state.agents = [];
    },
    
    setResults: (state, action) => {
      state.results = action.payload;
    },
    
    clearResults: (state) => {
      state.results = null;
    },
    
    setProcessing: (state, action) => {
      state.isProcessing = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    resetTask: (state) => {
      state.messages = [];
      state.agents = [];
      state.results = null;
      state.isProcessing = false;
      state.error = null;
    },
  },
});

export const {
  setSocket,
  addMessage,
  clearMessages,
  setMessages,
  setAgents,
  updateAgent,
  updateAgentProgress,
  clearAgents,
  setResults,
  clearResults,
  setProcessing,
  setError,
  clearError,
  resetTask,
} = taskSlice.actions;

export default taskSlice.reducer;
