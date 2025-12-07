const express = require('express');
const multer = require('multer');
const { DocumentService } = require('./documentService');
const sqliteStorage = require('./inMemoryStorage');

const router = express.Router();

// Middleware to extract userId (will be set by auth middleware)
const ensureUserId = (req, res, next) => {
  req.userId = req.user?.userId || 'default-user';
  next();
};

router.use(ensureUserId);

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only specific file types
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

// Initialize document service
const documentService = new DocumentService(sqliteStorage);

/**
 * POST /api/documents/upload
 * Upload one or multiple documents
 */
router.post('/upload', upload.array('documents', 10), async (req, res) => {
  try {
    const userId = req.userId; // Use authenticated userId
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const results = [];
    const errors = [];
    
    // Process each file
    for (const file of req.files) {
      try {
        const result = await documentService.processDocument(file, userId);
        results.push(result);
      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error);
        errors.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      uploaded: results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully uploaded ${results.length} of ${req.files.length} documents`
    });
    
  } catch (error) {
    console.error('[Documents API] Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/documents/search
 * Search documents with natural language query
 */
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.userId; // Use authenticated userId
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const result = await documentService.searchDocuments(query, userId);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('[Documents API] Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/documents
 * Get all documents for a user
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.userId; // Use authenticated userId
    
    const documents = documentService.getAllDocuments(userId);
    
    res.json({
      success: true,
      documents,
      total: documents.length
    });
    
  } catch (error) {
    console.error('[Documents API] List error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/documents/:id
 * Delete a document
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // Use authenticated userId
    
    await documentService.deleteDocument(id, userId);
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
    
  } catch (error) {
    console.error('[Documents API] Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/documents/:id
 * Get document details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || 'default-user';
    
    const document = sqliteStorage.getDocument(id);
    
    if (!document || document.userId !== userId) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json({
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        summary: document.summary,
        size: document.size,
        uploadedAt: document.uploadedAt,
        mimeType: document.mimeType
      }
    });
    
  } catch (error) {
    console.error('[Documents API] Get error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
