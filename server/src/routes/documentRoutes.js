const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const Document = require('../models/Document');
const { OllamaService } = require('../ollamaService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|docx|doc|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, DOC, and TXT files are allowed'));
    }
  }
});

// Extract text from uploaded file
async function extractTextFromFile(filePath, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      return {
        text: data.text,
        pageCount: data.numpages
      };
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               mimeType === 'application/msword') {
      const result = await mammoth.extractRawText({ path: filePath });
      return {
        text: result.value,
        pageCount: null
      };
    } else if (mimeType === 'text/plain') {
      const text = await fs.readFile(filePath, 'utf-8');
      return {
        text: text,
        pageCount: null
      };
    }
    throw new Error('Unsupported file type');
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
}

// Upload document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from document
    const { text, pageCount } = await extractTextFromFile(req.file.path, req.file.mimetype);

    // Generate summary using Ollama
    const ollamaService = new OllamaService();
    let summary = '';
    try {
      const isAvailable = await ollamaService.checkOllamaAvailability();
      if (isAvailable) {
        summary = await ollamaService.generateDocumentSummary(text);
      }
    } catch (err) {
      console.log('Ollama not available for summary generation');
    }

    // Create document record
    const document = new Document({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      content: text,
      path: req.file.path,
      metadata: {
        pageCount,
        wordCount: text.split(/\s+/).filter(w => w.length > 0).length
      },
      summary: summary || text.substring(0, 200) + '...'
    });

    await document.save();

    res.status(201).json({
      id: document._id,
      filename: document.originalName,
      size: document.size,
      wordCount: document.metadata.wordCount,
      summary: document.summary
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    // Clean up file if database save fails
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    res.status(500).json({ error: error.message });
  }
});

// Get all documents
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const documents = await Document.find()
      .sort({ uploadedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content') // Don't send full content
      .lean();

    const count = await Document.countDocuments();

    res.json({
      documents,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search documents (knowledge base search)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    // Full-text search
    const documents = await Document.find({
      $text: { $search: q }
    }, {
      score: { $meta: 'textScore' }
    })
      .sort({ score: { $meta: 'textScore' } })
      .limit(10)
      .lean();

    // Generate AI answer from documents
    const ollamaService = new OllamaService();
    let answer = '';
    let completenessCheck = null;
    let enrichmentSuggestions = [];

    try {
      const isAvailable = await ollamaService.checkOllamaAvailability();
      if (isAvailable && documents.length > 0) {
        // Combine document contents
        const context = documents.map(doc => doc.content).join('\n\n');
        
        // Generate answer
        answer = await ollamaService.generateAnswerFromDocuments(q, context);
        
        // Check completeness
        completenessCheck = await ollamaService.checkAnswerCompleteness(q, answer, context);
        
        // Generate enrichment suggestions if incomplete
        if (completenessCheck.isIncomplete) {
          enrichmentSuggestions = await ollamaService.generateEnrichmentSuggestions(q, answer, completenessCheck.missingInfo);
        }
      }
    } catch (err) {
      console.log('Error generating AI answer:', err.message);
    }

    res.json({
      query: q,
      documents: documents.map(doc => ({
        id: doc._id,
        title: doc.originalName,
        summary: doc.summary,
        relevanceScore: doc.score,
        excerpt: doc.content.substring(0, 300) + '...'
      })),
      answer,
      completenessCheck,
      enrichmentSuggestions,
      totalResults: documents.length
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single document
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).lean();

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from filesystem
    await fs.unlink(document.path).catch(console.error);

    // Delete from database
    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
