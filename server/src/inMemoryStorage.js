// SQLite storage for chats - no external installation needed
const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class SQLiteStorage {
  constructor() {
    // Create database file in server directory
    const dbPath = path.join(__dirname, '../data/wand-ai.db');
    this.db = new Database(dbPath);
    
    // Create tables
    this.initDatabase();
    
    console.log('✅ SQLite database initialized at:', dbPath);
  }

  initDatabase() {
    // Create chats table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        userId TEXT DEFAULT 'default-user',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Create messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chatId TEXT NOT NULL,
        text TEXT NOT NULL,
        isUser INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        agents TEXT,
        results TEXT,
        FOREIGN KEY (chatId) REFERENCES chats(id) ON DELETE CASCADE
      )
    `);

    // Create documents table for knowledge base
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        userId TEXT DEFAULT 'default-user',
        filename TEXT NOT NULL,
        mimeType TEXT NOT NULL,
        size INTEGER NOT NULL,
        savedPath TEXT NOT NULL,
        textContent TEXT,
        chunks TEXT,
        summary TEXT,
        uploadedAt TEXT NOT NULL,
        lastAccessedAt TEXT NOT NULL
      )
    `);

    // Create users table for authentication
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);

    // Create indexes for faster queries
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_chats_updatedAt ON chats(updatedAt DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_chatId ON messages(chatId);
      CREATE INDEX IF NOT EXISTS idx_documents_userId ON documents(userId);
      CREATE INDEX IF NOT EXISTS idx_documents_uploadedAt ON documents(uploadedAt DESC);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
  }

  createChat(title, userId = 'default-user') {
    const chatId = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO chats (id, title, userId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(chatId, title, userId, now, now);
    
    return {
      _id: chatId,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now,
      userId: 'default-user'
    };
  }

  findChatById(chatId) {
    const chat = this.db.prepare('SELECT * FROM chats WHERE id = ?').get(chatId);
    
    if (!chat) return null;
    
    const messages = this.db.prepare('SELECT * FROM messages WHERE chatId = ? ORDER BY timestamp ASC').all(chatId);
    
    console.log('[SQLite] Retrieved messages from DB:', messages);
    
    const formattedMessages = messages.map(msg => {
      console.log('[SQLite] Formatting message - text field:', msg.text);
      return {
        id: msg.id,
        text: msg.text,
        isUser: Boolean(msg.isUser),
        timestamp: msg.timestamp,
        agents: msg.agents ? JSON.parse(msg.agents) : [],
        results: msg.results ? JSON.parse(msg.results) : null
      };
    });
    
    console.log('[SQLite] Formatted messages:', formattedMessages);
    
    return {
      _id: chat.id,
      title: chat.title,
      messages: formattedMessages,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      userId: chat.userId
    };
  }

  addMessage(chatId, message) {
    console.log('[SQLite] Adding message to chat:', chatId);
    console.log('[SQLite] Message:', message);
    console.log('[SQLite] Message text:', message.text);
    
    const stmt = this.db.prepare(`
      INSERT INTO messages (id, chatId, text, isUser, timestamp, agents, results)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      message.id,
      chatId,
      message.text,
      message.isUser ? 1 : 0,
      message.timestamp.toISOString ? message.timestamp.toISOString() : message.timestamp,
      message.agents ? JSON.stringify(message.agents) : null,
      message.results ? JSON.stringify(message.results) : null
    );
    
    console.log('[SQLite] Message saved successfully');
    
    // Update chat's updatedAt timestamp
    const updateStmt = this.db.prepare('UPDATE chats SET updatedAt = ? WHERE id = ?');
    updateStmt.run(new Date().toISOString(), chatId);
    
    return this.findChatById(chatId);
  }

  getAllChats(limit = 20, page = 1, userId = 'default-user') {
    const offset = (page - 1) * limit;
    
    const chats = this.db.prepare(`
      SELECT * FROM chats 
      WHERE userId = ?
      ORDER BY updatedAt DESC 
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset);
    
    const total = this.db.prepare('SELECT COUNT(*) as count FROM chats WHERE userId = ?').get(userId).count;
    
    // Get message count for each chat
    const chatsWithMessages = chats.map(chat => {
      const messages = this.db.prepare('SELECT * FROM messages WHERE chatId = ? ORDER BY timestamp ASC').all(chat.id);
      
      return {
        _id: chat.id,
        title: chat.title,
        messages: messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          isUser: Boolean(msg.isUser),
          timestamp: msg.timestamp,
          agents: msg.agents ? JSON.parse(msg.agents) : [],
          results: msg.results ? JSON.parse(msg.results) : null
        })),
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      };
    });
    
    return {
      chats: chatsWithMessages,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  deleteChat(chatId) {
    // Delete messages first (cascade should handle this, but being explicit)
    this.db.prepare('DELETE FROM messages WHERE chatId = ?').run(chatId);
    
    // Delete chat
    const result = this.db.prepare('DELETE FROM chats WHERE id = ?').run(chatId);
    
    return result.changes > 0;
  }

  searchChats(query) {
    const chats = this.db.prepare(`
      SELECT DISTINCT c.* FROM chats c
      LEFT JOIN messages m ON c.id = m.chatId
      WHERE c.title LIKE ? OR m.text LIKE ?
      ORDER BY c.updatedAt DESC
    `).all(`%${query}%`, `%${query}%`);
    
    return chats.map(chat => {
      const messages = this.db.prepare('SELECT * FROM messages WHERE chatId = ? ORDER BY timestamp ASC').all(chat.id);
      
      return {
        _id: chat.id,
        title: chat.title,
        messages: messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          isUser: Boolean(msg.isUser),
          timestamp: msg.timestamp,
          agents: msg.agents ? JSON.parse(msg.agents) : [],
          results: msg.results ? JSON.parse(msg.results) : null
        })),
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      };
    });
  }

  generateTitle(firstMessage) {
    if (!firstMessage || typeof firstMessage !== 'string') {
      return 'New Conversation';
    }
    const text = firstMessage.substring(0, 50);
    return text.length < firstMessage.length ? `${text}...` : text;
  }

  // Document Management Methods
  addDocument(document) {
    const stmt = this.db.prepare(`
      INSERT INTO documents (id, userId, filename, mimeType, size, savedPath, textContent, chunks, summary, uploadedAt, lastAccessedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      document.id,
      document.userId || 'default-user',
      document.filename,
      document.mimeType,
      document.size,
      document.savedPath,
      document.textContent,
      JSON.stringify(document.chunks),
      document.summary,
      document.uploadedAt,
      document.lastAccessedAt
    );

    return document;
  }

  getDocument(docId) {
    const doc = this.db.prepare('SELECT * FROM documents WHERE id = ?').get(docId);
    
    if (!doc) return null;
    
    return {
      id: doc.id,
      userId: doc.userId,
      filename: doc.filename,
      mimeType: doc.mimeType,
      size: doc.size,
      savedPath: doc.savedPath,
      textContent: doc.textContent,
      chunks: doc.chunks ? JSON.parse(doc.chunks) : [],
      summary: doc.summary,
      uploadedAt: doc.uploadedAt,
      lastAccessedAt: doc.lastAccessedAt
    };
  }

  getUserDocuments(userId = 'default-user') {
    const docs = this.db.prepare('SELECT * FROM documents WHERE userId = ? ORDER BY uploadedAt DESC').all(userId);
    
    return docs.map(doc => ({
      id: doc.id,
      userId: doc.userId,
      filename: doc.filename,
      mimeType: doc.mimeType,
      size: doc.size,
      savedPath: doc.savedPath,
      textContent: doc.textContent,
      chunks: doc.chunks ? JSON.parse(doc.chunks) : [],
      summary: doc.summary,
      uploadedAt: doc.uploadedAt,
      lastAccessedAt: doc.lastAccessedAt
    }));
  }

  deleteDocument(docId) {
    const result = this.db.prepare('DELETE FROM documents WHERE id = ?').run(docId);
    return result.changes > 0;
  }

  updateDocumentAccess(docId) {
    const stmt = this.db.prepare('UPDATE documents SET lastAccessedAt = ? WHERE id = ?');
    stmt.run(new Date().toISOString(), docId);
  }

  // User Management Methods
  createUser(user) {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, password, createdAt)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(user.id, user.email, user.password, user.createdAt);
    return user;
  }

  findUserByEmail(email) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  findUserById(userId) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(userId);
  }

  close() {
    this.db.close();
  }
}

// Export singleton instance
module.exports = new SQLiteStorage();
