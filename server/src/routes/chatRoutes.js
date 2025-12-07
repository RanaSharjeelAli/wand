const express = require('express');
const router = express.Router();
const exportService = require('../services/exportService');
const sqliteStorage = require('../inMemoryStorage');

// Middleware to extract userId (will be set by auth middleware or default)
const ensureUserId = (req, res, next) => {
  // If authenticated, use the userId from req.user, otherwise use default
  req.userId = req.user?.userId || 'default-user';
  next();
};

router.use(ensureUserId);

// Create new chat or add message to existing chat
router.post('/', async (req, res) => {
  try {
    const { chatId, message, agents, results } = req.body;

    if (chatId) {
      // Add message to existing chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      chat.messages.push({ ...message, agents, results });
      chat.updatedAt = new Date();
      await chat.save();

      return res.json(chat);
    } else {
      // Create new chat with title from first message
      const title = Chat.generateTitle(message.text);
      const newChat = new Chat({
        title,
        messages: [{ ...message, agents, results }]
      });

      await newChat.save();
      return res.status(201).json(newChat);
    }
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all chats (paginated)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = sqliteStorage.getAllChats(parseInt(limit), parseInt(page), req.userId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching chats:', error);
    // Return empty array if error
    res.json({
      chats: [],
      totalPages: 0,
      currentPage: 1,
      total: 0
    });
  }
});

// Search chats
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const chats = sqliteStorage.searchChats(q);
    res.json({ chats, query: q });
  } catch (error) {
    console.error('Error searching chats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single chat by ID
router.get('/:id', async (req, res) => {
  try {
    const chat = sqliteStorage.findChatById(req.params.id);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update chat title
router.put('/:id/title', async (req, res) => {
  try {
    const { title } = req.body;

    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { title, updatedAt: new Date() },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error updating chat title:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete chat
router.delete('/:id', async (req, res) => {
  try {
    const deleted = sqliteStorage.deleteChat(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ message: 'Chat deleted successfully', chatId: req.params.id });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: error.message });
  }
});

// Link document to chat
router.post('/:id/documents', async (req, res) => {
  try {
    const { documentId } = req.body;

    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (!chat.documentIds.includes(documentId)) {
      chat.documentIds.push(documentId);
      await chat.save();
    }

    res.json(chat);
  } catch (error) {
    console.error('Error linking document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export chat as PDF or DOCX
router.get('/:id/export', async (req, res) => {
  try {
    const { format = 'pdf' } = req.query;

    if (!['pdf', 'docx'].includes(format)) {
      return res.status(400).json({ error: 'Format must be pdf or docx' });
    }

    const chat = sqliteStorage.findChatById(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const exportPath = exportService.getTempExportPath(req.params.id, format);

    if (format === 'pdf') {
      await exportService.exportChatToPDF(chat, exportPath);
    } else {
      await exportService.exportChatToDOCX(chat, exportPath);
    }

    // Send file and cleanup after
    res.download(exportPath, `chat-${chat.title.substring(0, 30)}.${format}`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up file after download
      require('fs').unlink(exportPath, () => {});
    });

    // Clean up old exports in background
    exportService.cleanupOldExports().catch(console.error);
  } catch (error) {
    console.error('Error exporting chat:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
