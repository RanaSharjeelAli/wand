const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const { TaskManager } = require('./agents');
const { taskRoutes } = require('./routes');
const { OllamaService } = require('./ollamaService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('submit-task', async (taskData) => {
    try {
      const taskId = uuidv4();
      const taskManager = new TaskManager(io, taskId);
      
      // Start task processing
      taskManager.processTask(taskData);
    } catch (error) {
      socket.emit('task-error', { error: error.message });
    }
  });
});

// Check Ollama availability on startup
const ollamaService = new OllamaService();
ollamaService.checkAvailability().then(status => {
  if (status.available) {
    console.log(`✅ Ollama is available at ${ollamaService.baseURL}`);
    console.log(`📦 Using model: ${ollamaService.model}`);
    if (status.models && status.models.length > 0) {
      console.log(`📋 Available models: ${status.models.map(m => m.name).join(', ')}`);
    }
  } else {
    console.warn(`⚠️  Ollama is not available at ${ollamaService.baseURL}`);
    console.warn(`   Error: ${status.error}`);
    console.warn(`   The system will use fallback responses.`);
    console.warn(`   To use Ollama, make sure it's running: ollama serve`);
  }
}).catch(err => {
  console.warn(`⚠️  Could not check Ollama availability: ${err.message}`);
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});