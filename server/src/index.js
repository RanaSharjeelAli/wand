const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const { TaskManager } = require('./agents');
const { taskRoutes } = require('./routes');
const { OllamaService } = require('./ollamaService');
const chatRoutes = require('./routes/chatRoutes');
const documentRoutes = require('./documentRoutes');
const authRoutes = require('./routes/authRoutes');
const AuthService = require('./authService');
const sqliteStorage = require('./inMemoryStorage'); // SQLite storage

// Initialize authentication service
const authService = new AuthService(sqliteStorage);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads and exports directories
const uploadsDir = path.join(__dirname, '../uploads');
const exportsDir = path.join(__dirname, '../exports');
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes(authService)); // Auth routes (public)
app.use('/api/tasks', taskRoutes);
app.use('/api/chats', authService.authenticateRequest.bind(authService), chatRoutes);
app.use('/api/documents', authService.authenticateRequest.bind(authService), documentRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Extract userId from socket handshake (sent from client)
  const token = socket.handshake.auth?.token;
  let userId = 'default-user';
  
  if (token) {
    const verification = authService.verifyToken(token);
    if (verification.valid) {
      userId = verification.userId;
      console.log('✅ Authenticated socket connection for user:', userId, verification.email);
    } else {
      console.log('⚠️ Invalid token for socket connection');
    }
  } else {
    console.log('⚠️ No token provided for socket connection, using default-user');
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('submit-task', async (taskData) => {
    try {
      const taskId = uuidv4();
      // Pass sqliteStorage to TaskManager for document access
      const taskManager = new TaskManager(io, taskId, sqliteStorage);
      
      // Get the user's question from either 'request' or 'question' field
      const userQuestion = taskData.request || taskData.question || '';
      
      if (!userQuestion) {
        socket.emit('task-error', { error: 'No question provided' });
        return;
      }
      
      // Save to SQLite database
      let chatId = taskData.chatId;
      let chat = null;
      
      if (chatId) {
        // Existing chat - get it
        chat = sqliteStorage.findChatById(chatId);
      }
      
      if (!chat) {
        // New chat - create with auto-generated title
        const title = sqliteStorage.generateTitle(userQuestion);
        console.log(`📝 Creating new chat with userId: ${userId}, title: ${title}`);
        chat = sqliteStorage.createChat(title, userId);
        console.log(`✅ Chat created with ID: ${chat._id}`);
      }
      
      // Add user message
      const userMessage = {
        id: uuidv4(),
        text: userQuestion,
        isUser: true,
        timestamp: new Date()
      };
      
      chat = sqliteStorage.addMessage(chat._id, userMessage);
      
      // Send chatId back to client
      socket.emit('chat-created', { 
        chatId: chat._id,
        title: chat.title 
      });
      
      // Process task with the correct field name and userId
      const processData = { 
        ...taskData, 
        question: userQuestion,
        request: userQuestion,
        userId: userId  // Use authenticated userId from socket
      };
      
      // Process task and save AI response
      taskManager.processTask(processData).then(async (results) => {
        console.log('Task results:', results);
        console.log('Results summary:', results.summary);
        
        // Add AI response to chat
        const aiMessage = {
          id: uuidv4(),
          text: results.summary || 'Task completed successfully',
          isUser: false,
          timestamp: new Date(),
          agents: results.agents || [],
          results: results
        };
        
        console.log('AI message being saved:', aiMessage);
        sqliteStorage.addMessage(chat._id, aiMessage);
        console.log('AI message saved to database');
        
        // Emit completion
        socket.emit('chat-updated', {
          chatId: chat._id,
          message: aiMessage
        });
      }).catch(async (error) => {
        console.error('Task processing error:', error);
        
        // Save error message
        const errorMessage = {
          id: uuidv4(),
          text: `Error: ${error.message}`,
          isUser: false,
          timestamp: new Date(),
          agents: [],
          results: { error: error.message }
        };
        
        sqliteStorage.addMessage(chat._id, errorMessage);
      });
      
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